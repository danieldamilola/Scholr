'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import { useUser } from './useUser'

export type RequestStatus = 'pending' | 'approved' | 'denied'
export type RequestType = 'file' | 'book' | 'other'

export interface Request {
  id: string
  requester_id: string
  requester_name: string
  requester_role: string
  target_role: string
  target_id: string | null
  type: RequestType
  title: string
  description: string | null
  course_code: string | null
  college: string | null
  department: string | null
  status: RequestStatus
  response_message: string | null
  responded_by: string | null
  responded_at: string | null
  created_at: string
}

export interface CreateRequestPayload {
  target_role: string
  type: RequestType
  title: string
  description?: string
  course_code?: string
  college?: string
  department?: string
}

export function useRequests() {
  const { user } = useUser()
  const [myRequests, setMyRequests] = useState<Request[]>([])
  const [incomingRequests, setIncomingRequests] = useState<Request[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientSingleton()

  const fetchRequests = useCallback(async () => {
    if (!user?.session?.user?.id || !user?.profile) return
    setLoading(true)
    setError(null)
    try {
      // My submitted requests
      const { data: mine, error: mineErr } = await supabase
        .from('requests')
        .select('*')
        .eq('requester_id', user.session.user.id)
        .order('created_at', { ascending: false })

      if (mineErr) throw mineErr
      setMyRequests((mine as Request[]) || [])

      // Incoming requests (staff only)
      const staffRoles = ['admin', 'lecturer', 'class_rep', 'librarian']
      if (staffRoles.includes(user.profile.role)) {
        const { data: incoming, error: inErr } = await supabase
          .from('requests')
          .select('*')
          .eq('target_role', user.profile.role)
          .order('created_at', { ascending: false })

        if (inErr) throw inErr
        setIncomingRequests((incoming as Request[]) || [])
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load requests')
    } finally {
      setLoading(false)
    }
  }, [user?.session?.user?.id, user?.profile?.role])

  useEffect(() => {
    fetchRequests()
  }, [fetchRequests])

  const createRequest = async (payload: CreateRequestPayload) => {
    if (!user?.session?.user?.id || !user?.profile) throw new Error('Not authenticated')
    const { error } = await supabase.from('requests').insert({
      requester_id: user.session.user.id,
      requester_name: user.profile.full_name,
      requester_role: user.profile.role,
      ...payload,
    })
    if (error) throw error
    await fetchRequests()
  }

  const respondToRequest = async (
    requestId: string,
    status: 'approved' | 'denied',
    message?: string
  ) => {
    if (!user?.session?.user?.id || !user?.profile) throw new Error('Not authenticated')

    // Update the request
    const { data: req, error: fetchErr } = await supabase
      .from('requests')
      .select('requester_id, title, type')
      .eq('id', requestId)
      .single()
    if (fetchErr) throw fetchErr

    const { error: updateErr } = await supabase
      .from('requests')
      .update({
        status,
        response_message: message || null,
        responded_by: user.session.user.id,
        responded_at: new Date().toISOString(),
      })
      .eq('id', requestId)
    if (updateErr) throw updateErr

    // Send notification to the requester
    const statusLabel = status === 'approved' ? 'approved ✅' : 'denied ❌'
    await supabase.from('notifications').insert({
      user_id: req.requester_id,
      message: `Your request for "${req.title}" has been ${statusLabel} by ${user.profile.full_name}.${message ? ` Message: "${message}"` : ''}`,
      link: '/requests',
    })

    await fetchRequests()
  }

  return {
    myRequests,
    incomingRequests,
    loading,
    error,
    createRequest,
    respondToRequest,
    refetch: fetchRequests,
  }
}
