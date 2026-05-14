"use client";

import { useState } from "react";
import type { FileRecord, BookRecord } from "@/types";
import { Trash2 } from "lucide-react";

export default function ContentTable({
  activeTab,
  files,
  books,
  onDeleteFile,
  onDeleteBook,
}: {
  activeTab: "files" | "books";
  files: FileRecord[];
  books: BookRecord[];
  onDeleteFile: (fileId: string) => Promise<void>;
  onDeleteBook: (bookId: string) => Promise<void>;
}) {
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const handleDeleteFile = async (fileId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(fileId);
    try {
      await onDeleteFile(fileId);
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteBook = async (bookId: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"? This action cannot be undone.`)) {
      return;
    }

    setDeletingId(bookId);
    try {
      await onDeleteBook(bookId);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="bg-surface border border-border rounded-md overflow-hidden">
      <table className="w-full">
        <thead className="bg-subtle border-b border-border">
          <tr>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              Title
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              {activeTab === "files" ? "Course Code" : "Author"}
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              College
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              Department
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              Uploaded By
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              Date
            </th>
            <th className="px-6 py-3 text-left text-xs font-medium text-ink-muted uppercase">
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-border">
          {activeTab === "files"
            ? files.map((file) => (
                <tr key={file.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                    {file.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {file.course_code}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {file.college}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {file.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {file.uploader_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {new Date(file.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteFile(file.id, file.title)}
                      disabled={deletingId === file.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete file"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))
            : books.map((book) => (
                <tr key={book.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink">
                    {book.title}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {book.author}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {book.college}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {book.department}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {book.uploader_name}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-ink-soft">
                    {new Date(book.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <button
                      onClick={() => handleDeleteBook(book.id, book.title)}
                      disabled={deletingId === book.id}
                      className="text-red-600 hover:text-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                      title="Delete book"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
        </tbody>
      </table>
    </div>
  );
}
