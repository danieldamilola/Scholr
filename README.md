# Scholr

Scholr is a highly-polished, feature-rich university course-material sharing platform built for Mountain Top University (MTU). It enables powerful academic collaboration by allowing students, lecturers, class reps, and administrators to upload, discover, and interact with academic files.

It features a built-in AI Study Assistant and Practice Quiz generator powered by Google Gemini to help students digest and test their knowledge on course materials instantly.

---

## 🚀 Features

- **Role-Based Access Control:** Secure, robust user profiles for Students, Class Reps, Lecturers, and Admins via Supabase.
- **Academic Taxonomy:** Cascading selection for Colleges, Departments, Programmes, and Levels to perfectly organize materials.
- **Smart Search & Filtering:** Instantly filter materials by semester, level, course code, or semantic text search.
- **AI Study Assistant:** Context-aware LLM chat that answers questions based *strictly* on the document you are reading.
- **AI Practice Quizzes:** Automatically extracts text from uploaded PDFs, DOCXs, and TXTs to generate interactive multiple-choice quizzes with detailed explanations.
- **Discussion Threads & Bookmarks:** Engage with peers on specific course materials, mark answers as helpful, and save files to your personal library.
- **Admin Dashboard:** Fully isolated portal for administrators to manage users and moderate content (books and files).
- **Premium UI:** A unified, minimalist "zinc" design system built with TailwindCSS and shadcn/ui.

---

## 🛠️ Tech Stack

- **Framework:** Next.js 16.1.6 (App Router)
- **Language:** TypeScript 5
- **Styling:** TailwindCSS 4, shadcn/ui (Radix Primitives)
- **Database & Auth:** Supabase (PostgreSQL, Auth, Storage with RLS)
- **AI Backend:** Google Gemini (via `groq-sdk` running Llama 3.3 70B)
- **Document Parsing:** `pdf-parse`, `mammoth`

---

## 💻 Getting Started Locally

### 1. Clone the repository
\`\`\`bash
git clone https://github.com/your-username/scholr.git
cd scholr
\`\`\`

### 2. Install dependencies
\`\`\`bash
npm install
\`\`\`

### 3. Environment Variables
Copy the example environment file and fill in your Supabase & Groq API keys:
\`\`\`bash
cp .env.example .env.local
\`\`\`

Required variables:
- \`NEXT_PUBLIC_SUPABASE_URL\`
- \`NEXT_PUBLIC_SUPABASE_ANON_KEY\`
- \`SUPABASE_SERVICE_ROLE_KEY\`
- \`GROQ_API_KEY\`
- \`ADMIN_SIGNUP_CODE\` (Used to securely authorize new admin registrations)

### 4. Run the Development Server
\`\`\`bash
npm run dev
\`\`\`

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

---

## 🔒 Security Posture

- **Row Level Security (RLS):** All 7 PostgreSQL tables are strictly protected by RLS.
- **Route Guards:** Robust middleware redirects unauthenticated users and prevents non-admins from loading the admin portal.
- **Server-Side API:** AI keys and admin service roles only execute on the server API routes. They are never bundled to the client.

## 📄 License
This project is licensed under the MIT License.
