import type { FileRecord } from "@/types";
import { Download, Calendar, User, FileText } from "lucide-react";

interface FileDetailProps {
  file: FileRecord;
}

export function FileDetail({ file }: FileDetailProps) {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-zinc-900 mb-2">{file.title}</h1>
        <p className="text-zinc-500">
          {file.description || "No description provided"}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-zinc-400" />
            <span className="text-zinc-600">Course Code:</span>
            <span className="font-medium text-zinc-900">
              {file.course_code}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <User className="size-4 text-zinc-400" />
            <span className="text-zinc-600">Uploaded by:</span>
            <span className="font-medium text-zinc-900">
              {file.uploader_name || "Unknown"}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-zinc-400" />
            <span className="text-zinc-600">Role:</span>
            <span className="font-medium text-zinc-900">
              {file.uploader_role || "Unknown"}
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm">
            <Calendar className="size-4 text-zinc-400" />
            <span className="text-zinc-600">Upload Date:</span>
            <span className="font-medium text-zinc-900">
              {new Date(file.created_at).toLocaleDateString()}
            </span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <Download className="size-4 text-zinc-400" />
            <span className="text-zinc-600">Downloads:</span>
            <span className="font-medium text-zinc-900">{file.downloads}</span>
          </div>
          <div className="flex items-center gap-2 text-sm">
            <FileText className="size-4 text-zinc-400" />
            <span className="text-zinc-600">File Type:</span>
            <span className="font-medium text-zinc-900">{file.file_type}</span>
          </div>
        </div>
      </div>

      <div className="border-t border-zinc-200 pt-4">
        <h3 className="text-sm font-semibold text-zinc-900 mb-3">
          Academic Information
        </h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <span className="text-zinc-600 block">College</span>
            <span className="font-medium text-zinc-900">{file.college}</span>
          </div>
          <div>
            <span className="text-zinc-600 block">Department</span>
            <span className="font-medium text-zinc-900">{file.department}</span>
          </div>
          <div>
            <span className="text-zinc-600 block">Programme</span>
            <span className="font-medium text-zinc-900">
              {file.programmes?.[0]}
            </span>
          </div>
          <div>
            <span className="text-zinc-600 block">Level</span>
            <span className="font-medium text-zinc-900">{file.level}</span>
          </div>
        </div>
      </div>

      {file.tags && file.tags.length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-zinc-900 mb-2">Tags</h3>
          <div className="flex flex-wrap gap-2">
            {file.tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-zinc-100 text-zinc-700"
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
