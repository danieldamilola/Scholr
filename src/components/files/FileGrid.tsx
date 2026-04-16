import { FileText } from 'lucide-react'
import type { FileRecord } from '@/types'
import { FileCard } from './FileCard'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { EmptyState } from '@/components/shared/EmptyState'

interface FileGridProps {
  files: FileRecord[]
  loading: boolean
  error?: string | null
  total?: number
  page?: number
  pageSize?: number
  onPageChange?: (page: number) => void
  bookmarkedFileIds?: Set<string>
  onBookmarkToggle?: (fileId: string) => void
  emptyMessage?: string
  emptySubMessage?: string
}

export function FileGrid({
  files,
  loading,
  error,
  total = 0,
  page = 1,
  pageSize = 20,
  onPageChange,
  bookmarkedFileIds = new Set(),
  onBookmarkToggle,
  emptyMessage = 'No files found',
  emptySubMessage = 'Try adjusting your filters or search terms',
}: FileGridProps) {
  const totalPages = Math.ceil(total / pageSize)

  if (loading) {
    return <LoadingSkeleton variant="card" count={8} />
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">Error: {error}</p>
      </div>
    )
  }

  if (files.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        heading={emptyMessage}
        subtext={emptySubMessage}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {files.map((file) => (
          <FileCard
            key={file.id}
            file={file}
            isBookmarked={bookmarkedFileIds.has(file.id)}
            onBookmarkToggle={onBookmarkToggle ? () => onBookmarkToggle(file.id) : undefined}
          />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-zinc-200 rounded-md text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-zinc-600">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-zinc-200 rounded-md text-sm text-zinc-700 hover:bg-zinc-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
