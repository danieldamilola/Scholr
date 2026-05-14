"use client";

import { useUser } from "@/hooks/useUser";
import { BookUploadForm } from "@/components/library/BookUploadForm";
import { LoadingSkeleton } from "@/components/shared/LoadingSkeleton";
import { PageHeader } from "@/components/shared/PageHeader";
import { ShieldAlert } from "lucide-react";

export default function LibraryUploadPage() {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-10">
        <LoadingSkeleton variant="card" count={1} />
      </div>
    );
  }

  if (user?.profile?.role !== "librarian") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center px-4">
        <div className="p-4 bg-destructive/10 rounded-full mb-4">
          <ShieldAlert className="size-10 text-red-500" />
        </div>
        <h1 className="text-xl font-semibold text-ink mb-2">
          Access Restricted
        </h1>
        <p className="text-sm text-ink-muted max-w-sm">
          Only librarians can upload books to the MTU library. If you believe
          this is a mistake, contact an administrator.
        </p>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">
      <PageHeader
        title="Upload Book"
        description="Add a new textbook or reference material to the MTU library."
      />
      <BookUploadForm />
    </div>
  );
}
