'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Eye, EyeOff, CheckCircle2 } from 'lucide-react'
import { createClientSingleton } from '@/lib/supabase/client'

export default function ResetPasswordPage() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [done, setDone] = useState(false)
  const [sessionReady, setSessionReady] = useState(false)
  const router = useRouter()

  // Supabase handles the token from the URL hash automatically.
  // We just need to wait for the session to be established.
  useEffect(() => {
    const supabase = createClientSingleton()
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) setSessionReady(true)
      else setError('Invalid or expired reset link. Please request a new one.')
    })
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (password.length < 6) {
      setError('Password must be at least 6 characters.')
      return
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }

    setLoading(true)
    try {
      const supabase = createClientSingleton()
      const { error } = await supabase.auth.updateUser({ password })
      if (error) throw error
      setDone(true)
      // Redirect to dashboard after 2 seconds
      setTimeout(() => router.push('/dashboard'), 2000)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to reset password.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center bg-zinc-50 px-4">
      <div className="bg-white border border-zinc-200 rounded-md p-8 w-full max-w-sm">
        <h1 className="text-zinc-900 font-bold text-xl mb-1">Scholr</h1>
        <p className="text-zinc-400 text-sm mb-6">Set a new password for your account.</p>

        {done ? (
          <div className="flex flex-col items-center text-center py-4 space-y-3">
            <CheckCircle2 className="size-10 text-green-500" />
            <p className="text-sm font-medium text-zinc-900">Password updated!</p>
            <p className="text-xs text-zinc-400">You're being redirected to your dashboard…</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 rounded-md bg-red-50 border border-red-100 p-3 text-sm text-red-600">
                {error}
              </div>
            )}

            {!sessionReady && !error && (
              <div className="flex justify-center py-4">
                <Loader2 className="size-5 text-zinc-400 animate-spin" />
              </div>
            )}

            {sessionReady && (
              <>
                <div className="mb-4">
                  <label htmlFor="newPw" className="block text-zinc-700 text-sm font-medium mb-1">
                    New Password
                  </label>
                  <div className="relative">
                    <input
                      id="newPw"
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={e => setPassword(e.target.value)}
                      placeholder="Minimum 6 characters"
                      required
                      disabled={loading}
                      className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 pr-10 disabled:opacity-50"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600"
                    >
                      {showPassword ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                    </button>
                  </div>
                </div>

                <div className="mb-6">
                  <label htmlFor="confirmPw" className="block text-zinc-700 text-sm font-medium mb-1">
                    Confirm New Password
                  </label>
                  <input
                    id="confirmPw"
                    type="password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                    required
                    disabled={loading}
                    className="bg-white border border-zinc-200 rounded-md text-sm text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 w-full px-3 disabled:opacity-50"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading || !password || !confirmPassword}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-md h-9 w-full flex items-center justify-center disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {loading ? <Loader2 className="size-4 animate-spin" /> : 'Set New Password'}
                </button>
              </>
            )}
          </form>
        )}
      </div>
    </main>
  )
}
