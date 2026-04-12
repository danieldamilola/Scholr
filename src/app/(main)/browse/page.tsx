'use client'

import { useState, useEffect } from 'react'
import { useFiles } from '@/hooks/useFiles'
import { useBookmarks } from '@/hooks/useBookmarks'
import { SearchBar } from '@/components/shared/SearchBar'
import { FilterPanel } from '@/components/shared/FilterPanel'
import { FileGrid } from '@/components/files/FileGrid'

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState('')
  const [college, setCollege] = useState('')
  const [department, setDepartment] = useState('')
  const [programme, setProgramme] = useState('')
  const [level, setLevel] = useState('')
  const [semester, setSemester] = useState('')
  const [page, setPage] = useState(1)
  const [sortBy, setSortBy] = useState<'newest' | 'most_downloaded'>('newest')

  // Debounce search query by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery)
      setPage(1) // Reset to page 1 when search changes
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery])

  // Reset page when filters change
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
  })

  const { bookmarkedFileIds, toggleBookmark } = useBookmarks()

  const handleBookmarkToggle = async (fileId: string) => {
    try {
      await toggleBookmark(fileId)
    } catch (error) {
      console.error('Failed to toggle bookmark:', error)
    }
  }

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
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">Browse Files</h1>
        <p className="text-zinc-500">
          Search and filter course materials by college, department, programme, and level.
        </p>
      </div>

      <div className="space-y-6">
        {/* Search Bar */}
        <SearchBar value={searchQuery} onChange={setSearchQuery} placeholder="Search files..." />

        {/* Filter Panel */}
        <FilterPanel
          college={college}
          department={department}
          programme={programme}
          level={level}
          semester={semester}
          onCollegeChange={handleCollegeChange}
          onDepartmentChange={handleDepartmentChange}
          onProgrammeChange={setProgramme}
          onLevelChange={setLevel}
          onSemesterChange={setSemester}
        />

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-zinc-500">
            {total} {total === 1 ? 'file' : 'files'} found
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

        {/* File Grid */}
        <FileGrid
          files={data}
          loading={loading}
          error={error}
          total={total}
          page={page}
          onPageChange={setPage}
          bookmarkedFileIds={bookmarkedFileIds}
          onBookmarkToggle={handleBookmarkToggle}
        />
      </div>
    </div>
  )
}

