"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClientSingleton } from "@/lib/supabase/client";
import type { BookRecord } from "@/types";
import { Trash2, BookOpen, Loader2, ShieldAlert } from "lucide-react";
import Link from "next/link";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

export default function ManageBooksPage() {
  const { user, loading: userLoading } = useUser();
  const [books, setBooks] = useState<BookRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const fetchBooks = async () => {
    const supabase = createClientSingleton();
    const { data } = await supabase
      .from("books")
      .select("*")
      .eq("uploaded_by", user?.session?.user?.id ?? "")
      .order("created_at", { ascending: false });
    setBooks((data as BookRecord[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (user?.session?.user?.id) fetchBooks();
  }, [user?.session?.user?.id]);

  const handleDelete = async () => {
    if (!deletingId) return;
    setIsDeleting(true);
    try {
      const supabase = createClientSingleton();
      const book = books.find((b) => b.id === deletingId);
      if (book?.storage_path) {
        await supabase.storage
          .from("library-books")
          .remove([book.storage_path]);
      }
      await supabase.from("books").delete().eq("id", deletingId);
      setBooks((prev) => prev.filter((b) => b.id !== deletingId));
      setDeletingId(null);
    } finally {
      setIsDeleting(false);
    }
  };

  if (userLoading) return null;

  if (user?.profile?.role !== "librarian") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <ShieldAlert className="size-10 text-red-400 mb-3" />
        <p className="text-sm text-ink-muted">
          Only librarians can manage books.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">My Books</h1>
          <p className="text-sm text-ink-muted">
            Manage books you uploaded to the library.
          </p>
        </div>
        <Link
          href="/library/upload"
          className="inline-flex items-center gap-2 h-9 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md transition-colors"
        >
          + Upload Book
        </Link>
      </div>

      {loading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 text-ink-muted animate-spin" />
        </div>
      ) : books.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <BookOpen className="size-10 text-ink-muted mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-ink mb-1">
            No books uploaded yet
          </p>
          <p className="text-xs text-ink-muted mb-4">
            Start by uploading a book to the library.
          </p>
          <Link
            href="/library/upload"
            className="inline-flex items-center gap-2 h-9 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md transition-colors"
          >
            Upload First Book
          </Link>
        </div>
      ) : (
        <div className="bg-surface border border-line rounded-md overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border bg-subtle">
                <th className="text-left py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wide">
                  Book
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden md:table-cell">
                  Department
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden lg:table-cell">
                  Downloads
                </th>
                <th className="text-left py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wide hidden lg:table-cell">
                  Added
                </th>
                <th className="text-right py-3 px-4 text-xs font-semibold text-ink-muted uppercase tracking-wide">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody>
              {books.map((book) => (
                <tr
                  key={book.id}
                  className="border-b border-border last:border-0 hover:bg-subtle transition-colors"
                >
                  <td className="py-3 px-4">
                    <p className="text-sm font-medium text-ink truncate max-w-[220px]">
                      {book.title}
                    </p>
                    {book.author && (
                      <p className="text-xs text-ink-muted">{book.author}</p>
                    )}
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-muted hidden md:table-cell">
                    {book.department || "—"}
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-muted hidden lg:table-cell">
                    {book.downloads}
                  </td>
                  <td className="py-3 px-4 text-sm text-ink-muted hidden lg:table-cell">
                    {new Date(book.created_at).toLocaleDateString()}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <button
                          type="button"
                          onClick={() => setDeletingId(book.id)}
                          className="inline-flex items-center justify-center p-1.5 rounded-md text-ink-muted hover:text-red-600 hover:bg-red-50 transition-colors"
                          title="Delete book"
                        >
                          <Trash2 className="size-4" />
                        </button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>Delete Book</AlertDialogTitle>
                          <AlertDialogDescription>
                            Are you sure you want to permanently delete{" "}
                            <strong>{book.title}</strong>? This cannot be
                            undone.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel
                            onClick={() => setDeletingId(null)}
                          >
                            Cancel
                          </AlertDialogCancel>
                          <AlertDialogAction
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="bg-red-600 hover:bg-red-700 text-white"
                          >
                            {isDeleting ? (
                              <Loader2 className="size-4 animate-spin" />
                            ) : (
                              "Delete Book"
                            )}
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
