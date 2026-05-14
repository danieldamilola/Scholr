import type { FileRecord } from "@/types";
import { Download, Calendar, User, FileText } from "lucide-react";

interface FileDetailProps {
  file: FileRecord;
}

export function FileDetail({ file }: FileDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-ink mb-2">
          {file.title}
        </h1>
        <p className="text-ink-muted">
          {file.description || "No description provided"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-ink-muted" />
            <span className="text-ink-soft">Course Code:</span>
            <span className="font-medium text-ink">
              {file.course_code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-ink-muted" />
            <span className="text-ink-soft">Uploaded by:</span>
            <span className="font-medium text-ink">
              {file.uploader_name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-ink-muted" />
            <span className="text-ink-soft">Role:</span>
            <span className="font-medium text-ink">
              {file.uploader_role || "Unknown"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-ink-muted" />
            <span className="text-ink-soft">Upload Date:</span>
            <span className="font-medium text-ink">
              {new Date(file.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Download className="size-4 text-ink-muted" />
            <span className="text-ink-soft">Downloads:</span>
            <span className="font-medium text-ink">{file.downloads}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-ink-muted" />
            <span className="text-ink-soft">File Type:</span>
            <span className="font-medium text-ink">{file.file_type}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-border pt-4">
        <h3 className="text-sm font-semibold text-ink mb-3">
          Academic Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-ink-muted block">College</span>
            <span className="font-medium text-ink">{file.college}</span>
          </div>
          <div>
            <span className="text-ink-muted block">Department</span>
            <span className="font-medium text-ink">{file.department}</span>
          </div>
          <div>
            <span className="text-ink-muted block">Programme</span>
            <span className="font-medium text-ink">
              {file.programmes?.[0]}
            </span>
          </div>
          <div>
            <span className="text-ink-muted block">Level</span>
            <span className="font-medium text-ink">{file.level}</span>
          </div>
        </div>
      </div>

      {file.tags && file.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-ink mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {file.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2 py-0.5 rounded-sm text-xs font-medium bg-subtle text-ink-soft"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
