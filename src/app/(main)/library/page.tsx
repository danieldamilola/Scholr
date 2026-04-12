'use client'

import { useState, useEffect } from 'react'
import { useBooks } from '@/hooks/useBooks'
import { SearchBar } from '@/components/shared/SearchBar'
import { FilterPanel } from '@/components/shared/FilterPanel'
import { BookGrid } from '@/components/library/BookGrid'

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [subject, setSubject] = useState('')
  const [level, setLevel] = useState('')
  const [semester, setSemester] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'newest' | 'most_downloaded'>('newest')

  // Debounce search query by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page when filters change
  useEffect(() => {
    setPage(1)
  }, [college, department, subject, sortBy])

  const { data, loading, error, total } = useBooks({
    college,
    department,
    subject,
    searchQuery: debouncedSearchQuery,
    sortBy,
    page,
  })

  const handleCollegeChange = (value: string) => {
    setCollege(value)
    setDepartment('')
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Library</h1>
        <p className="text-zinc-500">
          Browse textbooks and reference materials by college, department, and subject.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search books..." />

        {/* Filter Panel */}
        <FilterPanel
          college={college}
          department={department}
          programme={subject}
          level={level}
          semester={semester}
          onCollegeChange={handleCollegeChange}
          onDepartmentChange={setDepartment}
          onProgrammeChange={setSubject}
          onLevelChange={setLevel}
          onSemesterChange={setSemester}
        />

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            {total} {total === 1 ? 'book' : 'books'} found
          </span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as 'newest' | 'most_downloaded')}
            className="border border-zinc-200 rounded-md text-sm text-zinc-700 px-3 py-2 bg-white"
          >
            <option value="newest">Newest First</option>
            <option value="most_downloaded">Most Downloaded</option>
          </select>
        </div>

        {/* Book Grid */}
        <BookGrid
          books={data}
          loading={loading}
          error={error}
          total={total}
          page={page}
          onPageChange={setPage}
        />
      </div>
    </div>
  )
}

