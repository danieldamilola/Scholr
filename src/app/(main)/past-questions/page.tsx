'use client'

import { useState, useEffect } from 'react'
import { useFiles } from '@/hooks/useFiles'
import { useBookmarks } from '@/hooks/useBookmarks'
import { SearchBar } from '@/components/shared/SearchBar'
import { FilterPanel } from '@/components/shared/FilterPanel'
import { FileGrid } from '@/components/files/FileGrid'
import { FileQuestion } from 'lucide-react'

export default function PastQuestionsPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [programme, setProgramme] = useState('')
  const [level, setLevel] = useState('')
  const [semester, setSemester] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'newest' | 'most_downloaded'>('newest')

  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1)
    }, 400)
    return () => clearTimeout(timer)
  }, [searchQuery])

  useEffect(() => {
    setPage(1)
  }, [college, department, programme, level, semester, sortBy])

  const { data, loading, error, total } = useFiles({
    college,
    department,
    programme,
    level,
    semester,
    searchQuery: debouncedSearchQuery,
    sortBy,
    page,
    materialType: 'past_question',
  })

  const { bookmarkedFileIds, toggleBookmark } = useBookmarks()

  const handleCollegeChange = (value: string) => {
    setCollege(value)
    setDepartment('')
    setProgramme('')
  }

  const handleDepartmentChange = (value: string) => {
    setDepartment(value)
    setProgramme('')
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-8">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="inline-flex size-9 items-center justify-center rounded-md bg-blue-50">
          <FileQuestion className="size-4 text-blue-600" />
        </div>
        <div>
          <h1 className="text-xl font-semibold text-zinc-900">Past Questions</h1>
          <p className="text-sm text-zinc-500">
            Exam past questions uploaded by class representatives
            {total > 0 && <span className="ml-1 text-zinc-400">· {total} file{total !== 1 ? 's' : ''}</span>}
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="mb-5">
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search past questions by title, course code, or content..."
        />
      </div>

      {/* Filters + Grid */}
      <div className="flex flex-col gap-6 lg:flex-row">
        <aside className="lg:w-56 shrink-0">
          <FilterPanel
            college={college}
            department={department}
            programme={programme}
            level={level}
            semester={semester}
            sortBy={sortBy}
            onCollegeChange={handleCollegeChange}
            onDepartmentChange={handleDepartmentChange}
            onProgrammeChange={setProgramme}
            onLevelChange={setLevel}
            onSemesterChange={setSemester}
            onSortByChange={setSortBy}
          />
        </aside>

        <div className="flex-1 min-w-0">
          {error && (
            <div className="text-sm text-red-600 bg-red-50 border border-red-100 rounded-md p-4 mb-4">
              {error}
            </div>
          )}
          <FileGrid
            files={data}
            loading={loading}
            bookmarkedFileIds={bookmarkedFileIds}
            onBookmarkToggle={async (id) => { try { await toggleBookmark(id) } catch {} }}
            emptyMessage="No past questions found"
            emptySubMessage="Past questions uploaded by class reps will appear here."
          />

          {/* Pagination */}
          {!loading && total > 20 && (
            <div className="mt-6 flex items-center justify-between">
              <p className="text-xs text-zinc-400">
                Showing {Math.min((page - 1) * 20 + 1, total)}–{Math.min(page * 20, total)} of {total}
              </p>
              <div className="flex gap-2">
                <button
                  type="button"
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="h-8 px-3 text-xs border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Previous
                </button>
                <button
                  type="button"
                  disabled={page * 20 >= total}
                  onClick={() => setPage(p => p + 1)}
                  className="h-8 px-3 text-xs border border-zinc-200 rounded-md text-zinc-600 hover:bg-zinc-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
