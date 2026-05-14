'use client'

import { BookCard } from './BookCard'
import { EmptyState } from '@/components/shared/EmptyState'
import { LoadingSkeleton } from '@/components/shared/LoadingSkeleton'
import { BookOpen } from 'lucide-react'
import type { BookRecord } from '@/types'

interface BookGridProps {
  books: BookRecord[]
  loading: boolean
  error?: string | null
  total?: number
  pageSize?: number
  page?: number
  onPageChange?: (page: number) => void
}

export function BookGrid({
  books,
  loading,
  error,
  total = 0,
  pageSize = 12,
  page = 1,
  onPageChange,
}: BookGridProps) {
  const totalPages = Math.ceil(total / pageSize)

  if (loading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {[...Array(8)].map((_, i) => (
          <LoadingSkeleton key={i} variant="card" />
        ))}
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-600">{error}</p>
      </div>
    )
  }

  if (books.length === 0) {
    return (
      <EmptyState
        icon={BookOpen}
        heading="No books found"
        subtext="Try adjusting your filters or search terms."
      />
    )
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {books.map((book) => (
          <BookCard key={book.id} book={book} />
        ))}
      </div>

      {totalPages > 1 && onPageChange && (
        <div className="flex items-center justify-center gap-2">
          <button
            onClick={() => onPageChange(page - 1)}
            disabled={page === 1}
            className="px-4 py-2 border border-border rounded-md text-sm text-ink-soft hover:bg-subtle disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-sm text-ink-soft">
            Page {page} of {totalPages}
          </span>
          <button
            onClick={() => onPageChange(page + 1)}
            disabled={page === totalPages}
            className="px-4 py-2 border border-border rounded-md text-sm text-ink-soft hover:bg-subtle disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
      )}
    </div>
  )
}
