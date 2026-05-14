"use client";

import RoleGuard from "@/components/auth/RoleGuard";
import { FileUploadForm } from "@/components/files/FileUploadForm";
import { PageHeader } from "@/components/shared/PageHeader";

export default function UploadPage() {
  return (
    <RoleGuard allowedRoles={["lecturer", "class_rep"]}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <PageHeader
          title="Upload Course Material"
          description="Share notes, slides, and past questions with your students."
        />
        <div className="bg-surface border border-border rounded-md p-6">
          <FileUploadForm />
        </div>
      </div>
    </RoleGuard>
  );
}
