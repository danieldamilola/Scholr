"use client";

import { useState, useEffect, useCallback } from "react";
import { createClientSingleton } from "@/lib/supabase/client";
import type { BookRecord } from "@/types";

// ─── Module-level TTL cache ───────────────────────────────────────────────────
interface CacheEntry {
  data: BookRecord[];
  total: number;
  ts: number;
}
const _booksCache = new Map<string, CacheEntry>();
const TTL = 60_000;

function fromCache(key: string): CacheEntry | null {
  const e = _booksCache.get(key);
  if (!e) return null;
  if (Date.now() - e.ts > TTL) {
    _booksCache.delete(key);
    return null;
  }
  return e;
}

/** Call this after an upload so the next browse shows fresh data. */
export function invalidateBooksCache() {
  _booksCache.clear();
}

interface UseBooksParams {
  college?: string;
  department?: string;
  subject?: string;
  searchQuery?: string;
  sortBy?: "newest" | "most_downloaded";
  page?: number;
}

export function useBooks({
  college,
  department,
  subject,
  searchQuery,
  sortBy = "newest",
  page = 1,
}: UseBooksParams) {
  const [data, setData] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const pageSize = 20;

  const fetchBooks = useCallback(async () => {
    const key = JSON.stringify({
      college,
      department,
      subject,
      searchQuery,
      sortBy,
      page,
      pageSize,
    });

    // ── Cache hit → instant render, no spinner ──────────────────────────────
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

      let query = supabase
        .from("books")
        .select(
          "id, title, author, description, college, department, subject, file_url, storage_path, cover_url, downloads, uploaded_by, uploader_name, created_at",
          { count: "exact" },
        );

      // Apply filters
      if (college) query = query.eq("college", college);
      if (department) query = query.eq("department", department);
      if (subject) query = query.ilike("subject", `%${subject}%`);

      // Search in title and author
      if (searchQuery) {
        query = query.or(
          `title.ilike.%${searchQuery}%,author.ilike.%${searchQuery}%`,
        );
      }

      // Sorting
      if (sortBy === "newest") {
        query = query.order("created_at", { ascending: false });
      } else if (sortBy === "most_downloaded") {
        query = query.order("downloads", { ascending: false });
      }

      // Pagination
      const from = (page - 1) * pageSize;
      const to = from + pageSize - 1;
      query = query.range(from, to);

      const { data: booksData, error: booksError, count } = await query;

      if (booksError) throw booksError;

      const result = (booksData || []) as BookRecord[];
      const n = count || 0;

      // Store in cache
      _booksCache.set(key, { data: result, total: n, ts: Date.now() });

      setData(result);
      setTotal(n);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch books");
    } finally {
      setLoading(false);
    }
  }, [college, department, subject, searchQuery, sortBy, page]);

  useEffect(() => {
    fetchBooks();
  }, [fetchBooks]);

  return { data, loading, error, total, pageSize, refetch: fetchBooks };
}
