"use client";

import { useEffect, useState } from "react";
import { useUser } from "@/hooks/useUser";
import { createClientSingleton } from "@/lib/supabase/client";
import type { FileRecord } from "@/types";
import RoleGuard from "@/components/auth/RoleGuard";
import { ManageFilesTable } from "@/components/files/ManageFilesTable";
import { CheckCircle2, AlertCircle } from "lucide-react";

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

  const fetchFiles = async () => {
    if (!user?.session?.user.id) return;

    setLoading(true);
    try {
      const supabase = createClientSingleton();
      const { data, error } = await supabase
        .from("files")
        .select("*")
        .eq("uploaded_by", user.session.user.id)
        .order("created_at", { ascending: false });

      if (error) throw error;
      setFiles(data || []);
    } catch (error) {
      console.error("Error fetching files:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFiles();
  }, [user]);

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
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-ink mb-1">My Files</h1>
          <p className="text-sm text-ink-muted">
            View and manage your uploaded course materials.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className={`flex items-center gap-2 rounded-md px-4 py-3 text-sm mb-6 border ${
              toast.type === "success"
                ? "bg-success-bg border-success text-success-text"
                : "bg-error-bg border-error text-error-text"
            }`}
          >
            {toast.type === "success" ? (
              <CheckCircle2 className="size-4 shrink-0" />
            ) : (
              <AlertCircle className="size-4 shrink-0" />
            )}
            {toast.text}
          </div>
        )}

        <div className="bg-surface border border-line rounded-md overflow-hidden">
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
