"use client";

import { useEffect, useState } from "react";
import { createClientSingleton } from "@/lib/supabase/client";
import type { FileRecord, BookRecord } from "@/types";
import ContentTable from "@/components/admin/ContentTable";

export default function AdminContentPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"files" | "books">("files");

  const fetchContent = async () => {
    try {
      const supabase = createClientSingleton();

      const [filesData, booksData] = await Promise.all([
        supabase
          .from("files")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
        supabase
          .from("books")
          .select("*")
          .order("created_at", { ascending: false })
          .limit(20),
      ]);

      if (filesData.error) throw filesData.error;
      if (booksData.error) throw booksData.error;

      setFiles((filesData.data || []) as FileRecord[]);
      setBooks((booksData.data || []) as BookRecord[]);
    } catch (error) {
      setError(
        error instanceof Error ? error.message : "Failed to fetch content",
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchContent();
  }, []);

  const handleDeleteFile = async (fileId: string) => {
    try {
      const response = await fetch("/api/admin/delete-file", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ fileId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete file");
      }

      // Refresh the content list after successful deletion
      await fetchContent();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete file",
      );
      throw error;
    }
  };

  const handleDeleteBook = async (bookId: string) => {
    try {
      const response = await fetch("/api/admin/delete-book", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Failed to delete book");
      }

      // Refresh the content list after successful deletion
      await fetchContent();
    } catch (error) {
      alert(
        error instanceof Error ? error.message : "Failed to delete book",
      );
      throw error;
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-ink mb-8">Content Management</h1>

      <div className="mb-6">
        <div className="border-b border-border">
          <div className="flex">
            <button
              onClick={() => setActiveTab("files")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "files"
                  ? "text-brand border-b-2 border-brand"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Files ({files.length})
            </button>
            <button
              onClick={() => setActiveTab("books")}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === "books"
                  ? "text-brand border-b-2 border-brand"
                  : "text-ink-muted hover:text-ink"
              }`}
            >
              Books ({books.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-ink-muted">Loading content...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (activeTab === "files" && files.length === 0) ||
        (activeTab === "books" && books.length === 0) ? (
        <div className="text-center py-12 text-ink-muted">
          {activeTab === "files" ? "No files found." : "No books found."}
        </div>
      ) : (
        <ContentTable
          activeTab={activeTab}
          files={files}
          books={books}
          onDeleteFile={handleDeleteFile}
          onDeleteBook={handleDeleteBook}
        />
      )}
    </div>
  );
}
