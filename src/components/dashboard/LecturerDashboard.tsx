'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { Upload, FileText, BookOpen, ArrowRight, FolderOpen } from 'lucide-react'

export default function LecturerDashboard() {
  const { user } = useUser()

  const name = user?.profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'
  const isClassRep = user?.profile?.role === 'class_rep'

  const quickActions = [
    {
      href: '/upload?tab=file',
      label: 'Upload Course Material',
      icon: Upload,
      desc: 'Share lecture notes, slides, or past papers',
    },
    {
      href: '/upload?tab=book',
      label: 'Upload Library Book',
      icon: BookOpen,
      desc: 'Add textbooks and references',
    },
    {
      href: '/manage',
      label: 'Manage My Files',
      icon: FolderOpen,
      desc: 'View and delete your uploaded files',
    },
    {
      href: '/browse',
      label: 'Browse All Files',
      icon: FileText,
      desc: 'Search all course materials',
    },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">

      {/* Hero greeting */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-zinc-900 mb-1">
          {greeting}, {name} 👋
        </h1>
        <p className="text-[14px] text-zinc-500">
          {isClassRep ? 'Class Representative' : 'Lecturer'} · {[user?.profile?.college, user?.profile?.department].filter(Boolean).join(' · ') || 'Scholr'}
        </p>
      </div>

      {/* Quick Actions */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-zinc-900 mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {quickActions.map(({ href, label, icon: Icon, desc }) => (
            <Link
              key={href}
              href={href}
              className="group flex items-center gap-4 bg-white border border-zinc-200 rounded-md p-4 hover:border-zinc-300 hover:shadow-sm transition-all"
            >
              <div className="p-2.5 bg-zinc-100 group-hover:bg-blue-50 rounded-md transition-colors shrink-0">
                <Icon className="size-5 text-zinc-500 group-hover:text-blue-600 transition-colors" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-zinc-900">{label}</p>
                <p className="text-xs text-zinc-400">{desc}</p>
              </div>
              <ArrowRight className="size-4 text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>

      {/* Tips card */}
      <div className="bg-white border border-zinc-200 rounded-md p-6">
        <h3 className="text-[15px] font-semibold text-zinc-900 mb-3">Getting started</h3>
        <ul className="space-y-2">
          {[
            'Upload course materials to help students study more effectively.',
            'PDFs are preferred — AI study assistant and quiz features only work with text-based PDFs.',
            'Students can bookmark, download, and discuss every file you upload.',
          ].map((tip, i) => (
            <li key={i} className="flex items-start gap-2.5 text-sm text-zinc-500">
              <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-zinc-100 text-zinc-500 text-xs font-medium mt-0.5">{i + 1}</span>
              {tip}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
