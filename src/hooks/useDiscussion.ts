'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { DiscussionThread, DiscussionReply, UserProfile } from '@/types'

interface UseDiscussionParams {
  fileId: string
}

export interface DiscussionThreadWithReplies extends DiscussionThread {
  user: UserProfile
  replies: (DiscussionReply & { user: UserProfile })[]
}

export function useDiscussion({ fileId }: UseDiscussionParams) {
  const [threads, setThreads] = useState<DiscussionThreadWithReplies[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchThreads = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClientSingleton()

      // Fetch threads with user info
      const { data: threadsData, error: threadsError } = await supabase
        .from('discussion_threads')
        .select(`
          *,
          profiles:user_id (id, full_name, avatar_url)
        `)
        .eq('file_id', fileId)
        .order('created_at', { ascending: false })

      if (threadsError) throw threadsError

      // For each thread, fetch its replies with user info
      const threadsWithReplies = await Promise.all(
        (threadsData || []).map(async (thread: any) => {
          const { data: repliesData, error: repliesError } = await supabase
            .from('discussion_replies')
            .select(`
              *,
              profiles:user_id (id, full_name, avatar_url)
            `)
            .eq('thread_id', thread.id)
            .order('created_at', { ascending: true })

          if (repliesError) throw repliesError

          return {
            ...thread,
            user: thread.profiles,
            replies: (repliesData || []).map((reply: any) => ({
              ...reply,
              user: reply.profiles,
            })),
          }
        })
      )

      setThreads(threadsWithReplies)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch discussions')
    } finally {
      setLoading(false)
    }
  }, [fileId])

  const createThread = async (content: string) => {
    try {
      const supabase = createClientSingleton()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('discussion_threads')
        .insert({
          file_id: fileId,
          user_id: user.id,
          content,
        } as any)
        .select()
        .single()

      if (error) throw error

      await fetchThreads()
      return data
    } catch (err) {
      throw err
    }
  }

  const createReply = async (threadId: string, content: string) => {
    try {
      const supabase = createClientSingleton()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const { data, error } = await supabase
        .from('discussion_replies')
        .insert({
          thread_id: threadId,
          user_id: user.id,
          content,
          is_helpful: false,
        } as any)
        .select()
        .single()

      if (error) throw error

      await fetchThreads()
      return data
    } catch (err) {
      throw err
    }
  }

  const markReplyAsHelpful = async (replyId: string, isHelpful: boolean) => {
    try {
      const supabase = createClientSingleton()
      // @ts-ignore - Supabase type inference issue
      const { error } = await supabase
        .from('discussion_replies')
        .update({ is_helpful: isHelpful })
        .eq('id', replyId)

      if (error) throw error

      await fetchThreads()
    } catch (err) {
      throw err
    }
  }

  useEffect(() => {
    fetchThreads()
  }, [fetchThreads])

  return { threads, loading, error, createThread, createReply, markReplyAsHelpful, refetch: fetchThreads }
}
