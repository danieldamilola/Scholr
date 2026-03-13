'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { Eye, EyeOff, Loader2, GraduationCap, BookOpen, Users } from 'lucide-react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { createClientSingleton } from '@/lib/supabase/client'
import { colleges, departments, programmes, levels, type Role } from '@/lib/academic-data'

export default function SignupPage() {
  const [fullName, setFullName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [role, setRole] = useState<Role | null>(null)
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [programme, setProgramme] = useState('')
  const [level, setLevel] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  const availableDepartments = college ? departments[college] || []
  const availableProgrammes = department ? programmes[department] || []

  const handleCollegeChange = (value: string) => {
    setCollege(value)
    setDepartment('')
    setProgramme('')
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setProgramme('')
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-background">
      <Card className="w-full max-w-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Create Account</CardTitle>
          <CardDescription>
            Join Scholr to access academic resources
          </CardDescription>
        </CardHeader>
        <form onSubmit={(e) => { e.preventDefault() }}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  type="text"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="•••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password</Label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="•••••"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                  className="pr-10"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                >
                  {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
          </CardContent>

          <CardFooter className="space-y-4">
            <p className="text-xs font-medium uppercase tracking-wide">Academic Profile</p>
            
            <div className="space-y-4">
              <Label>Role</Label>
              <div className="flex gap-3">
                {[
                  { id: 'student' as Role, label: 'Student', icon: GraduationCap },
                  { id: 'lecturer' as Role, label: 'Lecturer', icon: BookOpen },
                  { id: 'classrep' as Role, label: 'Class Rep', icon: Users },
                ].map((option) => {
                  const Icon = option.icon
                  const isSelected = role === option.id
                  return (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setRole(option.id)}
                      className={`flex-1 flex flex-col items-center justify-center py-3 px-2 rounded-md border transition-colors ${
                        isSelected
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                      }`}
                    >
                      <Icon className="h-5 w-5 mb-1" />
                      <span className="text-xs font-medium">{option.label}</span>
                    </button>
                  )
                })}
              </div>

            <div className="space-y-4">
              <Label>College</Label>
              <Select value={college} onValueChange={handleCollegeChange}>
                <SelectTrigger className="w-full">
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
            </div>

            <div className="space-y-4">
              <Label>Department</Label>
              <Select
                value={department}
                onValueChange={handleDepartmentChange}
                disabled={!college}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder={college ? 'Select department' : 'Select a college first'} />
                </SelectTrigger>
                <SelectContent>
                  {availableDepartments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {role !== 'lecturer' && (
              <>
                <div className="space-y-4">
                  <Label>Programme</Label>
                  <Select
                    value={programme}
                    onValueChange={setProgramme}
                    disabled={!department}
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder={department ? 'Select programme' : 'Select a department first'} />
                    </SelectTrigger>
                    <SelectContent>
                      {availableProgrammes.map((p) => (
                        <SelectItem key={p.id} value={p.id}>
                          {p.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-4">
                  <Label>Level</Label>
                  <Select value={level} onValueChange={setLevel}>
                    <SelectTrigger className="w-full">
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
                </div>
              </>
            )}
          </CardFooter>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
          >
            {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Create Account'}
          </Button>
        </CardContent>
        </form>

        <div className="mt-6 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Sign in
          </Link>
        </div>
      </Card>
    </main>
  )
}
