'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, usePathname } from 'next/navigation'
import { useUser } from '@/hooks/useUser'
import { useNotifications } from '@/hooks/useNotifications'
import { Bell, LogOut, Menu, Upload, FileText, BookMarked, ChevronDown, User, Send, Library } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet'
import { NotificationBell } from '@/components/shared/NotificationBell'
import { cn } from '@/lib/utils'

const navLinks = [
  { href: '/browse', label: 'Browse' },
  { href: '/library', label: 'Library' },
  { href: '/bookmarks', label: 'Bookmarks' },
  { href: '/requests', label: 'Requests' },
]

// Upload menu for lecturers and class reps (course files only)
const uploaderMenuItems = [
  { href: '/upload', label: 'Upload Course File', icon: FileText },
  { href: '/manage', label: 'My Files', icon: Upload },
]

// Upload menu for librarians (books only)
const librarianMenuItems = [
  { href: '/library/upload', label: 'Upload Book', icon: Library },
  { href: '/manage-books', label: 'My Books', icon: BookMarked },
]

export default function Navbar() {
  const { user } = useUser()
  const { unreadCount } = useNotifications()
  const router = useRouter()
  const pathname = usePathname()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [uploadMenuOpen, setUploadMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const uploadMenuRef = useRef<HTMLDivElement>(null)
  const userMenuRef = useRef<HTMLDivElement>(null)

  const role = user?.profile?.role
  const isUploaderRole = role === 'lecturer' || role === 'class_rep'
  const isLibrarian = role === 'librarian'
  const uploadMenuItems = isLibrarian ? librarianMenuItems : uploaderMenuItems

  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (uploadMenuRef.current && !uploadMenuRef.current.contains(event.target as Node)) {
        setUploadMenuOpen(false)
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const handleLogout = async () => {
    const { createClientSingleton } = await import('@/lib/supabase/client')
    const supabase = createClientSingleton()
    await supabase.auth.signOut()
    window.location.href = '/login'
  }

  return (
    <nav className="h-14 w-full border-b border-zinc-200 bg-white sticky top-0 z-40">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link href="/dashboard" className="text-lg font-semibold text-zinc-900">
          Scholr
        </Link>

        {/* Desktop Navigation Links */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                'relative py-4 text-sm transition-colors',
                pathname === link.href
                  ? 'text-blue-600'
                  : 'text-zinc-500 hover:text-zinc-900'
              )}
            >
              {link.label}
              {pathname === link.href && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
              )}
            </Link>
          ))}

          {/* Upload dropdown — for lecturer/class_rep/librarian */}
          {(isUploaderRole || isLibrarian) && (
            <div className="relative" ref={uploadMenuRef}>
              <button
                type="button"
                onClick={() => setUploadMenuOpen(!uploadMenuOpen)}
                className={cn(
                  'relative flex items-center gap-1 py-4 text-sm transition-colors',
                  (pathname === '/upload' || pathname === '/manage')
                    ? 'text-blue-600'
                    : 'text-zinc-500 hover:text-zinc-900'
                )}
              >
                Upload
                <ChevronDown className={cn('size-3.5 transition-transform', uploadMenuOpen && 'rotate-180')} />
                {(pathname === '/upload' || pathname === '/manage') && (
                  <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
                )}
              </button>

              {uploadMenuOpen && (
                <div className="absolute left-0 top-full z-50 mt-1 w-52 rounded-md border border-zinc-200 bg-white py-1 shadow-sm">
                  {uploadMenuItems.map((item) => {
                    const Icon = item.icon
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => setUploadMenuOpen(false)}
                        className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                      >
                        <Icon className="size-4 text-zinc-400" />
                        {item.label}
                      </Link>
                    )
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <NotificationBell count={unreadCount} onClick={() => router.push('/notifications')} />

          {/* User Menu — hidden on mobile */}
          {user?.profile && (
            <div className="hidden md:block relative" ref={userMenuRef}>
              <button
                type="button"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-zinc-50"
              >
                <div className="flex size-7 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                  {user.profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                </div>
                <span className="text-zinc-900 text-sm">{user.profile.full_name?.split(' ')[0]}</span>
                <ChevronDown className={cn('size-3.5 text-zinc-400 transition-transform', userMenuOpen && 'rotate-180')} />
              </button>

              {userMenuOpen && (
                <div className="absolute right-0 top-full z-50 mt-1 w-48 rounded-md border border-zinc-200 bg-white py-1 shadow-sm">
                  <div className="px-3 py-2 border-b border-zinc-100">
                    <p className="text-xs font-medium text-zinc-900 truncate">{user.profile.full_name}</p>
                    <p className="text-xs text-zinc-400 capitalize">{user.profile.role?.replace('_', ' ')}</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                  >
                    <User className="size-4 text-zinc-400" />
                    Profile & Settings
                  </Link>
                  {role === 'admin' && (
                    <Link
                      href="/admin"
                      onClick={() => setUserMenuOpen(false)}
                      className="flex items-center gap-2.5 px-3 py-2 text-sm text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                      <FileText className="size-4 text-zinc-400" />
                      Admin Panel
                    </Link>
                  )}
                  <div className="border-t border-zinc-100 mt-1 pt-1">
                    <button
                      type="button"
                      onClick={() => { setUserMenuOpen(false); handleLogout() }}
                      className="flex w-full items-center gap-2.5 px-3 py-2 text-sm text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                    >
                      <LogOut className="size-4 text-zinc-400" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Mobile Menu Button */}
          <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
            <SheetTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="text-zinc-500 hover:text-zinc-900 md:hidden"
                aria-label="Open menu"
              >
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side="right" className="w-72 bg-white p-0">
              <SheetHeader className="border-b border-zinc-200 px-4 py-4">
                <SheetTitle className="text-left text-zinc-900">Menu</SheetTitle>
              </SheetHeader>
              <div className="flex flex-col">
                {/* User Info in Mobile */}
                {user?.profile && (
                  <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-4">
                    <div className="flex size-8 items-center justify-center rounded-full bg-zinc-100 text-zinc-600 text-xs font-medium">
                      {user.profile.full_name?.charAt(0)?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{user.profile.full_name}</p>
                      <p className="text-xs text-zinc-400 capitalize">{user.profile.role?.replace('_', ' ')}</p>
                    </div>
                  </div>
                )}

                {/* Navigation Links */}
                <div className="flex flex-col py-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className={cn(
                        'px-4 py-3 text-sm transition-colors',
                        pathname === link.href
                          ? 'bg-zinc-50 text-blue-600'
                          : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}

                  {/* Upload section for uploaders */}
                  {isUploaderRole && (
                    <>
                      <div className="px-4 pt-4 pb-1">
                        <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Upload</p>
                      </div>
                      {uploadMenuItems.map((item) => {
                        const Icon = item.icon
                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={() => setMobileMenuOpen(false)}
                            className={cn(
                              'flex items-center gap-2.5 px-4 py-3 text-sm transition-colors',
                              pathname === item.href.split('?')[0]
                                ? 'bg-zinc-50 text-blue-600'
                                : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                            )}
                          >
                            <Icon className="size-4" />
                            {item.label}
                          </Link>
                        )
                      })}
                    </>
                  )}

                  {/* Profile link */}
                  <div className="px-4 pt-4 pb-1">
                    <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide">Account</p>
                  </div>
                  <Link
                    href="/profile"
                    onClick={() => setMobileMenuOpen(false)}
                    className={cn(
                      'flex items-center gap-2.5 px-4 py-3 text-sm transition-colors',
                      pathname === '/profile'
                        ? 'bg-zinc-50 text-blue-600'
                        : 'text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900'
                    )}
                  >
                    <User className="size-4" />
                    Profile & Settings
                  </Link>
                </div>

                {/* Logout */}
                <div className="border-t border-zinc-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => { handleLogout(); setMobileMenuOpen(false) }}
                    className="flex w-full items-center gap-2 text-sm text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    <LogOut className="size-4" />
                    Log out
                  </button>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </nav>
  )
}
