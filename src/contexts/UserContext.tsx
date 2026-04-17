'use client'

import { createContext, useContext, useEffect, useState } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { UserProfile, UserRole } from '@/types'
import type { Session } from '@supabase/supabase-js'

interface UserState {
  session: Session | null
  profile: UserProfile | null
  role: UserRole | null
}

interface UserContextValue {
  user: UserState
  loading: boolean
}

const UserContext = createContext<UserContextValue | null>(null)

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<UserState>({
    session: null,
    profile: null,
    role: null,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const supabase = createClientSingleton()

    async function loadUser(
      sessionUser: { id: string } | null,
      session: Session | null
    ) {
      if (!sessionUser) {
        setUser({ session: null, profile: null, role: null })
        setLoading(false)
        return
      }
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', sessionUser.id)
          .single()

        setUser({
          session,
          profile: profile as UserProfile | null,
          role: (profile as UserProfile | null)?.role ?? null,
        })
      } catch {
        setUser({ session, profile: null, role: null })
      } finally {
        setLoading(false)
      }
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      loadUser(session?.user ?? null, session ?? null)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        loadUser(session?.user ?? null, session ?? null)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  return (
    <UserContext.Provider value={{ user, loading }}>
      {children}
    </UserContext.Provider>
  )
}

export function useUserContext(): UserContextValue {
  const ctx = useContext(UserContext)
  if (!ctx) {
    throw new Error('useUserContext must be used within a UserProvider')
  }
  return ctx
}
