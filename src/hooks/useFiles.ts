'use client'

import { useState, useEffect, useCallback } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { FileRecord } from '@/types'

interface UseFilesParams {
  college?: string
  department?: string
  programme?: string
  level?: string
  semester?: string
  searchQuery?: string
  sortBy?: 'newest' | 'most_downloaded'
  page?: number
  pageSize?: number
}

export function useFiles({
  college,
  department,
  programme,
  level,
  semester,
  searchQuery,
  sortBy = 'newest',
  page = 1,
  pageSize = 20,
}: UseFilesParams) {
  const [data, setData] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [total, setTotal] = useState(0)

  const fetchFiles = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const supabase = createClientSingleton()

      let query = supabase
        .from('files')
        .select('*', { count: 'exact' })

      // Build filter: always include General files alongside the user's specific filters
      // General files have college='General', department='General', programmes=['General']

      // Apply the combined college condition
      if (college) {
        query = query.or(`college.eq.General,college.eq.${college}`)
      }
      // Apply department filter (also always include General dept)
      if (department) {
        query = query.or(`department.eq.General,department.eq.${department}`)
      }
      // Apply programme filter (overlaps: programme array contains 'General' OR user's programme)
      if (programme) {
        query = query.overlaps('programmes', [programme, 'General'])
      }
      if (level) query = query.eq('level', level)
      if (semester) query = query.eq('semester', semester)

      // Search query (matches title, course_code, or full text content)
      if (searchQuery) {
        query = query.or(`title.ilike.%${searchQuery}%,course_code.ilike.%${searchQuery}%,text_content.ilike.%${searchQuery}%`)
      }

      // Sort
      if (sortBy === 'newest') {
        query = query.order('created_at', { ascending: false })
      } else if (sortBy === 'most_downloaded') {
        query = query.order('downloads', { ascending: false })
      }

      // Pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1
      query = query.range(from, to)

      const { data: files, error: fetchError, count } = await query

      if (fetchError) throw fetchError

      setData(files || [])
      setTotal(count || 0)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch files')
    } finally {
      setLoading(false)
    }
  }, [college, department, programme, level, semester, searchQuery, sortBy, page, pageSize])

  useEffect(() => {
    fetchFiles()
  }, [fetchFiles])

  return { data, loading, error, total, page, refetch: fetchFiles }
}
