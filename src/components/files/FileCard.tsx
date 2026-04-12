import Link from 'next/link'
import { Bookmark, Download, FileText } from 'lucide-react'
import type { FileRecord } from '@/types'
import { cn } from '@/lib/utils'

interface FileCardProps {
  file: FileRecord
  isBookmarked?: boolean
  onBookmarkToggle?: () => void
}

export function FileCard({ file, isBookmarked = false, onBookmarkToggle }: FileCardProps) {
  return (
    <Link href={`/file/${file.id}`} className="group block">
      <div className="h-full bg-white border border-zinc-200 rounded-md p-4 hover:border-zinc-300 hover:shadow-sm transition-all duration-150 flex flex-col">

        {/* Top row: file type badge + bookmark */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-zinc-100 rounded-sm">
              <FileText className="size-3.5 text-zinc-500" />
            </div>
            <span className="text-[11px] font-mono text-zinc-500 uppercase tracking-wide">
              {file.file_type || 'FILE'}
            </span>
          </div>
          {onBookmarkToggle && (
            <button
              type="button"
              onClick={e => { e.preventDefault(); e.stopPropagation(); onBookmarkToggle() }}
              className="p-1 rounded-sm text-zinc-300 hover:text-blue-600 transition-colors"
              aria-label={isBookmarked ? 'Remove bookmark' : 'Add bookmark'}
            >
              <Bookmark className={cn('size-4', isBookmarked && 'fill-blue-600 text-blue-600')} />
            </button>
          )}
        </div>

        {/* Title */}
        <h3 className="text-sm font-semibold text-zinc-900 line-clamp-2 mb-1 flex-1">
          {file.title}
        </h3>

        {/* Course code */}
        {file.course_code && (
          <p className="text-[11px] font-mono text-zinc-400 mb-2">{file.course_code}</p>
        )}

        {/* Meta */}
        <div className="flex flex-wrap gap-1 mb-3">
          {file.level && (
            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-sm">
              Level {file.level}
            </span>
          )}
          {file.semester && (
            <span className="text-[10px] bg-zinc-100 text-zinc-500 px-1.5 py-0.5 rounded-sm">
              {file.semester}
            </span>
          )}
        </div>

        {/* Bottom row */}
        <div className="flex items-center justify-between pt-3 border-t border-zinc-100">
          <span className="text-[11px] text-zinc-400 truncate max-w-[60%]">
            {file.uploader_name || 'Unknown'}
          </span>
          <span className="flex items-center gap-1 text-[11px] text-zinc-400">
            <Download className="size-3" />
            {file.downloads ?? 0}
          </span>
        </div>
      </div>
    </Link>
  )
}
