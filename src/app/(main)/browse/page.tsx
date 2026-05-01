"use client";

import { useState, useEffect } from "react";
import { useFiles } from "@/hooks/useFiles";
import { useBookmarks } from "@/hooks/useBookmarks";
import { PageHeader } from "@/components/shared/PageHeader";
import { SearchBar } from "@/components/shared/SearchBar";
import { FilterPanel } from "@/components/shared/FilterPanel";
import { FileGrid } from "@/components/files/FileGrid";

export default function BrowsePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [debouncedSearchQuery, setDebouncedSearchQuery] = useState("");
  const [college, setCollege] = useState("");
  const [department, setDepartment] = useState("");
  const [programme, setProgramme] = useState("");
  const [level, setLevel] = useState("");
  const [semester, setSemester] = useState("");
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<"newest" | "most_downloaded">("newest");

  // Debounce search query by 400ms and reset page
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchQuery(searchQuery);
    }, 400);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  const { data, loading, error, total } = useFiles({
    college,
    department,
    programme,
    level,
    semester,
    searchQuery: debouncedSearchQuery,
    sortBy,
    page,
    materialType: "course_material",
  });

  const { bookmarkedFileIds, toggleBookmark } = useBookmarks();

  const handleBookmarkToggle = async (fileId: string) => {
    try {
      await toggleBookmark(fileId);
    } catch (error) {
      console.error("Failed to toggle bookmark:", error);
    }
  };

  const handleCollegeChange = (value: string) => {
    setCollege(value);
    setDepartment("");
    setProgramme("");
    setPage(1);
  };

  const handleDepartmentChange = (value: string) => {
    setDepartment(value);
    setProgramme("");
    setPage(1);
  };

  const handleProgrammeChange = (value: string) => {
    setProgramme(value);
    setPage(1);
  };

  const handleLevelChange = (value: string) => {
    setLevel(value);
    setPage(1);
  };

  const handleSemesterChange = (value: string) => {
    setSemester(value);
    setPage(1);
  };

  const handleSortChange = (value: "newest" | "most_downloaded") => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <PageHeader
        title="Browse Files"
        description="Search and filter course materials by college, department, programme, and level."
      />

      <div className="space-y-6">
        {/* Search Bar */}
        <SearchBar
          value={searchQuery}
          onChange={setSearchQuery}
          placeholder="Search files..."
        />

        {/* Filter Panel */}
        <FilterPanel
          college={college}
          department={department}
          programme={programme}
          level={level}
          semester={semester}
          onCollegeChange={handleCollegeChange}
          onDepartmentChange={handleDepartmentChange}
          onProgrammeChange={handleProgrammeChange}
          onLevelChange={handleLevelChange}
          onSemesterChange={handleSemesterChange}
        />

        {/* Sort Options */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-ink-muted">
            {total} {total === 1 ? "file" : "files"} found
          </span>
          <select
            value={sortBy}
            onChange={(e) =>
              handleSortChange(e.target.value as "newest" | "most_downloaded")
            }
            className="border border-border rounded-md text-sm text-ink-soft px-3 py-2 bg-surface focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent transition-shadow"
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
  );
}
