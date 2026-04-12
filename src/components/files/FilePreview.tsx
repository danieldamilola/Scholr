import type { FileRecord } from '@/types'
import { Download, FileText } from 'lucide-react'

interface FilePreviewProps {
  file: FileRecord
}

export function FilePreview({ file }: FilePreviewProps) {
  const isPdf = file.file_type === 'PDF'

  if (isPdf) {
    return (
      <div className="w-full h-[600px] border border-zinc-200 rounded-md overflow-hidden">
        <iframe
          src={file.file_url}
          className="w-full h-full"
          title={file.title}
        />
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center p-12 border border-zinc-200 rounded-md bg-zinc-50">
      <FileText className="size-16 text-zinc-400 mb-4" />
      <h3 className="text-lg font-semibold text-zinc-900 mb-2">Preview Not Available</h3>
      <p className="text-sm text-zinc-500 text-center mb-6">
        Preview is only available for PDF files. Please download to view this {file.file_type} file.
      </p>
      <a
        href={`/api/download/${file.id}`}
        className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-md hover:bg-blue-700 transition-colors"
      >
        <Download className="size-4" />
        Download File
      </a>
    </div>
  )
}
