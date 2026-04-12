'use client'

import { useUser } from '@/hooks/useUser'
import { useRouter } from 'next/navigation'
import { useEffect } from 'react'

interface AuthGuardProps {
  children: React.ReactNode
}

export default function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useUser()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user?.session) {
      router.push('/login')
    }
  }, [user, loading, router])

  // Show loading or children based on auth state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-spin rounded-full size-8 border-b-2 border-foreground"></div>
      </div>
    )
  }

  if (!user?.session) {
    return null // Don't render anything while redirecting
  }

  return <>{children}</>
}
