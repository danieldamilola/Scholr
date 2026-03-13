# ARCHITECTURE.md — Project Structure & Data Architecture
# Scholr

---

## Folder Structure

```
scholr/
├── app/
│   ├── layout.tsx                        # Root layout — font, global providers
│   ├── page.tsx                          # Entry point — redirects based on auth state
│   ├── (auth)/                           # Auth route group — no navbar
│   │   ├── login/
│   │   │   └── page.tsx
│   │   └── signup/
│   │       └── page.tsx
│   ├── (main)/                           # Main app — has navbar + AuthGuard
│   │   ├── layout.tsx
│   │   ├── dashboard/
│   │   │   └── page.tsx                  # Role-aware dashboard
│   │   ├── browse/
│   │   │   └── page.tsx                  # Browse + search all course files
│   │   ├── file/
│   │   │   └── [id]/
│   │   │       └── page.tsx              # File detail: preview, AI, discussion
│   │   ├── upload/
│   │   │   └── page.tsx                  # Upload course file (Lecturer + Class Rep)
│   │   ├── manage/
│   │   │   └── page.tsx                  # Manage own uploads (Lecturer + Class Rep)
│   │   ├── library/
│   │   │   ├── page.tsx                  # Library home — browse books by college/dept
│   │   │   └── [id]/
│   │   │       └── page.tsx              # Book detail page
│   │   ├── bookmarks/
│   │   │   └── page.tsx                  # Saved files (Student + Class Rep)
│   │   ├── notifications/
│   │   │   └── page.tsx                  # In-app notifications
│   │   └── profile/
│   │       └── page.tsx                  # View + edit profile, change password
│   ├── (admin)/                          # Admin route group — Admin role only
│   │   ├── layout.tsx                    # Admin layout with admin sidebar
│   │   └── admin/
│   │       ├── page.tsx                  # Admin dashboard overview
│   │       ├── users/
│   │       │   └── page.tsx              # View and delete users
│   │       └── content/
│   │           └── page.tsx              # View and delete any file or book
│   └── api/
│       └── ai/
│           ├── chat/
│           │   └── route.ts              # Study assistant endpoint
│           └── quiz/
│               └── route.ts              # Quiz generator endpoint
│
├── components/
│   ├── ui/                               # shadcn/ui primitives — do not edit
│   ├── layout/
│   │   ├── Navbar.tsx
│   │   └── AdminSidebar.tsx
│   ├── auth/
│   │   ├── AuthGuard.tsx                 # Redirects to login if no session
│   │   └── RoleGuard.tsx                 # Restricts page by role
│   ├── files/
│   │   ├── FileCard.tsx                  # Reusable file summary card
│   │   ├── FileGrid.tsx                  # Responsive grid of FileCards
│   │   ├── FileDetail.tsx                # Full file detail view
│   │   ├── FileUploadForm.tsx            # Upload form with all metadata fields
│   │   └── FilePreview.tsx              # In-browser PDF/image viewer
│   ├── library/
│   │   ├── BookCard.tsx                  # Reusable book card
│   │   ├── BookGrid.tsx                  # Grid of BookCards
│   │   ├── BookDetail.tsx                # Book detail view
│   │   └── BookUploadForm.tsx            # Upload book to library
│   ├── ai/
│   │   ├── StudyAssistant.tsx            # Chat UI
│   │   └── QuizGenerator.tsx             # Quiz UI
│   ├── discussion/
│   │   ├── DiscussionSection.tsx         # Full discussion section for file detail
│   │   ├── ThreadCard.tsx                # Single discussion thread
│   │   └── ReplyCard.tsx                 # Single reply within a thread
│   ├── dashboard/
│   │   ├── StudentDashboard.tsx
│   │   └── LecturerDashboard.tsx         # Used by both Lecturer and Class Rep
│   ├── admin/
│   │   ├── UserTable.tsx                 # Admin user management table
│   │   └── ContentTable.tsx              # Admin content management table
│   └── shared/                           # Reusable across the entire app
│       ├── SearchBar.tsx
│       ├── FilterPanel.tsx
│       ├── EmptyState.tsx                # Consistent empty state UI
│       ├── LoadingSkeleton.tsx           # Consistent skeleton loader
│       ├── BookmarkButton.tsx            # Icon-only bookmark toggle
│       └── NotificationBell.tsx          # Navbar notification icon + count
│
├── lib/
│   ├── supabase/
│   │   ├── client.ts                     # Browser Supabase client
│   │   ├── server.ts                     # Server-side Supabase client
│   │   └── middleware.ts                 # Session refresh
│   ├── gemini.ts                         # Gemini client + file helpers (fallback for images)
│   ├── extractText.ts                    # Text extraction: PDF via pdf-parse, DOCX via mammoth, TXT direct read
│   └── utils.ts                          # formatDate, formatFileSize, etc.
│
├── hooks/
│   ├── useUser.ts                        # Current user + profile + role
│   ├── useFiles.ts                       # Fetch files with filters
│   ├── useBooks.ts                       # Fetch library books with filters
│   ├── useBookmarks.ts                   # Add, remove, check bookmark
│   ├── useDiscussion.ts                  # Fetch threads and replies for a file
│   └── useNotifications.ts              # Fetch + mark notifications as read
│
├── types/
│   └── index.ts                          # All shared TypeScript interfaces
│
├── constants/
│   └── index.ts                          # MTU colleges, departments, programmes, levels
│
├── middleware.ts                         # Auth session + route protection
├── .env.local
├── PRD.md
├── ARCHITECTURE.md
├── AI_RULES.md
└── PLAN.md
```

---

## Database Schema (Supabase PostgreSQL)

### `profiles`
```sql
id            UUID PRIMARY KEY REFERENCES auth.users(id)
full_name     TEXT NOT NULL
email         TEXT NOT NULL
role          TEXT NOT NULL CHECK (role IN ('student', 'lecturer', 'class_rep', 'admin'))
college       TEXT
department    TEXT
programme     TEXT
level         TEXT
avatar_url    TEXT
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `files`
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
title           TEXT NOT NULL
course_code     TEXT NOT NULL
description     TEXT
college         TEXT NOT NULL
department      TEXT NOT NULL
programme       TEXT NOT NULL
level           TEXT NOT NULL
semester        TEXT NOT NULL
file_type       TEXT NOT NULL
file_url        TEXT NOT NULL
storage_path    TEXT NOT NULL
tags            TEXT[]
downloads       INTEGER DEFAULT 0
text_content    TEXT  -- extracted at upload time; NULL for images
uploaded_by     UUID REFERENCES profiles(id) ON DELETE SET NULL
uploader_name   TEXT
uploader_role   TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### `books` (Library)
```sql
id              UUID PRIMARY KEY DEFAULT gen_random_uuid()
title           TEXT NOT NULL
author          TEXT
description     TEXT
college         TEXT NOT NULL
department      TEXT NOT NULL
subject         TEXT
file_url        TEXT NOT NULL
storage_path    TEXT NOT NULL
cover_url       TEXT
downloads       INTEGER DEFAULT 0
text_content    TEXT  -- extracted at upload time; NULL for images
uploaded_by     UUID REFERENCES profiles(id) ON DELETE SET NULL
uploader_name   TEXT
created_at      TIMESTAMPTZ DEFAULT NOW()
```

### `discussion_threads`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE
user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
content     TEXT NOT NULL
created_at  TIMESTAMPTZ DEFAULT NOW()
```

### `discussion_replies`
```sql
id            UUID PRIMARY KEY DEFAULT gen_random_uuid()
thread_id     UUID NOT NULL REFERENCES discussion_threads(id) ON DELETE CASCADE
user_id       UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
content       TEXT NOT NULL
is_helpful    BOOLEAN DEFAULT FALSE
created_at    TIMESTAMPTZ DEFAULT NOW()
```

### `bookmarks`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
file_id     UUID NOT NULL REFERENCES files(id) ON DELETE CASCADE
created_at  TIMESTAMPTZ DEFAULT NOW()
UNIQUE(user_id, file_id)
```

### `notifications`
```sql
id          UUID PRIMARY KEY DEFAULT gen_random_uuid()
user_id     UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE
message     TEXT NOT NULL
link        TEXT
is_read     BOOLEAN DEFAULT FALSE
created_at  TIMESTAMPTZ DEFAULT NOW()
```

---

## Route Protection Rules

| Route | Accessible By |
|-------|--------------|
| `/login`, `/signup` | Unauthenticated only |
| `/dashboard` | All authenticated users |
| `/browse` | All authenticated users |
| `/file/[id]` | All authenticated users |
| `/library` | All authenticated users |
| `/library/[id]` | All authenticated users |
| `/upload` | Lecturer, Class Rep |
| `/manage` | Lecturer, Class Rep |
| `/bookmarks` | Student, Class Rep |
| `/profile` | All authenticated users |
| `/notifications` | All authenticated users |
| `/admin/*` | Admin only |
| `/api/ai/*` | Server only |

---

## Reusable Component Rules

Every UI pattern that appears more than once must be extracted into a shared component. Key reusable components:

- `FileCard` — used in browse, dashboard, bookmarks, search results
- `BookCard` — used in library browse and search
- `EmptyState` — used on every page that renders a list
- `LoadingSkeleton` — used on every page during data fetch
- `SearchBar` — used in browse and library
- `FilterPanel` — used in browse and library
- `BookmarkButton` — used in FileCard and FileDetail
- `NotificationBell` — used in Navbar only

---

## Naming Conventions

- Folders: kebab-case
- Components: PascalCase
- Hooks: camelCase prefixed with `use`
- Utilities: camelCase
- Database columns: snake_case
- TypeScript interfaces: PascalCase (e.g. `FileRecord`, `UserProfile`, `BookRecord`)
- Environment variables: SCREAMING_SNAKE_CASE, `NEXT_PUBLIC_` prefix only for client-side values
