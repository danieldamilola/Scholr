"use client";

import { useState, useEffect } from "react";
import { useBooks } from "@/hooks/useBooks";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { BookGrid } from "@/components/library/BookGrid";

export default function LibraryPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [subject, setSubject] = useState("");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "most_downloaded">("newest");

  // Debounce search query by 400ms
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
      setPage(1);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setPage(1);
  };

  const handleSubjectChange = (value: string) => {
    setSubject(value);
    setPage(1);
  };

  const handleSortByChange = (value: "newest" | "most_downloaded") => {
    setSortBy(value);
    setPage(1);
  };

  const { data, loading, error, total } = useBooks({
    college,
    department,
    subject,
    searchQuery: debouncedSearchQuery,
    sortBy,
    page,
  });

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setDepartment("");
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <PageHeader
        title="Library"
        description="Browse textbooks and reference materials by college, department, and subject."
      />

      <div className="space-y-6">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search books..."
        />

        {/* Filter Panel */}
        <FilterPanel
          college={college}
          department={department}
          programme={subject}
          level={level}
          semester={semester}
          onCollegeChange={handleCollegeChange}
          onDepartmentChange={handleDepartmentChange}
          onProgrammeChange={handleSubjectChange}
          onLevelChange={setLevel}
          onSemesterChange={setSemester}
        />

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">
            {total} {total === 1 ? "book" : "books"} found
          </span>
          <select
            value={sortBy}
            onChange={(e) =>
              handleSortByChange(e.target.value as "newest" | "most_downloaded")
            }
            className="border border-border rounded-md text-sm text-ink-soft px-3 py-2 bg-surface"
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
  );
}
