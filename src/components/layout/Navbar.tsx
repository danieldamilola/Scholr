'use client'

import Link from 'next/link'
import { useUser } from '@/hooks/useUser'
import { Bell, LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'

export default function Navbar() {
  const { user } = useUser()

  const handleLogout = async () => {
    const { createClientSingleton } = await import('@/lib/supabase/client')
    const supabase = createClientSingleton()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter:saturate(100%)_contrast(0.75)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard" className="flex items-center space-x-2">
              <span className="font-bold">Scholr</span>
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link href="/browse" className="text-muted-foreground hover:text-foreground">
              Browse
            </Link>
            <Link href="/library" className="text-muted-foreground hover:text-foreground">
              Library
            </Link>
          </div>

          {user?.session && (
            <div className="flex items-center space-x-4">
              <Button variant="ghost" size="sm" onClick={() => {}}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm">
                <Bell className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={handleLogout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        <div className="flex items-center space-x-4">
          <Button variant="outline" size="sm">
            <Bell className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </nav>
  )
}
