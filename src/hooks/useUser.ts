'use client'

import { useEffect, useState } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { UserProfile, UserRole } from '@/types'
import { USER_ROLES } from '@/constants'

export function useUser() {
  const [user, setUser] = useState<{
    session: any | null
    profile: UserProfile | null
    role: UserRole | null
  }>({
    session: null,
    profile: null,
    role: null,
  })

  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUserData = async () => {
      try {
        const supabase = createClientSingleton()
        
        // Get current session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (session?.user) {
          // Get user profile from profiles table
          const { data: profile }: { data: UserProfile | null } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single()

          if (profile) {
            setUser({
              session,
              profile,
              role: profile.role || null,
            })
          } else {
            setUser({
              session,
              profile: null,
              role: null,
            })
          }
        } else {
          setUser({
            session: null,
            profile: null,
            role: null,
          })
        }
      } catch (error) {
        console.error('Error fetching user data:', error)
        setUser({
          session: null,
          profile: null,
          role: null,
        })
      } finally {
        setLoading(false)
      }
    }

    getUserData()

    // Listen for auth changes
    const supabase = createClientSingleton()
    
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session?.user) {
        // Get updated profile when auth state changes
        supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }: { data: UserProfile | null }) => {
            if (profile) {
              setUser({
                session,
                profile,
                role: profile.role || null,
              })
            } else {
              setUser({
                session,
                profile: null,
                role: null,
              })
            }
          })
      } else {
        setUser({
          session: null,
          profile: null,
          role: null,
        })
      }
    })

    return () => subscription?.unsubscribe()
  }, [])

  return { user, loading }
}
