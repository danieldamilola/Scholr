'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'

export function useBookmarks() {
  const [bookmarkedFileIds, setBookmarkedFileIds] = useState<Set<string>>(new Set())
  const [loading, setLoading] = useState(true)

  const fetchBookmarks = useCallback(async () => {
    try {
      const supabase = createClientSingleton()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setBookmarkedFileIds(new Set())
        return
      }

      const { data, error } = await supabase
        .from('bookmarks')
        .select('file_id')
        .eq('user_id', user.id)

      if (error) throw error

      const ids = new Set((data || []).map((b: any) => b.file_id))
      setBookmarkedFileIds(ids)
    } catch (error) {
      console.error('Failed to fetch bookmarks:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchBookmarks()
  }, [fetchBookmarks])

  const toggleBookmark = async (fileId: string) => {
    try {
      const supabase = createClientSingleton()
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) throw new Error('Not authenticated')

      const isBookmarked = bookmarkedFileIds.has(fileId)

      if (isBookmarked) {
        // Remove bookmark
        const { error } = await supabase
          .from('bookmarks')
          .delete()
          .eq('user_id', user.id)
          .eq('file_id', fileId)

        if (error) throw error

        setBookmarkedFileIds((prev) => {
          const newSet = new Set(prev)
          newSet.delete(fileId)
          return newSet
        })
      } else {
        // Add bookmark
        const { error } = await supabase
          .from('bookmarks')
          .insert({
            user_id: user.id,
            file_id: fileId,
          } as any)

        if (error) throw error

        setBookmarkedFileIds((prev) => new Set(prev).add(fileId))
      }
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
      throw error
    }
  }

  const isBookmarked = (fileId: string) => bookmarkedFileIds.has(fileId)

  return { bookmarkedFileIds, loading, toggleBookmark, isBookmarked, refetch: fetchBookmarks }
}
