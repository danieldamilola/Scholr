import type { FileRecord } from "@/types";
import { Download, FileText } from "lucide-react";

interface FilePreviewProps {
  file: FileRecord;
}

export function FilePreview({ file }: FilePreviewProps) {
  const isPdf = file.file_type === "PDF";

  if (isPdf) {
    return (
      <div className="w-full h-[600px] border border-border rounded-md overflow-hidden">
        <iframe
          src={file.file_url}
          className="w-full h-full"
          title={file.title}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 border border-border rounded-md bg-subtle">
      <FileText className="size-16 text-ink-muted mb-4" />
      <h3 className="text-lg font-semibold text-ink mb-2">
        Preview Not Available
      </h3>
      <p className="text-sm text-ink-muted text-center mb-6">
        Preview is only available for PDF files. Please download to view this{" "}
        {file.file_type} file.
      </p>
      <a
        href={`/api/download/${file.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-brand text-white text-sm font-medium rounded-md hover:bg-brand-hover transition-colors"
      >
        <Download className="size-4" />
        Download File
      </a>
    </div>
  );
}
