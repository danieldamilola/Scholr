"use client";

import { useEffect, useState } from "react";
import { createClientSingleton } from "@/lib/supabase/client";
import type { FileRecord } from "@/types";
import { FileGrid } from "@/components/files/FileGrid";
import { EmptyState } from "@/components/shared/EmptyState";
import { LoadingSpinner } from "@/components/shared/LoadingSpinner";
import { PageHeader } from "@/components/shared/PageHeader";
import { Bookmark } from "lucide-react";

export default function BookmarksPage() {
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchBookmarkedFiles() {
      try {
        const supabase = createClientSingleton();
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (!user) {
          setFiles([]);
          return;
        }

        // Fetch bookmarked file IDs
        const { data: bookmarks, error: bookmarksError } = await supabase
          .from("bookmarks")
          .select("file_id")
          .eq("user_id", user.id);

        if (bookmarksError) throw bookmarksError;

        if (!bookmarks || bookmarks.length === 0) {
          setFiles([]);
          return;
        }

        const fileIds = bookmarks.map((b: any) => b.file_id);

        // Fetch file details
        const { data: filesData, error: filesError } = await supabase
          .from("files")
          .select("*")
          .in("id", fileIds);

        if (filesError) throw filesError;

        setFiles(filesData || []);
      } catch (error) {
        console.error("Failed to fetch bookmarks:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchBookmarkedFiles();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 py-10">
      <PageHeader
        title="Bookmarks"
        description="Your saved course materials for quick access."
      />

      {loading ? (
        <LoadingSpinner />
      ) : files.length === 0 ? (
        <EmptyState
          icon={Bookmark}
          heading="No bookmarks yet"
          subtext="Save files to your bookmarks to find them quickly later."
        />
      ) : (
        <FileGrid files={files} loading={loading} />
      )}
    </div>
  );
}
