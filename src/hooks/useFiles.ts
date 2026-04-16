"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientSingleton } from "@/lib/supabase/client";
import type { FileRecord } from "@/types";

// ─── Module-level query cache ─────────────────────────────────────────────────
// Shared across all hook instances on the same page load.
// Entries expire after 60 s so data stays reasonably fresh.
interface CacheEntry {
  data: FileRecord[];
  total: number;
  ts: number;
}
const _cache = new Map<string, CacheEntry>();
const TTL = 60_000; // 1 minute

function fromCache(key: string): CacheEntry | null {
  const e = _cache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL) {
    _cache.delete(key);
    return null;
  }
  return e;
}

/** Call this after an upload so the next browse shows fresh data. */
export function invalidateFilesCache() {
  _cache.clear();
}

// ─── Column list ──────────────────────────────────────────────────────────────
// Deliberately excludes `text_content` (full PDF / DOCX text — can be 100 KB+).
// text_content is only needed on the single-file detail/chat page.
const COLS = [
  "id",
  "title",
  "course_code",
  "description",
  "college",
  "department",
  "programmes",
  "level",
  "semester",
  "file_type",
  "file_url",
  "storage_path",
  "tags",
  "downloads",
  "uploaded_by",
  "uploader_name",
  "uploader_role",
  "material_type",
  "created_at",
].join(", ");

// ─── Types ────────────────────────────────────────────────────────────────────
interface UseFilesParams {
  college?: string;
  department?: string;
  programme?: string;
  level?: string;
  semester?: string;
  searchQuery?: string;
  sortBy?: "newest" | "most_downloaded";
  page?: number;
  pageSize?: number;
  materialType?: "course_material" | "past_question" | "all";
}

export function useFiles({
  college,
  department,
  programme,
  level,
  semester,
  searchQuery,
  sortBy = "newest",
  page = 1,
  pageSize = 20,
  materialType = "all",
}: UseFilesParams) {
  const [data, setData] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);

  const fetchFiles = useCallback(async () => {
    const key = JSON.stringify({
      college,
      department,
      programme,
      level,
      semester,
      searchQuery,
      sortBy,
      page,
      pageSize,
      materialType,
    });

    // ── Cache hit → instant render, no spinner ────────────────────────────
    const hit = fromCache(key);
    if (hit) {
      setData(hit.data);
      setTotal(hit.total);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const supabase = createClientSingleton();

      // Use specific columns instead of * — skips text_content (huge)
      let q = supabase.from("files").select(COLS, { count: "exact" });

      // Filters — always include "General" entries alongside specific selections
      if (college) q = q.in("college", ["General", college]);
      if (department) q = q.in("department", ["General", department]);
      if (programme) q = q.overlaps("programmes", [programme, "General"]);
      if (level) q = q.eq("level", level);
      if (semester) q = q.eq("semester", semester);

      // Full-text search (filter uses text_content even though we don't select it)
      if (searchQuery) {
        q = q.or(
          `title.ilike.%${searchQuery}%,course_code.ilike.%${searchQuery}%,description.ilike.%${searchQuery}%`,
        );
      }

      // Material type split
      if (materialType === "past_question") {
        q = q.eq("material_type", "past_question");
      } else if (materialType === "course_material") {
        q = q.or("material_type.eq.course_material,material_type.is.null");
      }

      // Sort
      q =
        sortBy === "most_downloaded"
          ? q.order("downloads", { ascending: false })
          : q.order("created_at", { ascending: false });

      // Pagination
      const from = (page - 1) * pageSize;
      q = q.range(from, from + pageSize - 1);

      const { data: files, error: fetchError, count } = await q;
      if (fetchError) throw fetchError;

      const result = (files ?? []) as FileRecord[];
      const n = count ?? 0;

      // Store in cache
      _cache.set(key, { data: result, total: n, ts: Date.now() });

      setData(result);
      setTotal(n);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch files");
    } finally {
      setLoading(false);
    }
  }, [
    college,
    department,
    programme,
    level,
    semester,
    searchQuery,
    sortBy,
    page,
    pageSize,
    materialType,
  ]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  return { data, loading, error, total, page, refetch: fetchFiles };
}
