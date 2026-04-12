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






//dashboard
"use client";

import Link from "next/link";
import { motion } from "motion/react";
import { Bookmark, MessageSquare } from "lucide-react";
import { MaterialCard } from "@/components/material-card";
import { cn } from "@/lib/utils";

const STAGGER_CONTAINER = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05,
    },
  },
};

const REVEAL_ITEM = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" as const } },
};

const MOCK_MATERIALS = [
  {
    id: "1",
    title: "Introduction to Data Structures and Algorithms",
    courseCode: "CSC 201",
    description: "Comprehensive notes covering arrays, linked lists, stacks, queues, and basic algorithmic complexity.",
    type: "PDF" as const,
    level: 200,
    semester: "Alpha",
    downloads: 124,
    isBookmarked: false,
  },
  {
    id: "2",
    title: "Linear Algebra II - Vector Spaces",
    courseCode: "MTH 203",
    description: "Lecture slides on vector spaces, subspaces, linear independence, and basis.",
    type: "PPTX" as const,
    level: 200,
    semester: "Alpha",
    downloads: 89,
    isBookmarked: true,
  },
  {
    id: "3",
    title: "Software Engineering Principles",
    courseCode: "CSC 305",
    description: "Study guide for software development life cycles, agile methodologies, and requirements engineering.",
    type: "DOCX" as const,
    level: 300,
    semester: "Omega",
    downloads: 210,
    isBookmarked: false,
  },
];

const MOCK_DISCUSSIONS = [
  {
    id: "d1",
    title: "Question about Big O notation in Chapter 3",
    courseCode: "CSC 201",
    lastReply: "2 hours ago",
    fileId: "1",
  },
  {
    id: "d2",
    title: "Can someone explain the proof for Theorem 4.2?",
    courseCode: "MTH 203",
    lastReply: "Yesterday",
    fileId: "2",
  },
];

export default function DashboardPage() {
  const date = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <div>
        <h1 className="text-[24px] font-semibold text-foreground mb-1">
          Good evening, John
        </h1>
        <p className="text-[14px] text-muted-foreground">
          {date} · Computer Science · 200 Level
        </p>
      </div>

      {/* Quick Stats Bar */}
      <motion.div 
        variants={STAGGER_CONTAINER}
        initial="hidden"
        animate="visible"
        className="grid grid-cols-1 sm:grid-cols-3 gap-4"
      >
        <motion.div variants={REVEAL_ITEM} className="bg-card border border-border rounded-[10px] p-5">
          <div className="text-[28px] font-bold text-foreground font-sans">42</div>
          <div className="text-[12px] text-muted-foreground mt-1">Files in your Programme</div>
        </motion.div>
        <motion.div variants={REVEAL_ITEM} className="bg-card border border-border rounded-[10px] p-5">
          <div className="text-[28px] font-bold text-foreground font-sans">12</div>
          <div className="text-[12px] text-muted-foreground mt-1">Bookmarked</div>
        </motion.div>
        <motion.div variants={REVEAL_ITEM} className="bg-card border border-border rounded-[10px] p-5">
          <div className="text-[28px] font-bold text-foreground font-sans">3</div>
          <div className="text-[12px] text-muted-foreground mt-1">Unread Notifications</div>
        </motion.div>
      </motion.div>

      {/* Recent Materials */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-semibold text-foreground">New in Computer Science</h2>
          <Link href="/browse" className="text-[14px] text-primary hover:underline">
            See all
          </Link>
        </div>
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {MOCK_MATERIALS.map((material) => (
            <motion.div key={material.id} variants={REVEAL_ITEM}>
              <MaterialCard {...material} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Your Bookmarks */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-[22px] font-semibold text-foreground">Your Bookmarks</h2>
          <Link href="/bookmarks" className="text-[14px] text-primary hover:underline">
            See all
          </Link>
        </div>
        <motion.div 
          variants={STAGGER_CONTAINER}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4"
        >
          {MOCK_MATERIALS.filter(m => m.isBookmarked).map((material) => (
            <motion.div key={material.id} variants={REVEAL_ITEM}>
              <MaterialCard {...material} />
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Recent Discussions */}
      <section>
        <h2 className="text-[22px] font-semibold text-foreground mb-4">Recent Discussions</h2>
        <div className="bg-card border border-border rounded-[10px] overflow-hidden">
          {MOCK_DISCUSSIONS.map((discussion, index) => (
            <Link 
              key={discussion.id} 
              href={`/file/${discussion.fileId}#discussion`}
              className={cn(
                "flex items-center justify-between p-4 transition-colors hover:bg-accent-bg",
                index !== MOCK_DISCUSSIONS.length - 1 && "border-b border-border"
              )}
            >
              <div className="flex items-center gap-3">
                <div className="bg-secondary p-2 rounded-full">
                  <MessageSquare className="w-4 h-4 text-secondary-foreground" />
                </div>
                <div>
                  <div className="text-[14px] font-medium text-foreground mb-1">{discussion.title}</div>
                  <div className="flex items-center gap-2">
                    <span className="bg-secondary text-primary font-mono text-[11px] px-1.5 py-0.5 rounded-sm">
                      {discussion.courseCode}
                    </span>
                  </div>
                </div>
              </div>
              <div className="text-[12px] text-muted-foreground">
                {discussion.lastReply}
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}




//file details page
"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { 
  ChevronLeft, ChevronRight, Download, Bookmark, Share2, 
  ThumbsUp, MessageSquare, Send, Sparkles, BrainCircuit, Loader2
} from "lucide-react";
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

// Mock Data
const FILE_DATA = {
  id: "1",
  title: "Introduction to Data Structures and Algorithms",
  courseCode: "CSC 201",
  college: "CBAS",
  department: "Computer Science",
  programme: "B.Sc. Computer Science",
  uploadDate: "Oct 12, 2025",
  uploaderName: "Dr. Adebayo",
  level: 200,
  semester: "Alpha",
  totalPages: 42,
};

const MOCK_THREADS = [
  {
    id: "t1",
    author: "Jane Smith",
    avatar: "JS",
    timestamp: "2 hours ago",
    content: "Can someone explain the difference between a stack and a queue in simple terms?",
    helpful: true,
    replies: [
      {
        id: "r1",
        author: "Dr. Adebayo",
        avatar: "DA",
        timestamp: "1 hour ago",
        content: "Think of a stack like a stack of plates (LIFO - Last In, First Out). You add to the top and remove from the top. A queue is like a line at a cafeteria (FIFO - First In, First Out). You join at the back and leave from the front.",
        isLecturer: true,
      }
    ]
  }
];

const MOCK_AI_CHAT = [
  { id: "1", role: "ai", content: "Hi! I'm your AI Study Assistant. I've read this document. What would you like to know?", timestamp: "10:00 AM" },
  { id: "2", role: "user", content: "Summarize chapter 2 for me.", timestamp: "10:02 AM" },
  { id: "3", role: "ai", content: "Chapter 2 covers Arrays and Linked Lists. It explains that arrays offer O(1) access time but O(n) insertion/deletion, while linked lists offer O(1) insertion/deletion (if you have the pointer) but O(n) access time. It concludes with a comparison table on page 15.", timestamp: "10:03 AM" },
];

export default function FileDetailPage() {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [pageNumber, setPageNumber] = useState(1);
  const [activeTab, setActiveTab] = useState<"ai" | "quiz">("ai");
  const [chatInput, setChatInput] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  
  // Quiz State
  const [quizState, setQuizState] = useState<"idle" | "generating" | "active" | "results">("idle");
  const [quizQuestions, setQuizQuestions] = useState(3);
  const [quizDifficulty, setQuizDifficulty] = useState("Medium");

  const editor = useEditor({
    extensions: [StarterKit],
    content: '',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-sm dark:prose-invert max-w-none focus:outline-none min-h-[100px] p-3 bg-input border border-border rounded-md',
      },
    },
  });

  const handlePrevPage = () => setPageNumber(p => Math.max(1, p - 1));
  const handleNextPage = () => setPageNumber(p => Math.min(FILE_DATA.totalPages, p + 1));

  return (
    <div className="flex flex-1 w-full max-w-[1600px] mx-auto">
      {/* Left Column - Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 min-w-0 lg:max-w-[65%] xl:max-w-[70%]">
        {/* Breadcrumb */}
        <div className="text-[12px] text-muted-foreground mb-4">
          {FILE_DATA.college} <span className="mx-1">›</span> {FILE_DATA.department} <span className="mx-1">›</span> {FILE_DATA.programme}
        </div>

        {/* File Header */}
        <div className="mb-6">
          <h1 className="text-[28px] sm:text-[32px] font-semibold text-foreground leading-[1.2] mb-3">
            {FILE_DATA.title}
          </h1>
          <div className="flex flex-wrap items-center gap-3 text-[13px]">
            <span className="bg-secondary text-primary font-mono px-2 py-1 rounded-sm">
              {FILE_DATA.courseCode}
            </span>
            <span className="text-muted-foreground">Uploaded {FILE_DATA.uploadDate}</span>
            <span className="text-muted-foreground">by <span className="text-foreground font-medium">{FILE_DATA.uploaderName}</span></span>
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-sm">Level {FILE_DATA.level}</span>
            <span className="bg-secondary text-secondary-foreground px-2 py-1 rounded-sm">{FILE_DATA.semester} Semester</span>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex items-center gap-3 mb-8">
          <Button className="h-[40px] px-6 rounded-sm bg-primary hover:bg-primary/90 text-primary-foreground font-medium text-[14px] gap-2">
            <Download className="w-4 h-4" />
            Download PDF
          </Button>
          <Button 
            variant="outline" 
            onClick={() => setIsBookmarked(!isBookmarked)}
            className="h-[40px] px-4 rounded-sm border-border hover:bg-accent-bg text-secondary-foreground bg-transparent gap-2"
          >
            <Bookmark className={cn("w-4 h-4", isBookmarked && "fill-primary text-primary")} />
            {isBookmarked ? "Saved" : "Save"}
          </Button>
          <Button variant="outline" className="h-[40px] px-4 rounded-sm border-border hover:bg-accent-bg text-secondary-foreground bg-transparent gap-2">
            <Share2 className="w-4 h-4" />
            Share
          </Button>
        </div>

        {/* PDF Preview Panel */}
        <div className="bg-card border border-border rounded-[10px] overflow-hidden mb-10 flex flex-col">
          <div className="w-full h-[600px] bg-secondary/50 flex items-center justify-center relative">
            {/* Placeholder for react-pdf */}
            <div className="w-[80%] h-[90%] bg-background border border-border shadow-sm flex items-center justify-center text-muted-foreground">
              PDF Page {pageNumber} Content
            </div>
          </div>
          <div className="flex items-center justify-between p-3 bg-card border-t border-border">
            <Button variant="ghost" size="icon" onClick={handlePrevPage} disabled={pageNumber === 1} className="text-secondary-foreground hover:text-foreground">
              <ChevronLeft className="w-5 h-5" />
            </Button>
            <span className="text-[13px] text-muted-foreground font-mono">
              {pageNumber} / {FILE_DATA.totalPages}
            </span>
            <Button variant="ghost" size="icon" onClick={handleNextPage} disabled={pageNumber === FILE_DATA.totalPages} className="text-secondary-foreground hover:text-foreground">
              <ChevronRight className="w-5 h-5" />
            </Button>
          </div>
        </div>

        {/* Discussion Section */}
        <div id="discussion" className="mb-20">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-[22px] font-semibold text-foreground">Discussion</h2>
            {!isComposing && (
              <Button onClick={() => setIsComposing(true)} className="h-[36px] px-4 rounded-sm bg-secondary hover:bg-secondary/80 text-foreground font-medium text-[13px]">
                Start a thread
              </Button>
            )}
          </div>

          {isComposing && (
            <div className="mb-8 bg-card border border-border rounded-[10px] p-4">
              <EditorContent editor={editor} />
              <div className="flex justify-end gap-2 mt-3">
                <Button variant="ghost" onClick={() => setIsComposing(false)} className="h-[32px] text-[13px]">Cancel</Button>
                <Button className="h-[32px] text-[13px] bg-primary hover:bg-primary/90 text-primary-foreground">Post</Button>
              </div>
            </div>
          )}

          <div className="space-y-6">
            {MOCK_THREADS.map((thread) => (
              <div key={thread.id} className="flex gap-3">
                <Avatar className="w-8 h-8 border border-border mt-1">
                  <AvatarFallback className="bg-muted text-xs">{thread.avatar}</AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <div className="flex items-baseline gap-2 mb-1">
                    <span className="text-[13px] font-semibold text-foreground">{thread.author}</span>
                    <span className="text-[11px] text-muted-foreground">{thread.timestamp}</span>
                  </div>
                  <p className="text-[14px] text-secondary-foreground mb-2">{thread.content}</p>
                  <div className="flex items-center gap-4 mb-4">
                    <button className="text-[12px] font-medium text-muted-foreground hover:text-foreground transition-colors">Reply</button>
                    <button className="flex items-center gap-1 text-[12px] font-medium text-primary hover:text-primary/80 transition-colors">
                      <ThumbsUp className="w-3.5 h-3.5 fill-primary" />
                      Helpful
                    </button>
                  </div>

                  {/* Replies */}
                  {thread.replies.map((reply) => (
                    <div key={reply.id} className="flex gap-3 mt-4 pl-4 border-l border-border">
                      <Avatar className="w-6 h-6 border border-border mt-1">
                        <AvatarFallback className="bg-muted text-[10px]">{reply.avatar}</AvatarFallback>
                      </Avatar>
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-[13px] font-semibold text-foreground">{reply.author}</span>
                          {reply.isLecturer && (
                            <span className="bg-primary/10 text-primary text-[10px] px-1.5 py-0.5 rounded-sm font-medium">Lecturer</span>
                          )}
                          <span className="text-[11px] text-muted-foreground">{reply.timestamp}</span>
                        </div>
                        <p className="text-[14px] text-secondary-foreground">{reply.content}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Right Column - AI Sidebar (Desktop) */}
      <aside className="hidden lg:flex flex-col w-[35%] xl:w-[30%] flex-shrink-0 border-l border-border bg-secondary/30 sticky top-[56px] h-[calc(100vh-56px)]">
        {/* Tabs */}
        <div className="flex border-b border-border">
          <button 
            onClick={() => setActiveTab("ai")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-[48px] text-[14px] font-medium transition-colors border-b-2",
              activeTab === "ai" ? "border-primary text-primary" : "border-transparent text-secondary-foreground hover:text-foreground"
            )}
          >
            <Sparkles className="w-4 h-4" />
            AI Assistant
          </button>
          <button 
            onClick={() => setActiveTab("quiz")}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 h-[48px] text-[14px] font-medium transition-colors border-b-2",
              activeTab === "quiz" ? "border-primary text-primary" : "border-transparent text-secondary-foreground hover:text-foreground"
            )}
          >
            <BrainCircuit className="w-4 h-4" />
            Quiz
          </button>
        </div>

        {/* Tab Content */}
        <div className="flex-1 overflow-hidden relative">
          {activeTab === "ai" ? (
            <div className="flex flex-col h-full">
              {/* Chat Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-4">
                {MOCK_AI_CHAT.map((msg) => (
                  <div key={msg.id} className={cn("flex flex-col max-w-[85%]", msg.role === "user" ? "ml-auto items-end" : "mr-auto items-start")}>
                    <div className={cn(
                      "p-3 text-[14px] leading-relaxed",
                      msg.role === "user" 
                        ? "bg-primary text-primary-foreground rounded-[14px] rounded-br-sm" 
                        : "bg-card border border-border text-foreground rounded-[14px] rounded-tl-sm"
                    )}>
                      {msg.content}
                    </div>
                    <span className="text-[11px] text-muted-foreground mt-1 px-1">{msg.timestamp}</span>
                  </div>
                ))}
              </div>
              
              {/* Chat Input */}
              <div className="p-4 bg-background border-t border-border">
                <div className="relative flex items-end bg-input border border-border rounded-[10px] focus-within:ring-1 focus-within:ring-primary focus-within:border-primary transition-all">
                  <textarea 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    placeholder="Ask a question about this document..."
                    className="w-full bg-transparent text-[14px] text-foreground placeholder:text-muted-foreground p-3 min-h-[44px] max-h-[120px] resize-none focus:outline-none"
                    rows={1}
                  />
                  <button className="p-2 m-1 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full overflow-y-auto p-6">
              {quizState === "idle" && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-[16px] font-semibold text-foreground mb-2">Generate a Quiz</h3>
                    <p className="text-[13px] text-muted-foreground">Test your knowledge on this document. The AI will generate multiple-choice questions based on the content.</p>
                  </div>
                  
                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">Number of questions</label>
                    <div className="flex gap-2">
                      {[3, 5, 10].map((num) => (
                        <button
                          key={num}
                          onClick={() => setQuizQuestions(num)}
                          className={cn(
                            "flex-1 py-1.5 rounded-full text-[13px] font-medium transition-colors border",
                            quizQuestions === num 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-card text-secondary-foreground border-border hover:text-foreground"
                          )}
                        >
                          {num}
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-3">
                    <label className="text-[13px] font-medium text-foreground">Difficulty</label>
                    <div className="flex gap-2">
                      {["Easy", "Medium", "Hard"].map((diff) => (
                        <button
                          key={diff}
                          onClick={() => setQuizDifficulty(diff)}
                          className={cn(
                            "flex-1 py-1.5 rounded-full text-[13px] font-medium transition-colors border",
                            quizDifficulty === diff 
                              ? "bg-primary/10 text-primary border-primary/20" 
                              : "bg-card text-secondary-foreground border-border hover:text-foreground"
                          )}
                        >
                          {diff}
                        </button>
                      ))}
                    </div>
                  </div>

                  <Button 
                    onClick={() => setQuizState("generating")}
                    className="w-full h-[40px] bg-primary hover:bg-primary/90 text-primary-foreground font-medium rounded-sm mt-4"
                  >
                    Generate Quiz
                  </Button>
                </div>
              )}

              {quizState === "generating" && (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4">
                  <Loader2 className="w-8 h-8 text-primary animate-spin" />
                  <p className="text-[14px] text-secondary-foreground">Analyzing document and generating questions...</p>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {/* Mobile AI/Quiz FAB */}
      <Sheet>
        <SheetTrigger className="lg:hidden fixed bottom-6 right-6 z-40 w-14 h-14 bg-primary text-primary-foreground rounded-full shadow-overlay flex items-center justify-center hover:scale-105 transition-transform">
          <Sparkles className="w-6 h-6" />
        </SheetTrigger>
        <SheetContent side="bottom" className="h-[85vh] bg-background border-t-border p-0 rounded-t-[14px] flex flex-col">
           {/* Mobile Tabs */}
          <div className="flex border-b border-border shrink-0">
            <button 
              onClick={() => setActiveTab("ai")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-[48px] text-[14px] font-medium transition-colors border-b-2",
                activeTab === "ai" ? "border-primary text-primary" : "border-transparent text-secondary-foreground hover:text-foreground"
              )}
            >
              <Sparkles className="w-4 h-4" />
              AI Assistant
            </button>
            <button 
              onClick={() => setActiveTab("quiz")}
              className={cn(
                "flex-1 flex items-center justify-center gap-2 h-[48px] text-[14px] font-medium transition-colors border-b-2",
                activeTab === "quiz" ? "border-primary text-primary" : "border-transparent text-secondary-foreground hover:text-foreground"
              )}
            >
              <BrainCircuit className="w-4 h-4" />
              Quiz
            </button>
          </div>
          {/* Content would be duplicated here for mobile, keeping it simple for now */}
          <div className="flex-1 flex items-center justify-center text-muted-foreground p-6 text-center">
            Mobile view content here (same as desktop sidebar)
          </div>
        </SheetContent>
      </Sheet>
    </div>
  );
}
