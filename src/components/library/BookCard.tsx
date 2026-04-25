"use client";

import Link from "next/link";
import { BookOpen, Download } from "lucide-react";
import type { BookRecord } from "@/types";

interface BookCardProps {
  book: BookRecord;
}

export function BookCard({ book }: BookCardProps) {
  return (
    <Link href={`/library/${book.id}`}>
      <div className="group border border-border rounded-md overflow-hidden hover:shadow-sm transition-all bg-surface">
        {/* Cover Image */}
        <div className="aspect-[3/4] bg-subtle relative overflow-hidden">
          {book.cover_url ? (
            <img
              src={book.cover_url}
              alt={book.title}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <BookOpen className="size-16 text-ink-muted opacity-40" />
            </div>
          )}
        </div>

        {/* Book Info */}
        <div className="p-4">
          <h3 className="font-semibold text-ink line-clamp-2 mb-1 group-hover:text-blue-600 transition-colors">
            {book.title}
          </h3>
          <p className="text-sm text-ink-soft mb-2">{book.author}</p>

          <div className="flex items-center justify-between text-xs text-ink-muted">
            <span>{book.department}</span>
            <div className="flex items-center gap-1">
              <Download className="size-3" />
              {book.downloads}
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
}
