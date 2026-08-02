# Design System: Scholr

## 1. Visual Theme & Atmosphere
Scholr employs a highly-polished, premium academic interface heavily inspired by macOS design philosophy. The atmosphere is quiet, rigorous, and completely free of distraction. The system relies on soft, subtle layering where each elevation level rises gently from the one below, rather than relying on heavy drop shadows.

The design is built on a custom Tailwind CSS v4 foundation using a class-based dark mode (`@custom-variant dark`) and heavily leverages custom semantic CSS properties (`@theme`) to map precise light and dark mode colors.

## 2. Color Palette & Roles
The design relies on a strict, unified monochrome scale paired with a muted academic green (`--color-brand`), maintaining high contrast and minimizing cognitive load. The dark mode explicitly rejects cool, blue-tinted darks in favor of warm, neutral grays to reduce eye strain.

### Surface Architecture (macOS Elevation Ladder)
- **Page** (`--color-page`): `#F9FAFB` (Light) / `#1C1C1E` (Dark) — The absolute base background layer (window chrome).
- **Surface** (`--color-surface`): `#FFFFFF` (Light) / `#252527` (Dark) — Standard cards, sidebars, and nav panels.
- **Raised** (`--color-surface-raised`): `#FFFFFF` (Light) / `#2F2F31` (Dark) — Modals, popovers, and dropdown menus (one step above card).
- **Subtle** (`--color-subtle`): `#F4F4F5` (Light) / `#333335` (Dark) — Hover states, selected items, and pill fills.

### Text Hierarchy (macOS-style)
- **Ink** (`--color-ink`): `#09090B` (Light) / `#FFFFFF` (Dark) — Primary headings and high-emphasis text.
- **Soft Ink** (`--color-ink-soft`): `#3F3F46` (Light) / `#E5E5EA` (Dark) — Standard body text and table cells.
- **Muted Ink** (`--color-ink-muted`): `#71717A` (Light) / `#8E8E93` (Dark) — Timestamps, hints, and secondary labels.

### Brand & Semantic
- **Brand Green:** Base `#285A48` (Light) scaling to a more vibrant `#4D9279` in Dark mode.
- **Status Colors:** Mapped precisely to macOS native semantic colors (e.g., Success: `#34C759`, Error: `#FF3B30`, Warning: `#FF9500`, Info: `#007AFF`).

## 3. Typography Rules
- **Font Stack:** Configured globally in `@layer base` using `Geist` as the primary sans-serif font (`font-family: "Geist", "system-ui", "sans-serif"`). 
- **Text Selection:** Custom text selection utility to match the brand color: `bg-brand-muted` with `#ffffff` text (transparent mix in dark mode).

## 4. Component Stylings & Custom Utilities
The project implements completely bespoke UI components extending radix primitives (`shadcn/ui`), completely overhauling the defaults.

- **Buttons (`src/components/ui/button.tsx`):**
  - Extremely tactile physical interaction using `active:not-aria-[haspopup]:translate-y-px` to simulate a real button press (moving down exactly 1px).
  - Outlines are tightly controlled using custom focus rings (`focus-visible:ring-3 focus-visible:ring-ring/50`).
- **Frosted Glass (`@utility bg-frost`):**
  - A custom Tailwind v4 utility is defined to create true macOS blurred backgrounds: `color-mix(in srgb, var(--color-surface) 70%, transparent)` with `backdrop-filter: blur(20px)`.
- **Scrollbars:**
  - Bespoke native macOS-style scrollbars implemented for dark mode (`scrollbar-color: #48484a #252527`) with `6px` track width and hover states on the thumb.
- **Focus Rings:**
  - A custom macOS focus ring utility (`@utility focus-ring-mac`) is provided, utilizing `ring-2 ring-brand-muted/60 ring-offset-page`.

## 5. Layout Principles
- **Grid-First Architecture:** CSS Grid is preferred over complex Flexbox math for document listings. 
- **Mobile-First Collapse:** Strict single-column collapse below `768px`.
- **Fluid Utilities:** Because the project uses Tailwind v4 (`@import "tailwindcss"`), styles are applied using standard utilities, but heavily backed by semantic tokens (e.g. `bg-page`, `text-ink-soft`).

## 6. Motion & Interaction (globals.css)
Motion is hardcoded into CSS for maximum performance and avoids heavy JS physics libraries when possible.
- **Theme Transitions:** Global `0.35s ease` transition on `background-color`, `border-color`, and `box-shadow` to ensure switching between dark and light mode feels seamless, wrapping in a `prefers-reduced-motion` media query.
- **Landing Page Animations:**
  - `.anim-fade-up`: `transform: translateY(22px)` fading to `0` over `0.55s cubic-bezier(0.22, 1, 0.36, 1)`.
  - `.scroll-fade`: Scroll-triggered animation that starts off-screen (`translateY(18px)`) and animates in when JavaScript applies `.is-visible`.
  - **Staggered Orchestration:** Helper classes (`.delay-100`, `.delay-200`, up to `.delay-600`) ensure waterfall reveals for lists and search results.

## 7. Anti-Patterns (Strictly Banned)
- **No generic zinc/slate color classes:** Developers MUST use the semantic utilities (e.g., `text-ink` instead of `text-zinc-900`) so the app can flawlessly transition between the distinct light mode and macOS-dark mode palettes.
- **No raw hex codes in components:** All colors must be routed through `globals.css` `@theme` variables.
- **No default scrollbars in dark mode:** The custom webkit scrollbar overrides must be respected to maintain the premium feel.
- **No overlapping z-indexes:** Elevation is handled by the semantic background colors (`bg-surface`, `bg-raised`), not just heavy drop shadows. Light mode uses precise shadow stops (`shadow-sm` through `shadow-xl`) that are disabled in dark mode.

## 8. UX Architecture & Flows
Scholr is designed to optimize "Speed to Value." A core success criterion is that a student can sign up, find a document for their specific program and level, and ask the AI a question in under 2 minutes.

### Role-Based Access Control (RBAC) UX
The interface adapts dynamically based on the user's role:
- **Students:** See a streamlined discovery UI. The focus is exclusively on search, library access, and AI interaction.
- **Class Reps & Lecturers:** Gain embedded "Management" actions within the standard UI (e.g., inline "Upload File" buttons, statistics on file downloads) rather than being forced into a completely separate dashboard, reducing context switching.
- **Admins:** The only role with a completely isolated portal. Admin routes are strictly separated from the main academic flow to prevent accidental data modification.

### Discovery & Taxonomy
- **Progressive Disclosure:** Upload and search flows utilize a cascading taxonomy (`College -> Department -> Programme -> Level -> Semester`). 
- **Frictionless Search:** Users can bypass the deep taxonomy entirely by using the full-text search which indexes titles, course codes, and file descriptions simultaneously.

### The "In-Context" AI Experience
- **Zero-Context Switching:** The AI Study Assistant and Quiz Generator are embedded directly into the File Detail page alongside the in-browser PDF preview. Students do not need to download a file and upload it to a separate external AI window.
- **Strict Grounding:** The UX of the AI is designed to build trust. The AI is prompted to answer *strictly* from the document and explicitly state when it doesn't know, preventing hallucinations that could hurt academic studying.

### Community & Interaction
- **Contextual Discussions:** Instead of a global forum, discussions are threaded directly onto specific course materials. 
- **Signal over Noise:** Lecturers and Class Reps have the authority to mark a student's reply as "Helpful", immediately elevating the best answers to the top of the thread.

### Frictionless Uploads
- **One-Screen Upload:** Lecturers and Class Reps can upload a file and define all its metadata (tags, level, course code) in a single unified flow, rather than a multi-step wizard, satisfying the "under 3 minutes" upload success criteria.
