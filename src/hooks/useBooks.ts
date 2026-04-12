'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { BookRecord } from '@/types'

interface UseBooksParams {
  college?: string
  department?: string
  subject?: string
  searchQuery?: string
  sortBy?: 'newest' | 'most_downloaded'
  page?: number
}

export function useBooks({
  college,
  department,
  subject,
  searchQuery,
  sortBy = 'newest',
  page = 1,
}: UseBooksParams) {
  const [data, setData] = useState<BookRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)
  const pageSize = 12

  const fetchBooks = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClientSingleton()

      let query = supabase
        .from('books')
        .select('*', { count: 'exact' })

      // Apply filters
      if (college) query = query.eq('college', college)
      if (department) query = query.eq('department', department)
      if (subject) query = query.ilike('subject', `%${subject}%`)

      // Search in title and author
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`)
      }

      // Sorting
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'most_downloaded') {
        query = query.order('downloads', { ascending: false })
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data: booksData, error: booksError, count } = await query

      if (booksError) throw booksError

      setData((booksData || []) as BookRecord[])
      setTotal(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch books')
    } finally {
      setLoading(false)
    }
  }, [college, department, subject, searchQuery, sortBy, page])

  useEffect(() => {
    fetchBooks()
  }, [fetchBooks])

  return { data, loading, error, total, pageSize, refetch: fetchBooks }
}
