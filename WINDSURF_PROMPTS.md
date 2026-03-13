# Scholr — Windsurf Prompts (Step-by-Step)

Before using any prompt below, make sure PRD.md, ARCHITECTURE.md, AI_RULES.md, and PLAN.md are in the project root.

---

## How to use this file

1. Find the step you are currently on
2. Copy the prompt exactly
3. Paste it into Windsurf
4. Wait for Windsurf to finish
5. Test it yourself using the checklist in PLAN.md
6. Only move to the next step when everything works

---

## STEP 1 — Project Setup

Read PRD.md, ARCHITECTURE.md, AI_RULES.md, and PLAN.md in this project root. These four files are your source of truth for this entire project. Do not deviate from them at any point.

Now complete Step 1 from PLAN.md only:

- Initialise a Next.js 15 project with TypeScript and App Router
- Install and configure Tailwind CSS, shadcn/ui, Lucide React, Framer Motion
- Install @supabase/supabase-js, @supabase/ssr, @google/generative-ai, mammoth
- Create the complete folder structure defined in ARCHITECTURE.md with placeholder files
- Create types/index.ts with all interfaces: UserProfile, FileRecord, BookRecord, DiscussionThread, DiscussionReply, Bookmark, Notification
- Create constants/index.ts with all MTU colleges, departments, programmes, levels, semesters, and allowed file types as defined in PRD.md

When Step 1 is complete, stop and wait for my confirmation before doing anything else.

---

## STEP 2 — Supabase Setup

SUPABASE_SETUP.sql has already been run. The database tables, RLS policies, triggers, and storage buckets are ready.

Complete Step 2 from PLAN.md:

- Create lib/supabase/client.ts — browser Supabase client singleton
- Create lib/supabase/server.ts — server-side Supabase client for API routes and Server Components
- Create middleware.ts — refreshes the auth session on every request and protects routes as defined in ARCHITECTURE.md

Follow the naming and structure in ARCHITECTURE.md exactly. When done, stop and wait for my confirmation.

---

## STEP 3 — Authentication & Profiles

Complete Step 3 from PLAN.md:

- Build /login page — email and password form using shadcn/ui components
- Build /signup page — email, password, full name, role selection (Student, Lecturer, Class Rep), college, department, programme, level. All dropdowns must use the data from constants/index.ts
- On signup: create the Supabase auth user and pass full_name, role, college, department, programme, level as raw_user_meta_data so the database trigger creates the profile row automatically
- Create hooks/useUser.ts — returns the current session, profile object, and role
- Build AuthGuard.tsx — redirects to /login if there is no active session
- Build RoleGuard.tsx — accepts an array of allowed roles as a prop, redirects to /dashboard if the user's role is not in the list
- Set up route group layouts: (auth) with no navbar, (main) with Navbar and AuthGuard wrapping all child pages

For the design: the login and signup pages should be a clean centered card layout. Reference Vercel's login page for the overall feel — minimal, professional, no clutter. The form should use shadcn/ui components throughout.

All three roles must be able to sign up, log in, and land on /dashboard. Stop when done and wait for confirmation.

---

## STEP 4 — Shared Reusable Components

Complete Step 4 from PLAN.md. Build all shared components in components/shared/ and components/layout/.

DESIGN REFERENCE FOR THIS STEP: Study these sites before writing any code:

- Navbar and overall shell: Vercel Dashboard (vercel.com/dashboard) — clean top nav, role badge, notification bell placement
- Empty states: Cosmos (cosmos.so) — empty states should feel intentional and designed, not like something is broken
- Cards and skeletons: Linear (linear.app) — subtle, clean, fast-feeling

Components to build:

- EmptyState.tsx — accepts icon, heading, subtext, and optional action button as props. Design after Cosmos empty states — centered, icon above heading, muted subtext, optional CTA button
- LoadingSkeleton.tsx — accepts a variant prop: "card" or "list". Subtle pulse animation via Framer Motion
- SearchBar.tsx — controlled input with search icon and a clear button
- FilterPanel.tsx — dropdowns for college, department, programme, level, semester. All options from constants/index.ts
- BookmarkButton.tsx — icon-only button. Filled bookmark icon when saved, outlined when not. Accepts isBookmarked and onToggle as props. Subtle scale animation on click via Framer Motion
- NotificationBell.tsx — bell icon with an unread count badge. Accepts count as a prop
- Navbar.tsx — logo left, navigation links, NotificationBell, user's name and role badge, logout. Reference Vercel Dashboard for layout and spacing

Every component must be typed with a TypeScript interface for its props. Stop when done and wait for confirmation.

---

## STEP 5 — File Upload (with Text Extraction)

Complete Step 5 from PLAN.md:

- Install pdf-parse: `npm install pdf-parse @types/pdf-parse`
- Create lib/extractText.ts with:
  - `extractTextFromFile(file: File): Promise<string | null>`
  - PDF → use pdf-parse, return extracted text
  - DOCX → use mammoth.extractRawText(), return text
  - TXT → read buffer as UTF-8 string directly
  - PNG, JPG, PPTX → return null
  - Wrap in try/catch — if extraction fails return null, never crash the upload
- Build FileUploadForm.tsx — fields: title, course code, description, college, department, programme, level, semester, tags, file picker. All dropdown options from constants/index.ts
- Client-side validation: all required fields filled, file type allowed, file size ≤ 50MB
- On submit flow (in order):
  1. Upload file to Supabase Storage under {userId}/{filename} — get public URL
  2. Show "Processing file for AI..." toast — extract text using extractTextFromFile()
  3. Insert into files table with all metadata including text_content (may be null)
  4. If database insert fails after storage upload — delete the orphaned file from storage before returning error
- Server-side MIME type validation — do not rely on client-side extension check alone
- Build /upload page — wrapped in RoleGuard for Lecturer and Class Rep only
- If text_content is null, show info toast: "File uploaded. AI features may be limited for this file type."
- Design reference: Linear's form layouts — clean field labels above inputs, generous spacing, clear primary submit button.

Stop when a lecturer or class rep can upload a file and text_content is correctly populated in the database. Wait for confirmation.

---

## STEP 6 — Browse & Search

Complete Step 6 from PLAN.md:

- Create hooks/useFiles.ts — fetches files from Supabase with optional filters: college, department, programme, level, semester, search query (matches title or course_code), sort by newest or most downloaded, page number, page size 20. Use Supabase .range() for server-side pagination. Returns { data, loading, error, total, page }.
- Debounce the search input by 400ms.
- Build FileCard.tsx — title, course code, department, level, file type, uploader name, download count, BookmarkButton.
- Build FileGrid.tsx — responsive grid of FileCards with LoadingSkeleton while loading, EmptyState when no results, and pagination controls.
- Build /browse page — SearchBar + FilterPanel + FileGrid.
- Design reference: FileCard → Coursera + GitHub; browse layout → GitHub explore page.

Stop when a student can search, filter, and see paginated results. Wait for confirmation.

---

## STEP 7 — File Detail Page

Complete Step 7 from PLAN.md:

- Build /file/[id] page — fetches the file record from Supabase by ID.
- Build FileDetail.tsx — displays all metadata: title, course code, description, college, department, programme, level, semester, uploader name, uploader role, upload date, file type, download count.
- Build FilePreview.tsx — iframe for PDFs; for other types show message "Preview not available" with download button.
- Create /api/download/[fileId] server route — increments downloads atomically using the increment_file_downloads database function, then returns the file URL for redirect.
- Download button calls this API route, not the file URL directly.
- Design reference: GitHub file detail (two-column layout) + Coursera course detail.

Stop when clicking a FileCard opens the correct detail page with metadata, preview, and working download. Wait for confirmation.

---

## STEP 8 — Manage Files

Complete Step 8 from PLAN.md:

- Build ManageFilesTable.tsx — table of current user's uploaded files with columns: title, course code, level, downloads, upload date, delete button.
- Build /manage page — wrapped in RoleGuard for lecturer and class_rep.
- Delete: show shadcn/ui confirmation dialog → delete from Storage using storage_path → delete row from files table.
- Show success toast after deletion.
- Design reference: Linear's issue list — clean rows, subtle dividers, actions on hover.

Stop when lecturer/class rep can view and delete their own files. Wait for confirmation.

---

## STEP 9 — Gemini Integration (Backend)

Complete Step 9 from PLAN.md:

- Create lib/gemini.ts:
  - Gemini client initialisation using gemini-1.5-flash
  - `callGeminiWithText(textContent: string, prompt: string)` — primary function, sends plain text to Gemini
  - `callGeminiWithFile(fileUrl: string, mimeType: string, prompt: string)` — fallback for images only. Validate URL with strict regex before fetching: `/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//`
  - `validateFileUrl(url: string): boolean` — strict regex check, never use .includes()
  - `getMimeType(fileUrl: string): string` — maps extension to MIME type

- Create app/api/ai/chat/route.ts:
  - Accepts: { fileId, question, chatHistory } — fileId not fileUrl
  - Fetch file record from database using server-side Supabase client
  - If text_content available: call callGeminiWithText(text_content, prompt) — fast path
  - If text_content is null: call callGeminiWithFile(file_url, file_type, prompt) — image fallback
  - System prompt must include: "If the answer is not found in the document, say clearly that you don't know. Never guess or fabricate an answer."
  - Wrap Gemini call in 9 second timeout
  - Never expose raw errors to client — log server-side, return friendly message
  - Returns { answer }

- Create app/api/ai/quiz/route.ts:
  - Accepts: { fileId, numberOfQuestions, difficulty }
  - Same database fetch + text_content/fallback pattern as chat route
  - Prompt must demand ONLY a JSON array — no markdown, no code fences, no explanation text
  - Required structure per question: { "question": "", "options": ["A.", "B.", "C.", "D."], "answer": "A.", "explanation": "" }
  - Strip code fences before JSON.parse, wrap in try/catch
  - Validate structure before returning
  - Returns { questions }

Test both routes with a real PDF, DOCX, TXT, and image file. Stop when both fast path and fallback work. Wait for confirmation.

---

## STEP 10 — Study Assistant UI

Complete Step 10 from PLAN.md:

- Build components/ai/StudyAssistant.tsx — scrollable chat, message history, input bar, send button. Accepts fileId, fileName, courseCode as props.
- On send: POST to /api/ai/chat with fileId, question, last 6 messages as chatHistory.
- Show loading spinner while waiting.
- Show friendly error message if request fails.
- Add to /file/[id] page below the file preview.
- Design reference: Perplexity — clean chat interface, user messages right-aligned, AI messages left-aligned with subtle background. Smooth scroll to bottom via Framer Motion.

Stop when student can have a multi-turn conversation about a real uploaded document. Wait for confirmation.

---

## STEP 11 — Quiz Generator UI

Complete Step 11 from PLAN.md:

- Build components/ai/QuizGenerator.tsx — settings (number of questions: 3, 5, 10; difficulty: easy, medium, hard), generate button, question list with option buttons, submit button, score display with per-question explanations. Accepts fileId, fileName, courseCode as props.
- On generate: POST to /api/ai/quiz, show LoadingSkeleton while waiting.
- Show friendly error if generation or JSON parsing fails.
- Add tab switcher to /file/[id]: tabs "Study Assistant" and "Practice Quiz".
- Design reference: Perplexity — each question in separate card, option buttons with selected/correct/incorrect states, prominent score display.

Stop when student can generate and complete a quiz from a real uploaded document. Wait for confirmation.

---

## STEP 12 — Community Discussion

Complete Step 12 from PLAN.md:

- Create hooks/useDiscussion.ts — fetch threads for a file, fetch replies for a thread, add thread, add reply, delete thread, delete reply, mark reply as helpful.
- Build ReplyCard.tsx — shows replier name, role, content, timestamp. Shows Helpful badge if is_helpful is true. Delete button for own reply. Lecturers and class reps see Mark Helpful button.
- Build ThreadCard.tsx — shows poster name, role, content, timestamp, reply count. Expandable to show ReplyCards and reply input. Delete button for thread author.
- Build DiscussionSection.tsx — new thread input at top, then list of ThreadCards. Add to /file/[id] below AI section.
- Design reference: Read.cv for typographic hierarchy; GitHub PR discussion for nested replies.

Stop when users can post threads, reply, mark helpful, and delete own content. Wait for confirmation.

---

## STEP 13 — Bookmarks

Complete Step 13 from PLAN.md:

- Create hooks/useBookmarks.ts — add bookmark, remove bookmark, check if file is bookmarked, fetch all bookmarks for current user.
- Wire BookmarkButton.tsx to this hook with toast confirmation on toggle.
- Add BookmarkButton to FileCard.tsx and FileDetail.tsx.
- Build /bookmarks page — wrapped in RoleGuard for student and class_rep. Grid of bookmarked FileCards with EmptyState if none.

Stop when student can bookmark a file and see it on /bookmarks. Wait for confirmation.

---

## STEP 14 — Notifications

Complete Step 14 from PLAN.md:

Notifications are created automatically by database triggers already set up in SUPABASE_SETUP.sql. Do NOT create notifications in application code.

- Create hooks/useNotifications.ts — fetch notifications for current user sorted newest first, mark one as read, mark all as read.
- Wire NotificationBell.tsx in Navbar to this hook — shows live unread count.
- Build /notifications page — list of notifications, click navigates to relevant /file/[id] and marks as read, Mark All Read button at top.
- Design reference: Linear's notification panel — clean list, unread items have left border accent.

Stop when a student receives a notification after a matching file is uploaded. Test by uploading a file as lecturer. Wait for confirmation.

---

## STEP 15 — Library Upload

Complete Step 15 from PLAN.md:

- Build BookUploadForm.tsx — fields: title, author, description, college, department, subject, file picker.
- On submit: upload to library-books Storage bucket → extract text_content same as file upload flow → insert into books table.
- Add tab switcher to /upload page: "Course File" tab (FileUploadForm) and "Library Book" tab (BookUploadForm).

Stop when lecturer/class rep can upload a book and it appears in the books table with text_content populated. Wait for confirmation.

---

## STEP 16 — Library Browse

Complete Step 16 from PLAN.md:

- Create hooks/useBooks.ts — fetch books with filters: college, department, subject, search query, pagination.
- Build BookCard.tsx — title, author, department, subject, download count.
- Build BookGrid.tsx — responsive grid with LoadingSkeleton and EmptyState.
- Build /library page — books grouped by college then department. SearchBar and FilterPanel at top.
- Build /library/[id] page — full book metadata, PDF preview, download button that calls /api/download/book/[bookId] to increment downloads atomically.
- Design reference: Cosmos — generous card sizing, subtle hover lift, curated feel.

Stop when users can browse books by college/department and open a detail page. Wait for confirmation.

---

## STEP 17 — Dashboards

Complete Step 17 from PLAN.md:

- Build StudentDashboard.tsx — recent files in user's programme/level (last 6), bookmarks count shortcut, unread notifications count shortcut.
- Build LecturerDashboard.tsx — total files uploaded, total downloads across all their files, quick Upload button, list of their 5 most recent uploads.
- /dashboard renders correct dashboard based on role. class_rep sees LecturerDashboard.
- Design reference: Linear — metric cards with number and label, recent files as compact rows.

Stop when each role sees the correct dashboard with real data. Wait for confirmation.

---

## STEP 18 — Profile Page

Complete Step 18 from PLAN.md:

- Build /profile page.
- Display: full name, email (read-only), role (read-only), college, department, programme, level.
- Allow editing: full name, college, department, programme, level — saves to profiles table.
- Change password section: current, new, confirm — uses Supabase Auth updateUser.
- Show success/error toasts.
- Design reference: Read.cv — clean two-section layout, strong name/role display.

Stop when user can update profile and change password. Wait for confirmation.

---

## STEP 19 — Admin Panel

Complete Step 19 from PLAN.md:

- Create (admin) route group with layout.tsx including AdminSidebar and RoleGuard (admin only).
- Build AdminSidebar.tsx — links to /admin, /admin/users, /admin/content.
- Build /admin page — total users, total files, total books counts.
- Build UserTable.tsx — list all profiles with name, email, role, college, department, programme. Delete button with confirmation — calls Supabase Auth admin.deleteUser() via a protected server route using service role key.
- Build ContentTable.tsx — list all files and books. Delete button removes from storage and database.
- Build /admin/users and /admin/content pages.
- Design reference: Linear — sidebar navigation, clean tables, metric cards.

Stop when admin can view all users and content and delete any of them. Wait for confirmation.

---

## STEP 20 — UI Consistency Pass

Complete Step 20 from PLAN.md. Go through every page and check:

- Every page matches the quality and feel of its design reference
- Loading, error, and empty states exist on every page
- All buttons, cards, inputs, and typography are consistent
- Fully responsive at 375px, 768px, and 1280px
- Fix all inconsistencies before proceeding

Stop when everything is consistent. Wait for confirmation.

---

## STEP 21 — Security Audit

Complete Step 21 from PLAN.md:

- Test that a student cannot delete another user's file (RLS should block)
- Test that a student cannot access /upload or /manage (RoleGuard should redirect)
- Test that a non-admin cannot access /admin (RoleGuard should redirect)
- Confirm GEMINI_API_KEY is never present in client-side bundles (search for it in build output)
- Confirm validateFileUrl() in lib/gemini.ts rejects invalid URLs
- Fix any issues found

Stop when all checks pass. Wait for confirmation.

---

## STEP 22 — Final Testing

Complete Step 22 from PLAN.md. Test every user flow end to end:

- Student: sign up → browse → file detail → study assistant → quiz → bookmark → discussion → notification → profile
- Class Rep: all student flows + upload file + manage files + upload library book
- Lecturer: upload file + manage files + upload library book + mark reply helpful
- Admin: view all users → delete a user; view all content → delete a file
- AI: test with PDF, DOCX, and TXT to confirm text_content fast path works; test with an image to confirm fallback works
- Fix all bugs before proceeding

Stop when all flows work without errors. Wait for confirmation.

---

## STEP 23 — Deployment

Complete Step 23 from PLAN.md:

- Commit all code to GitHub with no secrets or .env files committed
- Connect the GitHub repo to Vercel
- Add environment variables in Vercel dashboard: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, GEMINI_API_KEY
- Deploy and verify the live URL works end to end

Scholr is complete when live and all features work on the deployed URL.
