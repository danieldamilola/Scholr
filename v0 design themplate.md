//SIGNUP PAGE
"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Users } from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { colleges, departments, programmes, levels, type Role } from "@/lib/academic-data"

type FormErrors = {
  fullName?: string
  email?: string
  password?: string
  confirmPassword?: string
  role?: string
  college?: string
  department?: string
  programme?: string
  level?: string
}

export default function SignupPage() {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [college, setCollege] = useState("")
  const [department, setDepartment] = useState("")
  const [programme, setProgramme] = useState("")
  const [level, setLevel] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<FormErrors>({})

  const availableDepartments = college ? departments[college] || [] : []
  const availableProgrammes = department ? programmes[department] || [] : []

  const handleCollegeChange = (value: string) => {
    setCollege(value)
    setDepartment("")
    setProgramme("")
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setProgramme("")
  }

  const validateForm = (): boolean => {
    const newErrors: FormErrors = {}

    if (!fullName.trim()) {
      newErrors.fullName = "Full name is required"
    }

    if (!email.trim()) {
      newErrors.email = "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Please enter a valid email"
    }

    if (!password) {
      newErrors.password = "Password is required"
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters"
    }

    if (!confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password"
    } else if (password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    if (!role) {
      newErrors.role = "Please select a role"
    }

    if (!college) {
      newErrors.college = "Please select a college"
    }

    if (!department) {
      newErrors.department = "Please select a department"
    }

    if (role !== "lecturer") {
      if (!programme) {
        newErrors.programme = "Please select a programme"
      }
      if (!level) {
        newErrors.level = "Please select a level"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)

    // Simulate signup attempt
    await new Promise((resolve) => setTimeout(resolve, 1500))

    setIsLoading(false)
  }

  const roleOptions = [
    { id: "student" as const, label: "Student", icon: GraduationCap },
    { id: "lecturer" as const, label: "Lecturer", icon: BookOpen },
    { id: "classrep" as const, label: "Class Rep", icon: Users },
  ]

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 py-12 px-4">
      <div className="bg-white border border-zinc-200 rounded-md p-8 w-full max-w-lg">
        <h1 className="text-zinc-900 font-bold text-xl mb-1">Scholr</h1>
        <p className="text-zinc-400 text-sm mb-6">Create your account to get started.</p>

        <form onSubmit={handleSubmit}>
          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-3">
            Account Details
          </p>

          <div className="mb-4">
            <label htmlFor="fullName" className="block text-zinc-700 text-sm font-medium mb-1">
              Full Name
            </label>
            <input
              id="fullName"
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="John Doe"
              className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3"
            />
            {errors.fullName && (
              <p className="text-red-600 text-sm mt-1">{errors.fullName}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="email" className="block text-zinc-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3"
            />
            {errors.email && (
              <p className="text-red-600 text-sm mt-1">{errors.email}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="password" className="block text-zinc-700 text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          <div className="mb-4">
            <label htmlFor="confirmPassword" className="block text-zinc-700 text-sm font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm mt-1">{errors.confirmPassword}</p>
            )}
          </div>

          <p className="text-zinc-400 text-xs font-medium uppercase tracking-wide mb-3 mt-6">
            Academic Profile
          </p>

          <div className="mb-4">
            <label className="block text-zinc-700 text-sm font-medium mb-2">
              Role
            </label>
            <div className="flex gap-3">
              {roleOptions.map((option) => {
                const Icon = option.icon
                const isSelected = role === option.id
                return (
                  <button
                    key={option.id}
                    type="button"
                    onClick={() => setRole(option.id)}
                    className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-md border transition-colors ${
                      isSelected
                        ? "bg-blue-50 border-blue-600 text-blue-700"
                        : "bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300"
                    }`}
                  >
                    <Icon className="h-5 w-5 mb-1" />
                    <span className="text-xs font-medium">{option.label}</span>
                  </button>
                )
              })}
            </div>
            {errors.role && (
              <p className="text-red-600 text-sm mt-1">{errors.role}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-zinc-700 text-sm font-medium mb-1">
              College
            </label>
            <Select value={college} onValueChange={handleCollegeChange}>
              <SelectTrigger className="w-full bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 h-9 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 data-[placeholder]:text-zinc-400">
                <SelectValue placeholder="Select college" />
              </SelectTrigger>
              <SelectContent>
                {colleges.map((c) => (
                  <SelectItem key={c.id} value={c.id}>
                    {c.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.college && (
              <p className="text-red-600 text-sm mt-1">{errors.college}</p>
            )}
          </div>

          <div className="mb-4">
            <label className="block text-zinc-700 text-sm font-medium mb-1">
              Department
            </label>
            <Select
              value={department}
              onValueChange={handleDepartmentChange}
              disabled={!college}
            >
              <SelectTrigger className="w-full bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 h-9 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 data-[placeholder]:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue placeholder={college ? "Select department" : "Select a college first"} />
              </SelectTrigger>
              <SelectContent>
                {availableDepartments.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.department && (
              <p className="text-red-600 text-sm mt-1">{errors.department}</p>
            )}
          </div>

          {role !== "lecturer" && (
            <>
              <div className="mb-4">
                <label className="block text-zinc-700 text-sm font-medium mb-1">
                  Programme
                </label>
                <Select
                  value={programme}
                  onValueChange={setProgramme}
                  disabled={!department}
                >
                  <SelectTrigger className="w-full bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 h-9 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 data-[placeholder]:text-zinc-400 disabled:opacity-50 disabled:cursor-not-allowed">
                    <SelectValue placeholder={department ? "Select programme" : "Select a department first"} />
                  </SelectTrigger>
                  <SelectContent>
                    {availableProgrammes.map((p) => (
                      <SelectItem key={p.id} value={p.id}>
                        {p.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.programme && (
                  <p className="text-red-600 text-sm mt-1">{errors.programme}</p>
                )}
              </div>

              <div className="mb-4">
                <label className="block text-zinc-700 text-sm font-medium mb-1">
                  Level
                </label>
                <Select value={level} onValueChange={setLevel}>
                  <SelectTrigger className="w-full bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 h-9 px-3 focus:outline-none focus:ring-2 focus:ring-blue-600 data-[placeholder]:text-zinc-400">
                    <SelectValue placeholder="Select level" />
                  </SelectTrigger>
                  <SelectContent>
                    {levels.map((l) => (
                      <SelectItem key={l.id} value={l.id}>
                        {l.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {errors.level && (
                  <p className="text-red-600 text-sm mt-1">{errors.level}</p>
                )}
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed mt-6"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Create Account"}
          </button>
        </form>

        <p className="text-zinc-500 text-sm mt-4 text-center">
          {"Already have an account? "}
          <Link href="/" className="text-blue-600 hover:text-blue-700">
            Sign in
          </Link>
        </p>
      </div>
    </main>
  )
}





//LOGIN PAGE

"use client"

import { useState } from "react"
import Link from "next/link"
import { Eye, EyeOff, Loader2 } from "lucide-react"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    // Simulate login attempt
    await new Promise((resolve) => setTimeout(resolve, 1500))

    // Simulate error for demo purposes
    setError("Invalid email or password")
    setIsLoading(false)
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50">
      <div className="bg-white border border-zinc-200 rounded-md p-8 w-full max-w-sm">
        <h1 className="text-zinc-900 font-bold text-xl mb-1">Scholr</h1>
        <p className="text-zinc-400 text-sm mb-6">Your academic resources, organised.</p>

        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <label htmlFor="email" className="block text-zinc-700 text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3"
              required
            />
          </div>

          <div className="mb-6">
            <label htmlFor="password" className="block text-zinc-700 text-sm font-medium mb-1">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Sign In"}
          </button>

          {error && <p className="text-red-600 text-sm mt-3">{error}</p>}
        </form>

        <p className="text-zinc-500 text-sm mt-4 text-center">
          {"Don't have an account? "}
          <Link href="/signup" className="text-blue-600 hover:text-blue-700">
            Sign up
          </Link>
        </p>
      </div>
    </main>
  )
}



// navbar
"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface NavbarProps {
  userName: string
  role: string
  unreadCount: number
  onLogout: () => void
}

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/library", label: "Library" },
  { href: "/bookmarks", label: "Bookmarks" },
]

export function Navbar({ userName, role, unreadCount, onLogout }: NavbarProps) {
  const [activeLink, setActiveLink] = useState("/browse")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="h-14 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-zinc-900"
        >
          Scholr
        </Link>

        {/* Desktop Navigation Links - Centered */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={cn(
                "relative py-4 text-sm transition-colors",
                activeLink === link.href
                  ? "text-blue-600"
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {link.label}
              {activeLink === link.href && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative text-zinc-500 transition-colors hover:text-zinc-900"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Info - Hidden on mobile */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-zinc-900">{userName}</span>
            <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              {role}
            </span>
          </div>

          {/* Logout Button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="hidden text-zinc-500 hover:text-zinc-900 md:flex"
            aria-label="Log out"
          >
            <LogOut className="size-5" />
          </Button>

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
                <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-4">
                  <span className="text-sm font-medium text-zinc-900">
                    {userName}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {role}
                  </span>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col py-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setActiveLink(link.href)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "px-4 py-3 text-sm transition-colors",
                        activeLink === link.href
                          ? "bg-zinc-50 text-blue-600"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-zinc-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout()
                      setMobileMenuOpen(false)
                    }}
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





//loading skeleton
"use client"

import { useState } from "react"
import Link from "next/link"
import { Bell, LogOut, Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { cn } from "@/lib/utils"

interface NavbarProps {
  userName: string
  role: string
  unreadCount: number
  onLogout: () => void
}

const navLinks = [
  { href: "/browse", label: "Browse" },
  { href: "/library", label: "Library" },
  { href: "/bookmarks", label: "Bookmarks" },
]

export function Navbar({ userName, role, unreadCount, onLogout }: NavbarProps) {
  const [activeLink, setActiveLink] = useState("/browse")
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="h-14 w-full border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-full max-w-7xl items-center justify-between px-4">
        {/* Logo */}
        <Link
          href="/dashboard"
          className="text-lg font-semibold text-zinc-900"
        >
          Scholr
        </Link>

        {/* Desktop Navigation Links - Centered */}
        <div className="hidden md:flex md:items-center md:gap-6">
          {navLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setActiveLink(link.href)}
              className={cn(
                "relative py-4 text-sm transition-colors",
                activeLink === link.href
                  ? "text-blue-600"
                  : "text-zinc-500 hover:text-zinc-900"
              )}
            >
              {link.label}
              {activeLink === link.href && (
                <span className="absolute bottom-0 left-0 h-0.5 w-full bg-blue-600" />
              )}
            </Link>
          ))}
        </div>

        {/* Right Section */}
        <div className="flex items-center gap-3">
          {/* Notification Bell */}
          <button
            type="button"
            className="relative text-zinc-500 transition-colors hover:text-zinc-900"
            aria-label={`Notifications, ${unreadCount} unread`}
          >
            <Bell className="size-5" />
            {unreadCount > 0 && (
              <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* User Info - Hidden on mobile */}
          <div className="hidden items-center gap-2 md:flex">
            <span className="text-sm text-zinc-900">{userName}</span>
            <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
              {role}
            </span>
          </div>

          {/* Logout Button - Hidden on mobile */}
          <Button
            variant="ghost"
            size="icon"
            onClick={onLogout}
            className="hidden text-zinc-500 hover:text-zinc-900 md:flex"
            aria-label="Log out"
          >
            <LogOut className="size-5" />
          </Button>

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
                <div className="flex items-center gap-2 border-b border-zinc-200 px-4 py-4">
                  <span className="text-sm font-medium text-zinc-900">
                    {userName}
                  </span>
                  <span className="rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-xs text-zinc-600">
                    {role}
                  </span>
                </div>

                {/* Navigation Links */}
                <div className="flex flex-col py-2">
                  {navLinks.map((link) => (
                    <Link
                      key={link.href}
                      href={link.href}
                      onClick={() => {
                        setActiveLink(link.href)
                        setMobileMenuOpen(false)
                      }}
                      className={cn(
                        "px-4 py-3 text-sm transition-colors",
                        activeLink === link.href
                          ? "bg-zinc-50 text-blue-600"
                          : "text-zinc-500 hover:bg-zinc-50 hover:text-zinc-900"
                      )}
                    >
                      {link.label}
                    </Link>
                  ))}
                </div>

                {/* Logout */}
                <div className="border-t border-zinc-200 px-4 py-4">
                  <button
                    type="button"
                    onClick={() => {
                      onLogout()
                      setMobileMenuOpen(false)
                    }}
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






// filecard
"use client"

import { Bookmark, Download } from "lucide-react"

interface FileCardProps {
  title: string
  courseCode: string
  department: string
  level: string
  fileType: string
  uploaderName: string
  downloadCount: number
  isBookmarked: boolean
  onBookmarkToggle: () => void
  onClick: () => void
}

export function FileCard({
  title,
  courseCode,
  department,
  level,
  fileType,
  uploaderName,
  downloadCount,
  isBookmarked,
  onBookmarkToggle,
  onClick,
}: FileCardProps) {
  return (
    <div
      onClick={onClick}
      className="bg-white border border-zinc-200 rounded-md p-4 hover:border-zinc-400 transition-all duration-150 cursor-pointer"
    >
      {/* Top row: file type badge + bookmark */}
      <div className="flex items-center justify-between">
        <span className="bg-zinc-100 text-zinc-600 text-xs font-mono rounded-sm px-2 py-0.5">
          {fileType}
        </span>
        <button
          onClick={(e) => {
            e.stopPropagation()
            onBookmarkToggle()
          }}
          className="p-1"
          aria-label={isBookmarked ? "Remove bookmark" : "Add bookmark"}
        >
          <Bookmark
            className={`size-4 ${isBookmarked ? "text-blue-600 fill-blue-600" : "text-zinc-300"}`}
          />
        </button>
      </div>

      {/* Middle: title and course code */}
      <div className="mt-3">
        <h3 className="text-zinc-900 font-semibold text-sm line-clamp-2">
          {title}
        </h3>
        <p className="text-zinc-500 text-xs mt-1">{courseCode}</p>
      </div>

      {/* Metadata row */}
      <p className="text-zinc-400 text-xs mt-2">
        {department} · {level}
      </p>

      {/* Bottom row: uploader + download count */}
      <div className="flex items-center justify-between mt-3">
        <span className="text-zinc-500 text-xs">{uploaderName}</span>
        <span className="flex items-center gap-1 text-zinc-400 text-xs">
          <Download className="size-3" />
          {downloadCount}
        </span>
      </div>
    </div>
  )
}





//empty state
"use client"

import type { LucideIcon } from "lucide-react"

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  subtext: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({
  icon: Icon,
  heading,
  subtext,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">
          <Icon className="size-12 text-zinc-300" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900">
          {heading}
        </h3>
        <p className="max-w-sm text-sm text-zinc-400 text-pretty">
          {subtext}
        </p>
        {actionLabel && onAction && (
          <div className="mt-6">
            <button
              onClick={onAction}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}






