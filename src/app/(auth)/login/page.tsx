'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2, CheckCircle2 } from 'lucide-react'
import { createClientSingleton } from '@/lib/supabase/client'
import Link from 'next/link'

type View = 'login' | 'forgot'

export default function LoginPage() {
  const [view, setView] = useState<View>('login')

  // Login state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loginLoading, setLoginLoading] = useState(false)
  const [loginError, setLoginError] = useState('')
  const router = useRouter()

  // Forgot-password state
  const [resetEmail, setResetEmail] = useState('')
  const [resetLoading, setResetLoading] = useState(false)
  const [resetError, setResetError] = useState('')
  const [resetSent, setResetSent] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoginLoading(true)
    setLoginError('')
    try {
      const supabase = createClientSingleton()
      const { error } = await supabase.auth.signInWithPassword({ email, password })
      if (error) setLoginError(error.message)
      else router.push('/dashboard')
    } catch {
      setLoginError('An unexpected error occurred')
    } finally {
      setLoginLoading(false)
    }
  }

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    setResetError('')
    try {
      const supabase = createClientSingleton()
      const { error } = await supabase.auth.resetPasswordForEmail(resetEmail, {
        redirectTo: `${window.location.origin}/reset-password`,
      })
      if (error) setResetError(error.message)
      else setResetSent(true)
    } catch {
      setResetError('An unexpected error occurred')
    } finally {
      setResetLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="bg-white border border-zinc-200 rounded-md p-8 w-full max-w-sm">

        {/* ─── Forgot Password View ─── */}
        {view === 'forgot' ? (
          <>
            <button
              type="button"
              onClick={() => { setView('login'); setResetSent(false); setResetError('') }}
              className="text-xs text-zinc-400 hover:text-zinc-700 transition-colors mb-6 flex items-center gap-1"
            >
              ← Back to sign in
            </button>

            <h1 className="text-zinc-900 font-semibold text-[18px] mb-1">Forgot your password?</h1>
            <p className="text-zinc-400 text-sm mb-6">
              Enter your email and we'll send you a link to reset your password.
            </p>

            {resetSent ? (
              <div className="flex flex-col items-center text-center py-4 space-y-3">
                <CheckCircle2 className="size-10 text-green-500" />
                <p className="text-sm font-medium text-zinc-900">Check your email</p>
                <p className="text-xs text-zinc-400">
                  We sent a password reset link to <span className="font-medium text-zinc-700">{resetEmail}</span>. Check your inbox and follow the link.
                </p>
                <button
                  type="button"
                  onClick={() => { setView('login'); setResetSent(false); setResetEmail('') }}
                  className="mt-2 text-sm text-blue-600 hover:text-blue-700"
                >
                  Back to sign in
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword}>
                {resetError && (
                  <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                    {resetError}
                  </div>
                )}
                <div className="mb-5">
                  <label htmlFor="resetEmail" className="block text-zinc-700 text-sm font-medium mb-1">
                    Email address
                  </label>
                  <input
                    id="resetEmail"
                    type="email"
                    value={resetEmail}
                    onChange={e => setResetEmail(e.target.value)}
                    placeholder="you@example.com"
                    required
                    disabled={resetLoading}
                    className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 disabled:opacity-50"
                  />
                </div>
                <button
                  type="submit"
                  disabled={resetLoading || !resetEmail}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {resetLoading ? <Loader2 className="size-4 animate-spin" /> : 'Send reset link'}
                </button>
              </form>
            )}
          </>
        ) : (
          /* ─── Login View ─── */
          <>
            <h1 className="text-zinc-900 font-bold text-xl mb-1">Scholr</h1>
            <p className="text-zinc-400 text-sm mb-6">Your academic resources, organised.</p>

            <form onSubmit={handleLogin}>
              {loginError && (
                <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                  {loginError}
                </div>
              )}

              <div className="mb-4">
                <label htmlFor="email" className="block text-zinc-700 text-sm font-medium mb-1">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  required
                  disabled={loginLoading}
                  className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 disabled:opacity-50"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1">
                  <label htmlFor="password" className="block text-zinc-700 text-sm font-medium">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => setView('forgot')}
                    className="text-xs text-blue-600 hover:text-blue-700 transition-colors"
                  >
                    Forgot password?
                  </button>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                    disabled={loginLoading}
                    className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 pr-10 disabled:opacity-50"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="mt-6 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {loginLoading ? <Loader2 className="size-4 animate-spin" /> : 'Sign In'}
              </button>
            </form>

            <p className="text-zinc-500 text-sm mt-4 text-center">
              {"Don't have an account? "}
              <Link href="/signup" className="text-blue-600 hover:text-blue-700">
                Sign up
              </Link>
            </p>
          </>
        )}
      </div>
    </main>
  )
}
