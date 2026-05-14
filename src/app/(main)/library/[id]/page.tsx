"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { createClientSingleton } from "@/lib/supabase/client";
import type { BookRecord } from "@/types";
import {
  Download,
  BookOpen,
  User,
  Calendar,
  Building2,
  GraduationCap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";

export default function BookDetailPage() {
  const params = useParams();
  const bookId = params.id as string;
  const [book, setBook] = useState<BookRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchBook() {
      try {
        const supabase = createClientSingleton();
        const { data, error } = await supabase
          .from("books")
          .select("*")
          .eq("id", bookId)
          .single();

        if (error) throw error;
        setBook(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load book");
      } finally {
        setLoading(false);
      }
    }

    fetchBook();
  }, [bookId]);

  const handleDownload = async () => {
    if (!book) return;

    try {
      // Increment download count
      const supabase = createClientSingleton();
      // @ts-ignore - Supabase type inference issue
      await supabase.rpc("increment_book_downloads", { p_book_id: bookId });

      // Trigger download
      window.open(book.file_url, "_blank");
    } catch (error) {
      console.error("Failed to download:", error);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  if (error || !book) {
    return (
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="text-center py-12">
          <p className="text-red-600">{error || "Book not found"}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-6xl px-4 py-8">
      <div className="mb-6">
        <a
          href="/library"
          className="text-sm text-ink-muted hover:text-ink transition-colors"
        >
          ← Back to Library
        </a>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Cover Image */}
        <div className="lg:col-span-1">
          <div className="aspect-[3/4] bg-subtle rounded-md overflow-hidden sticky top-4">
            {book.cover_url ? (
              <img
                src={book.cover_url}
                alt={book.title}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <BookOpen className="h-24 w-24 text-ink-muted" />
              </div>
            )}
          </div>
        </div>

        {/* Book Details */}
        <div className="lg:col-span-2">
          <div className="bg-surface border border-border rounded-md p-6 space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-ink mb-2">{book.title}</h1>
              <p className="text-lg text-ink-soft">{book.author}</p>
            </div>

            {book.description && (
              <div>
                <h2 className="text-sm font-semibold text-ink mb-2">
                  Description
                </h2>
                <p className="text-sm text-ink-soft">{book.description}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Building2 className="size-4" />
                <span>{book.college}</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <GraduationCap className="size-4" />
                <span>{book.department}</span>
              </div>
              {book.subject && (
                <div className="flex items-center gap-2 text-sm text-ink-soft">
                  <BookOpen className="size-4" />
                  <span>{book.subject}</span>
                </div>
              )}
              <div className="flex items-center gap-2 text-sm text-ink-soft">
                <Download className="size-4" />
                <span>{book.downloads} downloads</span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <User className="size-4" />
              <span>Uploaded by {book.uploader_name || "Unknown"}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-ink-soft">
              <Calendar className="size-4" />
              <span>
                Added {new Date(book.created_at).toLocaleDateString()}
              </span>
            </div>

            <div className="pt-4 border-t border-border">
              <Button onClick={handleDownload} className="w-full" size="lg">
                <Download className="mr-2 size-5" />
                Download Book
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
