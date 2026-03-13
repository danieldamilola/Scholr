# AI_RULES.md — Engineering Standards & Non-Negotiables
# Scholr

These rules are non-negotiable. Every line of code written for this project must comply with them. When in doubt, refer back to this document before making a decision.

---

## Tech Stack — Locked

| Layer | Technology | Notes |
|-------|-----------|-------|
| Framework | Next.js 15 (App Router) | Only |
| Language | TypeScript — strict mode | No exceptions |
| Styling | Tailwind CSS 3+ | Only |
| UI Components | shadcn/ui | Only — no other component libraries |
| Icons | Lucide React | Only — no other icon libraries |
| Animation | Framer Motion | Allowed but minimal — see Animation Rules below |
| Backend / DB | Supabase (PostgreSQL) | Only |
| Auth | Supabase Auth | Only — no NextAuth, no Clerk |
| Storage | Supabase Storage | Only |
| AI | Google Gemini (`gemini-1.5-flash`) | Only |
| AI SDK | `@google/generative-ai` | Official SDK only |
| DOCX parsing | `mammoth` | For extracting text from DOCX before sending to Gemini |
| Deployment | Vercel | Only |

**Do not install packages outside this stack without explicit approval.**

---

## Design References — Per Page

These are the visual references Windsurf must use when designing each section of the app. Study these sites before writing any UI code. The goal is not to copy them — it is to match their quality, spacing, hierarchy, and feel.

| Section | Reference | What to borrow |
|---------|-----------|----------------|
| Dashboard, Manage Files, Admin Panel | **Linear** (`linear.app`) | Clean list layouts, subtle borders, strong typography hierarchy, fast-feeling UI, table and sidebar design |
| Browse Page, File Cards | **Coursera** (`coursera.org`) + **GitHub** (`github.com`) | Academic content hierarchy, file/course card layout, metadata presentation, uploader info |
| Library Page | **Cosmos** (`cosmos.so`) | Curated card grid feel, hover effects, premium browsable layout — the library should feel more considered than a regular file list |
| Navbar & General Layout | **Vercel Dashboard** (`vercel.com/dashboard`) | Clean top navigation, role indicator, notification bell placement, overall app shell |
| AI Chat (Study Assistant) | **Perplexity** (`perplexity.ai`) | Clean chat interface, source separation, follow-up question design, answer formatting |
| AI Quiz | **Perplexity** (`perplexity.ai`) | Card-based question layout, clean option buttons, result presentation |
| Profile Page, Discussion | **Read.cv** (`read.cv`) | Elegant minimal layout, strong typographic hierarchy, academic tone |
| Empty States (everywhere) | **Cosmos** (`cosmos.so`) | Intentional, designed empty screens — never just a blank space |

---

## Animation Rules

This is a university academic platform, not a portfolio or showcase site. Animations must serve a functional purpose — they should never be decorative or distracting.

- ✅ Allowed: subtle fade-in on page load, smooth modal open/close, gentle skeleton pulse
- ✅ Allowed: micro-interactions on buttons (slight scale on press)
- ✅ Allowed: card hover effects on the Library page (borrowing from Cosmos)
- ❌ Not allowed: sliding panels, bouncing elements, staggered list animations, parallax
- ❌ Not allowed: any animation that delays the user from seeing content
- **Default rule:** if in doubt, do not animate it

---

## Reusable Components — Required

Building reusable components is not optional — it is the primary way this project stays maintainable and consistent.

- Every UI pattern that appears on more than one page must be a shared component in `components/shared/`
- Props must be typed — every component has a defined TypeScript interface for its props
- Components must be self-contained — they handle their own loading, error, and empty states internally where applicable
- Never copy-paste the same JSX into two different places — extract it into a component

---

## Code Quality — Non-Negotiables

### TypeScript
- Strict mode ON — no `any` types
- All props must have defined TypeScript interfaces
- All Supabase results must use types from `types/index.ts`
- No `@ts-ignore` comments

### Components
- Functional components only — no class components
- No component should exceed 200 lines — split if it does
- No business logic inside UI components — logic belongs in hooks or lib files
- All components handle loading, error, and empty states

### Hooks
- All data fetching lives in custom hooks in `/hooks`
- Never fetch data directly inside a component body
- Hooks always return `{ data, loading, error }`

### Styling
- Tailwind utility classes only
- No inline `style={{}}` except for truly dynamic values
- No custom CSS files except `globals.css` for font imports and base resets
- shadcn/ui for all form elements, dialogs, dropdowns, and toasts

---

## Security — Non-Negotiables

### API Keys
- `GEMINI_API_KEY` must NEVER appear in any client-side file — server routes only
- `SUPABASE_SERVICE_ROLE_KEY` must NEVER appear in any client-side file
- Only `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` are allowed in client code

### File Handling
- Validate file URL belongs to the project's own Supabase storage domain before fetching in any API route
- Maximum upload size: 50MB — enforce on client before upload and in storage bucket policy
- Allowed file types: PDF, DOCX, PPTX, PNG, JPG, TXT — reject all others

### Authentication
- Every page in `(main)/` must use `AuthGuard`
- Every restricted page must use `RoleGuard`
- Never trust the client for role — always read from server-side Supabase session
- RLS (Row Level Security) must be enabled on every Supabase table — no exceptions

### Input Validation
- All forms validated client-side before submission
- All API routes validated server-side before processing
- Sanitize all user-generated content before rendering

---

## Database Rules

- RLS enabled on ALL tables — no exceptions
- `files` table: readable by all authenticated users, writable only by uploader
- `books` table: readable by all authenticated users, writable only by uploader
- `discussion_threads` and `discussion_replies`: readable by all authenticated users, deletable by the author only
- `bookmarks`: readable and writable by the owning user only
- `notifications`: readable and writable by the recipient only
- Admin operations (delete any record) must go through a server route using the service role key — never expose the service role key to the client

---

## AI Feature Rules

### Model
- Use `gemini-1.5-flash` only
- Do not change the model without testing

### Honesty — Critical
- The system prompt for BOTH the chat and quiz endpoints must explicitly instruct Gemini:
  > "If the answer is not found in the document, say clearly that you don't know or that the information is not in this document. Never guess or fabricate an answer. Accuracy is more important than giving a response."
- This instruction must always be present in the system prompt — never remove it

### Text Extraction at Upload (Primary Approach)
- When a file is uploaded, extract its text immediately and store it in the `text_content` column of the `files` table
- This happens once — AI requests never re-fetch or re-parse the file
- Use `lib/extractText.ts` for all extraction logic:
  - PDF → `pdf-parse` library
  - DOCX → `mammoth` library
  - TXT → read buffer as UTF-8 directly
  - PNG, JPG, PPTX → set `text_content = null`, use fallback approach
- If extraction fails (corrupted file, scanned PDF with no text layer), store `null` and show the user a warning: "AI features may be limited for this file"
- Install `pdf-parse` in addition to `mammoth` which is already in the stack

### AI API Routes — Use text_content First
- Both `/api/ai/chat` and `/api/ai/quiz` must accept `fileId` (not `fileUrl`)
- Fetch the file record from the database by ID — never accept a raw URL from the client
- If `text_content` is available: send it directly to Gemini as plain text — fast, reliable, no fetching
- If `text_content` is null (image files): fall back to fetching the file URL and sending as base64 inline part
- This hybrid approach means text files are fast and reliable, images still work via Gemini vision

### File Handling (Fallback for Images Only)
- PNG and JPG only: fetch from storage URL, send as base64 inline part to Gemini
- Validate the file URL with strict regex before fetching — even in the fallback path
- Hard limit: do not send files larger than 20MB — reject with clear user-facing error
- The 20MB AI limit is separate from the 50MB upload limit

### File URL Validation (SSRF Prevention)
- In the image fallback path, validate the URL using strict regex before fetching
- Pattern: `/^https:\/\/[a-z0-9]+\.supabase\.co\/storage\/v1\/object\/public\//`
- Use regex match, not `.includes()` — string contains can be bypassed
- Reject any non-matching URL with a 400 error, never fetch it

### Error Handling
- Never expose internal errors, stack traces, or raw Gemini errors to the client
- Log full errors server-side only
- Return specific user-facing messages per failure type:
  - Extraction failed at upload: "AI features may be limited for this file"
  - text_content is null and fallback also fails: "This file type cannot be processed by AI"
  - Gemini API error: "Something went wrong. Please try again."
  - File too large: "This file is too large for AI processing"
  - Timeout: "The AI took too long. Please try again."

### Vercel Timeout
- Vercel Hobby plan: 10 second function timeout
- Text extraction at upload may take 2-5 seconds for large files — show a "Processing file for AI..." toast during upload
- AI query routes are now fast (database read + Gemini) — should be well within 10 seconds
- Implement a 9 second server-side timeout on Gemini calls as a safety net
- Upgrade to Vercel Pro if timeouts remain an issue

### Chat
- Accept `fileId` from client, fetch `text_content` from database server-side
- Include last 6 messages of chat history for context
- Never stream responses — wait for complete response

### Quiz
- Accept `fileId` from client, fetch `text_content` from database server-side
- Prompt must demand ONLY a JSON array — no markdown, no explanation, no code fences
- Include the exact expected JSON structure as an example in the prompt
- Required structure per question: `{ "question": "", "options": ["A.", "B.", "C.", "D."], "answer": "A.", "explanation": "" }`
- Validate parsed structure before returning — check array, 4 options per question, all fields present
- Wrap JSON.parse in try/catch, strip code fences before parsing
- Never stream responses

---

## UI & Design Rules

- The design references in the table above are the standard — every page must match the quality and feel of its reference
- Consistent design system across every page — same card style, button style, spacing, typography
- No emojis used as UI elements — use Lucide icons
- Every list, table, or grid must show `EmptyState` when there is no data — style empty states after Cosmos
- Every async operation must show a loading state — `LoadingSkeleton` for content, spinner for buttons
- Error messages must be human-readable — never show raw error objects or stack traces
- Toast notifications for all user-facing actions: upload, delete, bookmark, comment
- Fully responsive — works at 375px (mobile), 768px (tablet), 1280px (desktop)
- All interactive elements must have focus states and be keyboard navigable

---

## Git Rules

- One feature per branch
- Commit after every completed step in PLAN.md
- Commit messages describe what changed and why
- Never commit `.env.local` or any file with secrets
- The planning documents (PRD.md, ARCHITECTURE.md, AI_RULES.md, PLAN.md, WINDSURF_PROMPTS.md) live in the project root and are never deleted
