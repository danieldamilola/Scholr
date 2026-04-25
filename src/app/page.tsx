import Link from 'next/link'
import {
  FileText, Sparkles, BrainCircuit, BookMarked, Bell, Shield, ArrowRight
} from 'lucide-react'
import { FadeIn } from '@/components/landing/FadeIn'

const features = [
  { icon: FileText,     title: 'Course Materials',   desc: 'Notes, slides, and past questions organised by department, level, and semester.' },
  { icon: BrainCircuit, title: 'AI Study Assistant', desc: 'Ask questions about any uploaded file and get accurate, contextual answers instantly.' },
  { icon: Sparkles,     title: 'Quiz Generator',     desc: 'Auto-generate exam-style questions from any document with one click.' },
  { icon: BookMarked,   title: 'Digital Library',    desc: 'Browse textbooks and reference books maintained by dedicated librarians.' },
  { icon: Bell,         title: 'Request System',     desc: 'Request materials from lecturers or class reps and get notified when they respond.' },
  { icon: Shield,       title: 'Secured Access',     desc: 'Invite-code protected — only verified students and staff can register.' },
]

const roles = [
  { title: 'Students',   desc: 'Browse, download, bookmark, and study with AI — all from your dashboard.' },
  { title: 'Lecturers',  desc: 'Upload and manage course materials. Respond to student requests.' },
  { title: 'Class Reps', desc: 'Share resources and coordinate materials for your entire class.' },
  { title: 'Librarians', desc: 'Manage the digital library, upload textbooks and reference books.' },
]

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-page font-sans antialiased">

      {/* Navbar */}
      <nav className="fixed top-0 inset-x-0 z-50 h-14 border-b border-border bg-surface/95 backdrop-blur-sm">
        <div className="mx-auto flex h-full max-w-5xl items-center justify-between px-6">
          {/* Logo fades in immediately */}
          <span className="anim-fade-in text-sm font-bold text-ink tracking-tight">Scholr</span>
          <div className="anim-fade-in delay-200 flex items-center gap-1">
            <Link href="/login" className="h-8 px-4 text-sm text-ink-soft hover:text-ink transition-colors flex items-center">
              Sign in
            </Link>
            <Link href="/signup" className="h-8 px-4 text-sm bg-brand hover:bg-brand-hover text-white font-medium rounded-md transition-colors flex items-center gap-1.5">
              Get started <ArrowRight className="size-3" />
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero — staggered load animations */}
      <section className="max-w-5xl mx-auto px-6 pt-40 pb-32">
        {/* Label */}
        <p className="anim-fade-up text-xs font-semibold uppercase tracking-widest text-ink-muted mb-7">
          Academic Resource Platform
        </p>

        {/* Heading staggered by word-group */}
        <div className="overflow-hidden mb-8">
          <h1 className="anim-fade-up delay-100 text-6xl sm:text-7xl font-bold tracking-tight text-ink leading-[1.06] max-w-2xl">
            Study smarter.
            <br />
            <span className="anim-fade-up delay-200 inline-block text-blue-600">Access more.</span>
          </h1>
        </div>

        <div className="anim-fade-up delay-300 flex flex-col sm:flex-row sm:items-end justify-between gap-10">
          <p className="text-base text-ink-muted max-w-sm leading-relaxed">
            One platform for MTU students, lecturers, and class reps
            to share course materials and learn with AI.
          </p>
          <div className="flex items-center gap-4 shrink-0">
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-10 px-5 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md transition-colors"
            >
              Get started <ArrowRight className="size-3.5" />
            </Link>
            <Link href="/login" className="text-sm text-ink-muted hover:text-ink transition-colors">
              Sign in →
            </Link>
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-border" /></div>

      {/* Features */}
      <section className="max-w-5xl mx-auto px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16">

          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted pt-1">
              What&apos;s inside
            </p>
          </FadeIn>

          <div>
            {features.map((f, i) => {
              const Icon = f.icon
              return (
                <FadeIn key={f.title} delay={i * 60}>
                  <div className={`flex items-start gap-5 py-6 ${i !== features.length - 1 ? 'border-b border-border' : ''}`}>
                    <div className="mt-0.5 shrink-0 size-8 flex items-center justify-center rounded-md bg-subtle border border-border">
                      <Icon className="size-3.5 text-ink-muted" />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-ink mb-1">{f.title}</p>
                      <p className="text-sm text-ink-muted leading-relaxed">{f.desc}</p>
                    </div>
                  </div>
                </FadeIn>
              )
            })}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-border" /></div>

      {/* Roles */}
      <section className="max-w-5xl mx-auto px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16">

          <FadeIn>
            <p className="text-xs font-semibold uppercase tracking-widest text-ink-muted pt-1">
              Who it&apos;s for
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-12 gap-y-10">
            {roles.map((r, i) => (
              <FadeIn key={r.title} delay={i * 80}>
                <p className="text-sm font-semibold text-ink mb-1.5">{r.title}</p>
                <p className="text-sm text-ink-muted leading-relaxed">{r.desc}</p>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* Divider */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-border" /></div>

      {/* CTA */}
      <section className="max-w-5xl mx-auto px-6 py-28">
        <div className="grid grid-cols-1 lg:grid-cols-[240px_1fr] gap-16">
          <div />
          <FadeIn>
            <h2 className="text-3xl font-bold text-ink mb-4 leading-tight">
              Ready to get started?
            </h2>
            <p className="text-sm text-ink-muted mb-8 max-w-sm leading-relaxed">
              Sign up with your MTU invite code and join your fellow students on Scholr.
            </p>
            <Link
              href="/signup"
              className="inline-flex items-center gap-2 h-10 px-6 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md transition-colors"
            >
              Create your account <ArrowRight className="size-3.5" />
            </Link>
          </FadeIn>
        </div>
      </section>

      {/* Footer */}
      <div className="max-w-5xl mx-auto px-6"><div className="border-t border-border" /></div>
      <footer className="max-w-5xl mx-auto px-6 py-8 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <span className="text-xs font-semibold text-ink-muted">Scholr</span>
        <span className="text-xs text-ink-muted">© {new Date().getFullYear()} Mountain Top University</span>
        <div className="flex gap-5">
          <Link href="/login" className="text-xs text-ink-muted hover:text-ink transition-colors">Sign in</Link>
          <Link href="/signup" className="text-xs text-ink-muted hover:text-ink transition-colors">Sign up</Link>
        </div>
      </footer>

    </div>
  )
}
