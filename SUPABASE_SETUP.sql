-- ============================================================
-- SCHOLR — Supabase Database Setup Script
-- Paste this entire script into your Supabase SQL Editor and run it once
-- ============================================================


-- ============================================================
-- 1. TABLES
-- ============================================================

CREATE TABLE profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name     TEXT NOT NULL,
  email         TEXT NOT NULL,
  role          TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'class_rep', 'admin')),
  college       TEXT,
  department    TEXT,
  programme     TEXT,
  level         TEXT,
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE files (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  course_code     TEXT NOT NULL,
  description     TEXT,
  college         TEXT NOT NULL,
  department      TEXT NOT NULL,
  programme       TEXT NOT NULL,
  level           TEXT NOT NULL,
  semester        TEXT NOT NULL,
  file_type       TEXT NOT NULL,
  file_url        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  tags            TEXT[],
  downloads       INTEGER DEFAULT 0,
  -- text_content stores extracted text from PDF, DOCX, TXT at upload time.
  -- NULL means extraction was not possible (e.g. image files).
  -- AI routes use this instead of re-fetching and re-parsing the file on every request.
  text_content    TEXT,
  uploaded_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploader_name   TEXT,
  uploader_role   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE books (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title           TEXT NOT NULL,
  author          TEXT,
  description     TEXT,
  college         TEXT NOT NULL,
  department      TEXT NOT NULL,
  subject         TEXT,
  file_url        TEXT NOT NULL,
  storage_path    TEXT NOT NULL,
  cover_url       TEXT,
  downloads       INTEGER DEFAULT 0,
  -- text_content for books — same pattern as files
  text_content    TEXT,
  uploaded_by     UUID REFERENCES profiles(id) ON DELETE SET NULL,
  uploader_name   TEXT,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discussion_threads (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content     TEXT NOT NULL,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE discussion_replies (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  thread_id     UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  content       TEXT NOT NULL,
  is_helpful    BOOLEAN DEFAULT FALSE,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE bookmarks (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, file_id)
);

CREATE TABLE notifications (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  message     TEXT NOT NULL,
  link        TEXT,
  is_read     BOOLEAN DEFAULT FALSE,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);


-- ============================================================
-- 2. INDEXES
-- Critical for performance as data grows
-- ============================================================

CREATE INDEX idx_files_programme_level  ON files(programme, level);
CREATE INDEX idx_files_uploaded_by      ON files(uploaded_by);
CREATE INDEX idx_files_college_dept     ON files(college, department);
CREATE INDEX idx_files_created_at       ON files(created_at DESC);
CREATE INDEX idx_books_college_dept     ON books(college, department);
CREATE INDEX idx_books_uploaded_by      ON books(uploaded_by);
CREATE INDEX idx_threads_file_id        ON discussion_threads(file_id);
CREATE INDEX idx_replies_thread_id      ON discussion_replies(thread_id);
CREATE INDEX idx_bookmarks_user_id      ON bookmarks(user_id);
CREATE INDEX idx_bookmarks_file_id      ON bookmarks(file_id);
CREATE INDEX idx_notifications_user_id  ON notifications(user_id);
CREATE INDEX idx_notifications_unread   ON notifications(user_id, is_read) WHERE is_read = FALSE;


-- ============================================================
-- 3. ENABLE ROW LEVEL SECURITY
-- ============================================================

ALTER TABLE profiles             ENABLE ROW LEVEL SECURITY;
ALTER TABLE files                ENABLE ROW LEVEL SECURITY;
ALTER TABLE books                ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_threads   ENABLE ROW LEVEL SECURITY;
ALTER TABLE discussion_replies   ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookmarks            ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications        ENABLE ROW LEVEL SECURITY;


-- ============================================================
-- 4. RLS POLICIES
-- NOTE: role value is 'class_rep' — not 'class_repe' (easy typo to make)
-- ============================================================

-- PROFILES
CREATE POLICY "profiles_select_authenticated"
  ON profiles FOR SELECT TO authenticated USING (true);
CREATE POLICY "profiles_insert_own"
  ON profiles FOR INSERT TO authenticated WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own"
  ON profiles FOR UPDATE TO authenticated USING (auth.uid() = id);

-- FILES
CREATE POLICY "files_select_authenticated"
  ON files FOR SELECT TO authenticated USING (true);
CREATE POLICY "files_insert_uploader"
  ON files FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lecturer', 'class_rep', 'admin')
  );
CREATE POLICY "files_update_own"
  ON files FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "files_delete_own_or_admin"
  ON files FOR DELETE TO authenticated
  USING (
    auth.uid() = uploaded_by OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- BOOKS
CREATE POLICY "books_select_authenticated"
  ON books FOR SELECT TO authenticated USING (true);
CREATE POLICY "books_insert_uploader"
  ON books FOR INSERT TO authenticated
  WITH CHECK (
    auth.uid() = uploaded_by AND
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lecturer', 'class_rep', 'admin')
  );
CREATE POLICY "books_update_own"
  ON books FOR UPDATE TO authenticated USING (auth.uid() = uploaded_by);
CREATE POLICY "books_delete_own_or_admin"
  ON books FOR DELETE TO authenticated
  USING (
    auth.uid() = uploaded_by OR
    (SELECT role FROM profiles WHERE id = auth.uid()) = 'admin'
  );

-- DISCUSSION THREADS
CREATE POLICY "threads_select_authenticated"
  ON discussion_threads FOR SELECT TO authenticated USING (true);
CREATE POLICY "threads_insert_authenticated"
  ON discussion_threads FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "threads_delete_own"
  ON discussion_threads FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- DISCUSSION REPLIES
CREATE POLICY "replies_select_authenticated"
  ON discussion_replies FOR SELECT TO authenticated USING (true);
CREATE POLICY "replies_insert_authenticated"
  ON discussion_replies FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "replies_update_helpful_or_own"
  ON discussion_replies FOR UPDATE TO authenticated
  USING (
    auth.uid() = user_id OR
    (SELECT role FROM profiles WHERE id = auth.uid()) IN ('lecturer', 'class_rep', 'admin')
  );
CREATE POLICY "replies_delete_own"
  ON discussion_replies FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- BOOKMARKS
CREATE POLICY "bookmarks_select_own"
  ON bookmarks FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "bookmarks_insert_own"
  ON bookmarks FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "bookmarks_delete_own"
  ON bookmarks FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- NOTIFICATIONS
CREATE POLICY "notifications_select_own"
  ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "notifications_update_own"
  ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);


-- ============================================================
-- 5. AUTO-CREATE PROFILE ON SIGNUP TRIGGER
-- ============================================================

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role, college, department, programme, level)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'full_name', 'Unknown'),
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'role', 'student'),
    NEW.raw_user_meta_data->>'college',
    NEW.raw_user_meta_data->>'department',
    NEW.raw_user_meta_data->>'programme',
    NEW.raw_user_meta_data->>'level'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- ============================================================
-- 6. NOTIFICATION TRIGGERS
-- Runs in the database automatically — no application loop needed
-- Much more reliable and efficient than looping in application code
-- ============================================================

-- Notify matching users when a new file is uploaded
CREATE OR REPLACE FUNCTION public.notify_on_file_upload()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.notifications (user_id, message, link)
  SELECT
    p.id,
    'New material uploaded: ' || NEW.title || ' (' || NEW.course_code || ')',
    '/file/' || NEW.id
  FROM public.profiles p
  WHERE
    p.programme = NEW.programme
    AND p.level = NEW.level
    AND p.id != NEW.uploaded_by;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_file_uploaded
  AFTER INSERT ON files
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_file_upload();


-- Notify thread author when someone replies
CREATE OR REPLACE FUNCTION public.notify_on_reply()
RETURNS TRIGGER AS $$
DECLARE
  v_thread_author UUID;
  v_file_id       UUID;
BEGIN
  SELECT user_id, file_id INTO v_thread_author, v_file_id
  FROM public.discussion_threads
  WHERE id = NEW.thread_id;

  IF v_thread_author IS DISTINCT FROM NEW.user_id THEN
    INSERT INTO public.notifications (user_id, message, link)
    VALUES (
      v_thread_author,
      'Someone replied to your discussion thread',
      '/file/' || v_file_id
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_reply_created
  AFTER INSERT ON discussion_replies
  FOR EACH ROW EXECUTE FUNCTION public.notify_on_reply();


-- ============================================================
-- 7. DOWNLOAD COUNT FUNCTIONS
-- Called from /api/download/[fileId] server route
-- Atomic increment prevents race conditions from concurrent downloads
-- ============================================================

CREATE OR REPLACE FUNCTION public.increment_file_downloads(p_file_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE files SET downloads = downloads + 1 WHERE id = p_file_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.increment_book_downloads(p_book_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE books SET downloads = downloads + 1 WHERE id = p_book_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- ============================================================
-- 8. STORAGE BUCKETS
-- Files must be uploaded under path: {userId}/{filename}
-- This ensures the delete policy correctly matches ownership
-- ============================================================

INSERT INTO storage.buckets (id, name, public)
  VALUES ('course-materials', 'course-materials', true)
  ON CONFLICT (id) DO NOTHING;

INSERT INTO storage.buckets (id, name, public)
  VALUES ('library-books', 'library-books', true)
  ON CONFLICT (id) DO NOTHING;

CREATE POLICY "course_materials_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'course-materials');

CREATE POLICY "course_materials_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'course-materials');

CREATE POLICY "course_materials_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'course-materials' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "library_books_upload"
  ON storage.objects FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'library-books');

CREATE POLICY "library_books_read"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'library-books');

CREATE POLICY "library_books_delete_own"
  ON storage.objects FOR DELETE TO authenticated
  USING (
    bucket_id = 'library-books' AND
    auth.uid()::text = (storage.foldername(name))[1]
  );


-- ============================================================
-- DONE.
-- Tables, indexes, RLS, triggers, functions, and storage ready.
-- Move to Step 2 in WINDSURF_PROMPTS.md
-- ============================================================
