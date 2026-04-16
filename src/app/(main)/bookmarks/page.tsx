'use client'

import { useEffect, useState } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { FileRecord } from '@/types'
import { FileGrid } from '@/components/files/FileGrid'
import { EmptyState } from '@/components/shared/EmptyState'
import { Bookmark, Loader2 } from 'lucide-react'

export default function BookmarksPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchBookmarkedFiles() {
      try {
        const supabase = createClientSingleton()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
          setFiles([])
          return
        }

        // Fetch bookmarked file IDs
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from('bookmarks')
          .select('file_id')
          .eq('user_id', user.id)

        if (bookmarksError) throw bookmarksError

        if (!bookmarks || bookmarks.length === 0) {
          setFiles([])
          return
        }

        const fileIds = bookmarks.map((b: any) => b.file_id)

        // Fetch file details
        const { data: filesData, error: filesError } = await supabase
          .from('files')
          .select('*')
          .in('id', fileIds)

        if (filesError) throw filesError

        setFiles(filesData || [])
      } catch (error) {
        console.error('Failed to fetch bookmarks:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchBookmarkedFiles()
  }, [])

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Bookmarks</h1>
        <p className="text-sm text-zinc-500">
          Your saved course materials for quick access.
        </p>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 text-zinc-400 animate-spin" />
        </div>
      ) : files.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          heading="No bookmarks yet"
          subtext="Save files to your bookmarks to find them quickly later."
        />
      ) : (
        <FileGrid files={files} loading={loading} />
      )}
    </div>
  )
}

