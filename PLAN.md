# PLAN.md — Step-by-Step Build Roadmap
# Scholr

---

## How To Use This Document

Work through **one step at a time**. Do not begin a new step until the current step is complete, tested, and confirmed working. After each step, check every item in the completion checklist before moving on.

**Rule:** If a step introduces a bug or breaks something from a previous step, fix it before continuing. Never carry broken code forward.

---

## Phase 1 — Foundation

### Step 1: Project Setup
- Initialise Next.js 15 project with TypeScript and App Router
- Install and configure Tailwind CSS
- Install and initialise shadcn/ui
- Install Lucide React and Framer Motion
- Install `@supabase/supabase-js` and `@supabase/ssr`
- Install `@google/generative-ai` and `mammoth`
- Create `.env.local` with Supabase URL, Supabase Anon Key, and Gemini API key
- Create the full folder structure as defined in ARCHITECTURE.md (empty placeholder files are fine)
- Create `types/index.ts` with all TypeScript interfaces: `UserProfile`, `FileRecord`, `BookRecord`, `DiscussionThread`, `DiscussionReply`, `Bookmark`, `Notification`
- Create `constants/index.ts` with MTU colleges, departments, programmes, levels, semesters, and allowed file types
- ✅ Done when: project runs on localhost with no TypeScript or build errors

### Step 2: Supabase Setup
- Create all tables in Supabase SQL Editor exactly as defined in ARCHITECTURE.md: `profiles`, `files`, `books`, `discussion_threads`, `discussion_replies`, `bookmarks`, `notifications`
- Enable RLS on every table
- Write and apply all RLS policies as described in AI_RULES.md
- Create `course-materials` storage bucket (files) and `library-books` storage bucket (books) — both with appropriate public read policies
- Create `lib/supabase/client.ts` (browser client) and `lib/supabase/server.ts` (server client)
- Create `middleware.ts` for session refresh on every request
- ✅ Done when: all tables exist with RLS on, both storage buckets are ready

### Step 3: Authentication & Profiles
- Build `/login` page — email + password form using shadcn/ui components
- Build `/signup` page — email, password, full name, role selection (Student / Lecturer / Class Rep), college, department, programme, level
- On signup: create auth user → insert profile row into `profiles` table in a single flow
- Create `hooks/useUser.ts` — returns current session, profile, and role
- Create `AuthGuard.tsx` — redirects unauthenticated users to `/login`
- Create `RoleGuard.tsx` — accepts allowed roles as props, redirects if user's role is not in the list
- Create route group layouts: `(auth)` with no navbar, `(main)` with navbar and AuthGuard
- ✅ Done when: all three roles can sign up, log in, and be redirected to their dashboard

---

## Phase 2 — Core File Features

### Step 4: Shared Reusable Components
Build these first so they are available for all subsequent steps:
- `EmptyState.tsx` — icon, heading, subtext, optional action button
- `LoadingSkeleton.tsx` — card and list skeleton variants
- `SearchBar.tsx` — controlled input with search icon and clear button
- `FilterPanel.tsx` — dropdowns for college, department, programme, level, semester
- `BookmarkButton.tsx` — icon-only button, filled when bookmarked, outlined when not
- `NotificationBell.tsx` — bell icon with unread count badge
- `Navbar.tsx` — logo left, nav links, notification bell, user role indicator, logout
- ✅ Done when: all shared components render correctly with mock props

### Step 5: File Upload
- Install `pdf-parse`: `npm install pdf-parse @types/pdf-parse`
- Create `lib/extractText.ts`:
  - `extractTextFromFile(file: File): Promise<string | null>`
  - PDF → use `pdf-parse`, return extracted text string
  - DOCX → use `mammoth.extractRawText()`, return text string
  - TXT → read buffer as UTF-8 string directly
  - PNG, JPG, PPTX → return `null` (AI uses fallback for these)
  - Wrap in try/catch — if extraction fails return `null`, never crash the upload
- Build `FileUploadForm.tsx` — all metadata fields + file picker with drag-and-drop
- Client-side validation: required fields, file type (PDF, DOCX, PPTX, PNG, JPG, TXT), file size max 50MB
- Storage path must follow `{userId}/{filename}` format — required for delete RLS policy to work correctly
- On submit flow (in order):
  1. Upload file to Supabase Storage under `{userId}/{filename}` — get public URL
  2. Show "Processing file for AI..." toast — extract text using `extractTextFromFile()`
  3. Insert into `files` table with all metadata including `text_content` (may be null for images)
  4. If database insert fails after storage upload — delete the orphaned file from storage before returning error
- Server-side MIME type validation — do not rely on client-side extension check alone
- Build `/upload` page — wrapped in `RoleGuard` for Lecturer and Class Rep only
- If `text_content` is null after upload, show info toast: "File uploaded. AI features may be limited for this file type."
- ✅ Done when: a PDF, DOCX, and TXT file can be uploaded and `text_content` is correctly populated in the database for each

### Step 6: Browse & Search
- Create `hooks/useFiles.ts` — fetch files with optional filters: college, department, programme, level, semester, search query (matches title or course_code), sort order, page number, and page size (20 per page). Use Supabase `.range()` for server-side pagination — never fetch all files at once
- `useFiles` returns `{ data, loading, error, total, page }` — total is needed for pagination UI
- Debounce the search input by 400ms to avoid excessive API calls on every keystroke
- Build `FileCard.tsx` — title, course code, department, level, file type, uploader name, download count, BookmarkButton
- Build `FileGrid.tsx` — responsive grid of FileCards with LoadingSkeleton while loading, EmptyState when no results, and pagination controls at the bottom
- Build `/browse` page — SearchBar + FilterPanel + FileGrid
- ✅ Done when: users can search and filter files, results are paginated, and search is debounced

### Step 7: File Detail Page
- Build `/file/[id]` page — fetch single file record from Supabase by ID
- Build `FileDetail.tsx` — displays all metadata: title, course code, description, college, department, programme, level, semester, uploader name, uploader role, upload date, file type, download count
- Build `FilePreview.tsx` — renders an iframe for PDF files. For other file types show a message saying preview is not available with a download button
- Create `/api/download/[fileId]` server route — increments the downloads count atomically using the `increment_file_downloads` database function, then returns the file URL for redirect. Never increment from the client directly — bots and page refreshes would inflate counts
- Download button calls this API route, not the file URL directly
- ✅ Done when: clicking a FileCard opens the correct detail page with metadata, preview, and working download

### Step 8: Manage Files
- Build `ManageFilesTable.tsx` — table of the current uploader's own files, showing title, course code, level, downloads, upload date, and a delete button
- Build `/manage` page — wrapped in `RoleGuard` for Lecturer and Class Rep
- Delete file: removes from Supabase Storage AND deletes the database row
- Show confirmation dialog before deletion
- ✅ Done when: Lecturer/Class Rep can view and delete their own files

---

## Phase 3 — AI Features

### Step 9: Gemini Integration (Backend)
- Create `lib/gemini.ts`:
  - Gemini client initialisation using `gemini-1.5-flash`
  - `callGeminiWithText(textContent: string, prompt: string)` — sends plain text + prompt to Gemini, returns response. This is the primary function used by both routes
  - `callGeminiWithFile(fileUrl: string, mimeType: string, prompt: string)` — fallback for image files. Validates URL with strict regex before fetching. Converts to base64 inline part
  - `validateFileUrl(url)` — strict regex: `/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//`. Use regex match not `.includes()`
  - `getMimeType(fileUrl)` — maps file extension to MIME type
- Create `app/api/ai/chat/route.ts`:
  - Accepts: `{ fileId, question, chatHistory }` — accepts fileId, NOT a raw URL from the client
  - Fetches the file record from the database by ID using the server-side Supabase client
  - If `text_content` is available: call `callGeminiWithText(text_content, prompt)` — fast path
  - If `text_content` is null (image): call `callGeminiWithFile(file_url, file_type, prompt)` — fallback path
  - System prompt must include: "If the answer is not found in the document, say clearly that you don't know. Never guess or fabricate an answer."
  - Wrap Gemini call in 9 second timeout
  - Never expose raw errors to client — log server-side, return friendly message
  - Returns `{ answer }`
- Create `app/api/ai/quiz/route.ts`:
  - Accepts: `{ fileId, numberOfQuestions, difficulty }` — accepts fileId, NOT a raw URL
  - Same database fetch + text_content / fallback pattern as chat route
  - Quiz prompt must demand ONLY a JSON array — no markdown, no code fences, no extra text
  - Include the exact expected structure as an example in the prompt
  - Required per question: `{ "question": "", "options": ["A.", "B.", "C.", "D."], "answer": "A.", "explanation": "" }`
  - Strip code fences before JSON.parse, wrap in try/catch
  - Validate structure before returning — array, 4 options per question, all fields present
  - Returns `{ questions }`
- ✅ Done when: both routes work with a real PDF, DOCX, TXT, and image file — test the text_content fast path and the image fallback path separately

### Step 10: Study Assistant UI
- Build `StudyAssistant.tsx` — scrollable chat, message history, input bar, send button
- Loading state: spinner in the chat while waiting for response
- Error state: error message in the chat bubble
- Add to `/file/[id]` page below the file preview
- ✅ Done when: student can have a multi-turn conversation about a real uploaded document

### Step 11: Quiz Generator UI
- Build `QuizGenerator.tsx` — settings (number of questions, difficulty), question list, answer selection, submit, score display with explanations
- Loading state: skeleton while quiz is generating
- Error state: friendly message if Gemini or JSON parse fails
- Add to `/file/[id]` page alongside Study Assistant in a tab switcher
- ✅ Done when: student can generate and complete a quiz from a real uploaded document

---

## Phase 4 — Community & Engagement

### Step 12: Community Discussion
- Create `hooks/useDiscussion.ts` — fetch threads and replies for a file, add thread, add reply, delete thread, delete reply, mark reply as helpful
- Build `ThreadCard.tsx` — shows poster name, role, content, timestamp, reply count, mark helpful button (Lecturer/Class Rep only), delete button (own posts only)
- Build `ReplyCard.tsx` — shows replier name, content, timestamp, helpful badge if marked, delete button (own replies only)
- Build `DiscussionSection.tsx` — list of ThreadCards, each expandable to show ReplyCards, new thread form, new reply form per thread
- Add to `/file/[id]` page below the AI section
- ✅ Done when: users can post threads, reply, mark helpful, and delete their own content

### Step 13: Bookmarks
- Create `hooks/useBookmarks.ts` — add bookmark, remove bookmark, check if a file is bookmarked, fetch all bookmarks
- `BookmarkButton.tsx` (already built in Step 4) — wire up to this hook
- Add `BookmarkButton` to `FileCard.tsx` and `FileDetail.tsx`
- Build `/bookmarks` page — grid of bookmarked FileCards (Student and Class Rep only, via RoleGuard)
- ✅ Done when: clicking the bookmark icon saves/unsaves a file, and bookmarks page shows saved files

### Step 14: Notifications
- Create `hooks/useNotifications.ts` — fetch unread notifications for current user, mark one as read, mark all as read
- **Notifications are created automatically by database triggers** (already set up in SUPABASE_SETUP.sql) — do NOT loop through users in application code
  - File upload trigger: automatically notifies all users whose `programme` AND `level` match the uploaded file
  - Reply trigger: automatically notifies the thread author when someone replies
  - No application code needed to create notifications — just read and display them
- Wire `NotificationBell.tsx` (built in Step 4) to `useNotifications.ts` — shows live unread count
- Build `/notifications` page — list of notifications sorted by newest, click navigates to the relevant `/file/[id]` page and marks the notification as read, a Mark All Read button at the top
- ✅ Done when: a student receives a notification when a matching file is uploaded in their programme and level

---

## Phase 5 — Library

### Step 15: Library Upload & Storage
- Build `BookUploadForm.tsx` — title, author, description, college, department, subject, file picker
- On submit: upload to `library-books` Supabase Storage bucket → insert into `books` table
- Library upload accessible to Lecturer and Class Rep (add to `/upload` page as a second tab: "Course File" vs "Library Book")
- ✅ Done when: Lecturer/Class Rep can upload a book and it appears in the `books` table

### Step 16: Library Browse
- Create `hooks/useBooks.ts` — fetch books with filters: college, department, subject, search
- Build `BookCard.tsx` — title, author, department, subject, download count
- Build `BookGrid.tsx` — responsive grid with loading skeleton and empty state
- Build `/library` page — books organised by college, then department, with search and filter
- Build `/library/[id]` page — full book detail: metadata, preview (PDF), download
- ✅ Done when: users can browse books by college and department, and open a book detail page

---

## Phase 6 — Dashboards & Profile

### Step 17: Dashboards
- Build `StudentDashboard.tsx`:
  - Recently uploaded files in the user's programme and level
  - Bookmarks shortcut (count + link)
  - Notification count shortcut
- Build `LecturerDashboard.tsx` (used by both Lecturer and Class Rep):
  - Total files uploaded
  - Total downloads across all their files
  - Quick upload button
  - List of their most recent uploads
- `/dashboard` renders the correct dashboard based on role (Class Rep sees LecturerDashboard)
- ✅ Done when: each role sees the correct dashboard with real data

### Step 18: Profile Page
- Build `/profile` page
- Display: full name, email, role, college, department, programme, level
- Allow editing: full name, department, college, programme, level
- Change password section: current password, new password, confirm new password — uses Supabase Auth `updateUser`
- Show success/error toast on save
- ✅ Done when: user can view and update their profile and change their password

---

## Phase 7 — Admin Panel

### Step 19: Admin Panel
- Build `(admin)` route group — `RoleGuard` set to Admin only
- Build `AdminSidebar.tsx` — links to Users and Content sections
- Build `/admin` dashboard page — total users count, total files count, total books count
- Build `UserTable.tsx`:
  - List all users with name, email, role, college, department, programme
  - Delete user button — confirmation dialog before deletion
  - Deleting a user removes their auth record and profile row
- Build `ContentTable.tsx`:
  - List all files and books with title, uploader, type, upload date
  - Delete button — removes from storage and database
- Build `/admin/users` page and `/admin/content` page
- ✅ Done when: Admin can view all users and content, and delete any of them

---

## Phase 8 — Polish & Deployment

### Step 20: UI Consistency Pass
- Review every page against the design system
- Ensure every page has correct loading, error, and empty states
- Check all buttons, cards, inputs, and typography are consistent across the app
- Test responsiveness: 375px, 768px, 1280px

### Step 21: Security Audit
- Confirm RLS is working — test that users cannot read or write other users' private data
- Confirm Gemini API key is not in any client-side bundle
- Confirm file URL validation is working in both AI API routes
- Confirm role-guarded routes correctly reject wrong roles including Admin routes

### Step 22: Final Testing
- Test every user flow end to end for all four roles: Student, Class Rep, Lecturer, Admin
- Test AI features with PDF, DOCX, and TXT files
- Test edge cases: wrong file type upload, oversized file, Gemini failure, Supabase error
- Fix all remaining bugs

### Step 23: Deployment
- Push final code to GitHub
- Connect repository to Vercel
- Add all environment variables in Vercel project settings
- Deploy and verify all features work on the production URL
- ✅ Done when: Scholr is live and all features work in production

---

## Step Completion Checklist

Use this after every step before moving to the next:

```
Step N — [Name]
☐ Feature works as described in PRD.md
☐ Code follows folder structure in ARCHITECTURE.md
☐ No TypeScript errors (strict mode)
☐ No ESLint errors
☐ Loading state implemented
☐ Error state implemented
☐ Empty state implemented (where applicable)
☐ Mobile responsive
☐ No console errors or warnings
☐ Committed to GitHub
☐ Ready to move to next step
```
