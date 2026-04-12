'use client'

import { useUser } from '@/hooks/useUser'
import { StudentDashboard } from '@/components/dashboard/StudentDashboard'
import LecturerDashboard from '@/components/dashboard/LecturerDashboard'
import { ClassRepDashboard } from '@/components/dashboard/ClassRepDashboard'
import { LibrarianDashboard } from '@/components/dashboard/LibrarianDashboard'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'

export default function DashboardPage() {
  const { user, loading } = useUser()

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <p className="text-center text-zinc-500">Please log in to view your dashboard.</p>
      </div>
    )
  }

  const role = user.profile?.role

  if (role === 'class_rep') return <ClassRepDashboard />
  if (role === 'lecturer') return <LecturerDashboard />
  if (role === 'librarian') return <LibrarianDashboard user={user} />
  return <StudentDashboard />
}
