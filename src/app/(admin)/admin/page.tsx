'use client'

import { useEffect, useState } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import { Users, FileText, BookOpen, Download, Trash2, Loader2, ShieldAlert } from 'lucide-react'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'

type UserProfile = {
  id: string
  full_name: string | null
  email: string | null
  role: string | null
  college: string | null
  department: string | null
  programmes: string[] | null
  level: string | null
  created_at: string
}

const ROLE_COLORS: Record<string, string> = {
  student: 'bg-zinc-100 text-zinc-600',
  lecturer: 'bg-blue-50 text-blue-700',
  class_rep: 'bg-purple-50 text-purple-700',
  admin: 'bg-red-50 text-red-700',
}

export default function AdminPage() {
  const [stats, setStats] = useState({ users: 0, files: 0, books: 0, downloads: 0 })
  const [users, setUsers] = useState<UserProfile[]>([])
  const [statsLoading, setStatsLoading] = useState(true)
  const [usersLoading, setUsersLoading] = useState(true)
  const [deletingUserId, setDeletingUserId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'users'>('overview')

  useEffect(() => {
    fetchStats()
    fetchUsers()
  }, [])

  async function fetchStats() {
    try {
      const supabase = createClientSingleton()
      const [{ count: usersCount }, { count: filesCount }, { count: booksCount }] = await Promise.all([
        supabase.from('profiles').select('*', { count: 'exact', head: true }),
        supabase.from('files').select('*', { count: 'exact', head: true }),
        supabase.from('books').select('*', { count: 'exact', head: true }),
      ])
      setStats({ users: usersCount || 0, files: filesCount || 0, books: booksCount || 0, downloads: 0 })
    } catch (error) {
      console.error('Failed to fetch stats:', error)
    } finally {
      setStatsLoading(false)
    }
  }

  async function fetchUsers() {
    try {
      const supabase = createClientSingleton()
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false })
      if (error) throw error
      setUsers(data || [])
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setUsersLoading(false)
    }
  }

  async function handleDeleteUser() {
    if (!deletingUserId) return
    setIsDeleting(true)
    try {
      const supabase = createClientSingleton()
      // Delete profile (cascade should handle auth.users if set up in Supabase)
      const { error } = await supabase.from('profiles').delete().eq('id', deletingUserId)
      if (error) throw error
      setUsers((prev) => prev.filter((u) => u.id !== deletingUserId))
      setStats((prev) => ({ ...prev, users: prev.users - 1 }))
    } catch (error) {
      console.error('Failed to delete user:', error)
    } finally {
      setIsDeleting(false)
      setDeletingUserId(null)
    }
  }

  const statCards = [
    { label: 'Total Users', value: stats.users, icon: Users, color: 'text-blue-600', bg: 'bg-blue-50' },
    { label: 'Course Files', value: stats.files, icon: FileText, color: 'text-green-600', bg: 'bg-green-50' },
    { label: 'Library Books', value: stats.books, icon: BookOpen, color: 'text-purple-600', bg: 'bg-purple-50' },
    { label: 'Total Downloads', value: stats.downloads, icon: Download, color: 'text-orange-600', bg: 'bg-orange-50' },
  ]

  return (
    <div className="container mx-auto max-w-6xl px-4 py-10">
      {/* Page Header */}
      <div className="mb-8 flex items-center gap-3">
        <div className="p-2 bg-red-50 rounded-md">
          <ShieldAlert className="size-5 text-red-600" />
        </div>
        <div>
          <h1 className="text-[24px] font-semibold text-zinc-900">Admin Panel</h1>
          <p className="text-[14px] text-zinc-500">Manage users and platform content.</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-zinc-200 mb-8">
        <div className="flex gap-6">
          {(['overview', 'users'] as const).map((tab) => (
            <button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              className={`relative pb-3 text-sm font-medium transition-colors capitalize ${
                activeTab === tab ? 'text-blue-600' : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              {tab}
              {activeTab === tab && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600 rounded-t" />
              )}
            </button>
          ))}
        </div>
      </div>

      {activeTab === 'overview' && (
        <>
          {statsLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-5 text-zinc-400 animate-spin" />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {statCards.map((card) => {
                const Icon = card.icon
                return (
                  <div key={card.label} className="bg-white border border-zinc-200 rounded-md p-5">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 ${card.bg} rounded-md`}>
                        <Icon className={`size-5 ${card.color}`} />
                      </div>
                      <div>
                        <p className="text-xl font-bold text-zinc-900">{card.value}</p>
                        <p className="text-xs text-zinc-500">{card.label}</p>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

      {activeTab === 'users' && (
        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          {usersLoading ? (
            <div className="flex justify-center py-16">
              <Loader2 className="size-5 text-zinc-400 animate-spin" />
            </div>
          ) : users.length === 0 ? (
            <div className="py-16 text-center">
              <Users className="size-8 text-zinc-300 mx-auto mb-3" strokeWidth={1.5} />
              <p className="text-sm text-zinc-500">No users found.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-zinc-200 bg-zinc-50">
                    <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Name</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Role</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden md:table-cell">Department</th>
                    <th className="text-left py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide hidden lg:table-cell">Joined</th>
                    <th className="text-right py-3 px-4 text-xs font-semibold text-zinc-500 uppercase tracking-wide">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id} className="border-b border-zinc-100 hover:bg-zinc-50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium shrink-0">
                            {user.full_name?.charAt(0)?.toUpperCase() || '?'}
                          </div>
                          <div>
                            <div className="text-sm font-medium text-zinc-900">{user.full_name || '—'}</div>
                            <div className="text-xs text-zinc-400">{user.email || '—'}</div>
                          </div>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize ${ROLE_COLORS[user.role || ''] || 'bg-zinc-100 text-zinc-600'}`}>
                          {user.role?.replace('_', ' ') || '—'}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-500 hidden md:table-cell">
                        {user.department || '—'}
                      </td>
                      <td className="py-3 px-4 text-sm text-zinc-500 hidden lg:table-cell">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="py-3 px-4 text-right">
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <button
                              type="button"
                              onClick={() => setDeletingUserId(user.id)}
                              className="inline-flex items-center justify-center p-1.5 rounded-md text-zinc-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Delete user"
                            >
                              <Trash2 className="size-4" />
                            </button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete User Account</AlertDialogTitle>
                              <AlertDialogDescription>
                                Are you sure you want to permanently delete <strong>{user.full_name || user.email}</strong>? This will remove their profile and all associated data. This action cannot be undone.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel onClick={() => setDeletingUserId(null)}>
                                Cancel
                              </AlertDialogCancel>
                              <AlertDialogAction
                                onClick={handleDeleteUser}
                                disabled={isDeleting}
                                className="bg-red-600 hover:bg-red-700 text-white"
                              >
                                {isDeleting ? (
                                  <span className="flex items-center gap-2">
                                    <Loader2 className="size-4 animate-spin" /> Deleting...
                                  </span>
                                ) : 'Delete User'}
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
