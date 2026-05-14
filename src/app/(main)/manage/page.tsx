"use client";

import { useCallback, useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClientSingleton } from "@/lib/supabase/client";
import type { FileRecord } from "@/types";
import RoleGuard from "@/components/auth/RoleGuard";
import { ManageFilesTable } from "@/components/files/ManageFilesTable";
import { PageHeader } from "@/components/shared/PageHeader";
import { AlertBanner } from "@/components/shared/AlertBanner";

export default function ManagePage() {
  const { user } = useUser();
  const [files, setFiles] = useState<FileRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<{
    type: "success" | "error";
    text: string;
  } | null>(null);

  const showToast = (type: "success" | "error", text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 4000);
  };

  const fetchFiles = useCallback(async () => {
    const uid = user?.session?.user.id;
    if (!uid) return;

    setLoading(true);
    try {
      const supabase = createClientSingleton();
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("uploaded_by", uid)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  }, [user?.session?.user.id]);

  useEffect(() => {
    fetchFiles();
  }, [fetchFiles]);

  const handleDelete = async (file: FileRecord) => {
    if (!user?.session?.user.id) return;

    try {
      const supabase = createClientSingleton();

      // Delete from storage
      await supabase.storage
        .from("course-materials")
        .remove([file.storage_path]);

      // Delete from database
      const { error } = await supabase.from("files").delete().eq("id", file.id);

      if (error) throw error;

      // Refresh files list
      await fetchFiles();
      showToast("success", "File deleted successfully.");
    } catch (error) {
      console.error("Error deleting file:", error);
      showToast("error", "Failed to delete file. Please try again.");
    }
  };

  return (
    <RoleGuard allowedRoles={["lecturer", "class_rep"]}>
      <div className="max-w-6xl mx-auto px-4 py-8">
        <PageHeader
          title="My Files"
          description="View and manage your uploaded course materials."
        />

        {/* Toast */}
        {toast && (
          <AlertBanner
            type={toast.type}
            message={toast.text}
            className="mb-6"
          />
        )}

        <div className="bg-surface border border-border rounded-md overflow-hidden">
          <ManageFilesTable
            files={files}
            loading={loading}
            onDelete={handleDelete}
          />
        </div>
      </div>
    </RoleGuard>
  );
}
