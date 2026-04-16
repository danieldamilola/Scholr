'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { useFiles } from '@/hooks/useFiles'
import { useBookmarks } from '@/hooks/useBookmarks'
import { useNotifications } from '@/hooks/useNotifications'
import {
  FileText, Bookmark, Bell, Upload, BookOpen, ArrowRight,
  Search, Library, FolderOpen
} from 'lucide-react'
import { FileCard } from '@/components/files/FileCard'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

export function ClassRepDashboard() {
  const { user } = useUser()
  const { data: recentFiles, loading: filesLoading } = useFiles({ page: 1, sortBy: 'newest', materialType: 'course_material' })
  const { bookmarkedFileIds } = useBookmarks()
  const { unreadCount } = useNotifications()

  const name = user?.profile?.full_name?.split(' ')[0] || 'there'
  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  const bookmarkedFiles = recentFiles?.filter(f => bookmarkedFileIds.has(f.id)) || []

  // Stats: same as student
  const stats = [
    { label: 'Recent Files', value: recentFiles?.length ?? 0, icon: FileText },
    { label: 'Bookmarks', value: bookmarkedFileIds.size, icon: Bookmark },
    { label: 'Notifications', value: unreadCount, icon: Bell },
  ]

  // Upload actions: same as lecturer
  const uploadActions = [
    { href: '/upload?tab=file', label: 'Upload Course Material', icon: Upload, desc: 'Share lecture notes, slides, past papers' },
    { href: '/upload?tab=book', label: 'Upload Library Book', icon: BookOpen, desc: 'Add textbooks and references' },
    { href: '/manage', label: 'Manage My Files', icon: FolderOpen, desc: 'View and delete your uploads' },
  ]

  // Browse actions: same as student
  const browseActions = [
    { href: '/browse', label: 'Browse Files', icon: Search, desc: 'Find course materials' },
    { href: '/library', label: 'Library', icon: Library, desc: 'Textbooks & references' },
    { href: '/bookmarks', label: 'Bookmarks', icon: Bookmark, desc: 'Your saved files' },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">

      {/* Hero greeting */}
      <div className="mb-8">
        <h1 className="text-[28px] font-semibold text-zinc-900 mb-1">
          {greeting}, {name} 👋
        </h1>
        <p className="text-[14px] text-zinc-500">
          Class Representative ·{' '}
          {[user?.profile?.department, user?.profile?.level ? `Level ${user.profile.level}` : null]
            .filter(Boolean).join(', ') || 'Scholr'}
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
        {stats.map(({ label, value, icon: Icon }) => (
          <div key={label} className="bg-white border border-zinc-200 rounded-md p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-medium text-zinc-500 uppercase tracking-wide">{label}</p>
              <div className="p-1.5 bg-zinc-100 rounded-md">
                <Icon className="size-4 text-zinc-500" />
              </div>
            </div>
            <p className="text-3xl font-bold text-zinc-900">{value}</p>
          </div>
        ))}
      </div>

      {/* Upload Actions (Lecturer side) */}
      <div className="mb-8">
        <h2 className="text-[16px] font-semibold text-zinc-900 mb-3">Upload & Manage</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {uploadActions.map(({ href, label, icon: Icon, desc }) => (
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

      {/* Browse Actions (Student side) */}
      <div className="mb-10">
        <h2 className="text-[16px] font-semibold text-zinc-900 mb-3">Browse & Study</h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {browseActions.map(({ href, label, icon: Icon, desc }) => (
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

      {/* Recent Files (Student side) */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[16px] font-semibold text-zinc-900">Recent Files</h2>
          <Link href="/browse" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
            View all <ArrowRight className="size-3.5" />
          </Link>
        </div>
        {filesLoading ? (
          <LoadingSkeleton variant="card" count={4} />
        ) : recentFiles && recentFiles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentFiles.slice(0, 6).map(file => (
              <FileCard key={file.id} file={file} isBookmarked={bookmarkedFileIds.has(file.id)} />
            ))}
          </div>
        ) : (
          <div className="bg-white border border-zinc-200 rounded-md py-12 text-center">
            <FileText className="size-7 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
            <p className="text-sm text-zinc-500">No files available yet.</p>
          </div>
        )}
      </div>

      {/* Bookmarks (if any) */}
      {bookmarkedFiles.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[16px] font-semibold text-zinc-900">Your Bookmarks</h2>
            <Link href="/bookmarks" className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1">
              View all <ArrowRight className="size-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {bookmarkedFiles.slice(0, 3).map(file => (
              <FileCard key={file.id} file={file} isBookmarked />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
