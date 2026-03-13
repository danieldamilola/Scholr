'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'
import type { UserRole } from '@/types'

interface RoleGuardProps {
  children: React.ReactNode
  allowedRoles: UserRole[]
}

export default function RoleGuard({ children, allowedRoles }: RoleGuardProps) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user?.role && !allowedRoles.includes(user.role)) {
      router.push('/dashboard')
    }
  }, [user, loading, router, allowedRoles])

  // Show loading or children based on auth state and role
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  // If no session or role not allowed, don't render children
  if (!user?.session || !user?.role || !allowedRoles.includes(user.role)) {
    return null // Don't render anything while redirecting
  }

  return <>{children}</>
}
