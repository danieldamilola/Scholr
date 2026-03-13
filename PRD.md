# PRD.md — Product Requirements Document
# Scholr: University Course Material Sharing Platform
# Mountain Top University

---

## What Is Scholr?

Scholr is a web platform for Mountain Top University students, lecturers, and class representatives to upload, discover, and interact with academic course materials. It solves the problem of course materials being scattered across WhatsApp groups, emails, and personal drives by giving every department a single, organised, searchable home for academic content.

Students can find and study materials. Lecturers and class reps can upload and manage them. An AI layer allows students to interact with documents directly on the platform without downloading them or using external tools. A library section provides access to categorised academic books by college and department. Admins can manage users and content across the platform.

---

## Who Is It For?

| Role | What They Can Do |
|------|----------------|
| **Student** | Browse, search, preview, download, use AI, bookmark, join discussions, access library |
| **Class Rep** | Everything a Student can do PLUS everything a Lecturer can do — they are students who also manage materials for their class |
| **Lecturer** | Upload and manage course materials, view download stats, join discussions |
| **Admin** | Manage all users, delete any file, oversee the entire platform |

> **Important:** Class Representatives are students first. They have the full abilities of both a Student and a Lecturer combined. There is no feature available to a Student that a Class Rep cannot access, and no upload/management feature available to a Lecturer that a Class Rep cannot access.

---

## University Structure (Mountain Top University)

### College of Basic and Applied Sciences
- **Biochemistry**
- **Biological Sciences:** Biology, Microbiology, Molecular Genetics and Biotechnology
- **Chemical Sciences:** Chemistry, Industrial Chemistry
- **Computer Science and Mathematics:** Computer Science, Mathematics, Software Engineering, Cyber Security
- **Food Science and Technology**
- **Geosciences:** Geology, Applied Geophysics
- **Physics:** Physics, Physics with Electronics

### College of Humanities, Management and Social Sciences
- **Accounting and Finance:** Accounting, Finance, Securities and Investment
- **Business Administration:** Business Administration, Public Administration, Industrial Relations and Personnel Management
- **Economics**
- **Languages:** English
- **Mass Communication**
- **Philosophy and Religion:** Religious Studies
- **Music**
- **Fine and Applied Arts**

### College of Allied Health Sciences
- **Nursing Science**
- **Medical Laboratory Science**
- **Biomedical Technology**
- **Public Health**
- **Nutrition and Dietetics**

---

## Core Features (Must Have)

### 1. Authentication & Role Management
- Email and password signup and login via Supabase Auth
- Role selection at signup: Student, Lecturer, or Class Rep
- At signup, users select their college, department, programme, and level
- Role stored in user metadata and used to control UI and access
- Protected routes — unauthenticated users cannot access any internal pages

### 2. File Upload & Management
- Lecturers and Class Reps can upload files (PDF, DOCX, PPTX, images)
- Each file requires: title, course code, description, college, department, programme, level, semester, file type, tags
- Files stored in Supabase Storage
- Uploaders can view and delete their own files
- No status badges — files are simply visible or deleted

### 3. Search & Discovery
- Browse files filtered by college, department, programme, level, and semester
- Full text search by title, course code, or description
- Sort by newest or most downloaded

### 4. File Detail & Preview
- Each file has a dedicated detail page with all metadata
- In-browser preview for PDFs
- Download button with download count tracking

### 5. AI Study Assistant
- Chat interface on the file detail page
- Student asks questions — AI reads the file and answers directly from the document
- If the AI does not know or the answer is not in the document, it must say so clearly — it must never guess or fabricate an answer
- Multi-turn conversation with context
- Runs entirely server-side — API key never exposed to client

### 6. AI Quiz Generator
- Generates multiple-choice questions directly from the file content
- Student selects number of questions and difficulty level
- Submit answers and see score with explanations per question

### 7. Community Discussion
- Each file detail page has a threaded discussion section
- Any authenticated user can start a discussion thread (post a question or note)
- Other users can reply to threads
- Lecturers and Class Reps can mark a reply as "Helpful"
- Users can delete their own posts and replies
- Keeps academic discussion organised and tied to specific course materials

### 8. Bookmarks
- Students and Class Reps can bookmark any file by clicking a bookmark icon
- Dedicated bookmarks page showing all saved files
- One click to bookmark, one click to remove

### 9. Library
- A separate section for academic books (not course materials)
- Books are categorised by college and department
- Within each department, books are further organised by subject/topic relevance
- Users can browse, preview, and download books
- Lecturers and Class Reps can upload books to the library with the appropriate categorisation

### 10. User Dashboard & Profile
- Student: recently uploaded files in their programme and level, bookmarks shortcut
- Lecturer/Class Rep: uploaded files count, total downloads, quick upload button
- Profile page: view and update name, department, college, programme, level, and password

### 11. Notifications
- In-app notification when a new file is uploaded matching the user's programme AND level
- Notification when someone replies to a discussion thread the user started
- Notification bell in navbar showing unread count

### 12. Admin Panel
- Accessible only to users with the Admin role
- View all users with their role, college, department, and programme
- Delete any user account
- Delete any file or library book
- Cannot be accessed by any other role

---

## What Scholr Is NOT

- ❌ Not a video streaming or lecture recording platform
- ❌ Not a live class or meeting tool
- ❌ Not a grading or assignment submission system
- ❌ Not a social network — no following, feeds, or likes
- ❌ Not a direct messaging system between users
- ❌ Not a payment or subscription platform
- ❌ Not a mobile app — web only, but mobile responsive
- ❌ Not an LMS — no courses, modules, or enrolment tracking
- ❌ Not a plagiarism checker
- ❌ Not a collaborative document editor

---

## Success Criteria (Final Year Project)

- A student can sign up, find a file for their programme and level, and ask the AI a question — all in under 2 minutes
- A lecturer or class rep can upload a file with full metadata in under 3 minutes
- The AI answers questions accurately based on document content and admits when it does not know
- The platform works on desktop and mobile browsers
- All routes are protected by role-based access control
- The codebase is clean, uses reusable components, and follows the architecture in ARCHITECTURE.md
