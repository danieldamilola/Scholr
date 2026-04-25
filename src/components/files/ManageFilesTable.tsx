'use client'

import { useState } from 'react'
import { Trash2, Download } from 'lucide-react'
import type { FileRecord } from '@/types'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog'
import { Button } from '@/components/ui/button'

interface ManageFilesTableProps {
  files: FileRecord[]
  loading: boolean
  onDelete: (file: FileRecord) => Promise<void>
}

export function ManageFilesTable({ files, loading, onDelete }: ManageFilesTableProps) {
  const [deletingFile, setDeletingFile] = useState<FileRecord | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const handleDelete = async () => {
    if (!deletingFile) return

    setIsDeleting(true)
    try {
      await onDelete(deletingFile)
    } finally {
      setIsDeleting(false)
      setDeletingFile(null)
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-ink-muted">Loading your files...</div>
    )
  }

  if (files.length === 0) {
    return (
      <div className="text-center py-12 text-ink-muted">
        You haven&apos;t uploaded any files yet.
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-border">
            <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Title</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Course Code</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Level</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Downloads</th>
            <th className="text-left py-3 px-4 text-sm font-semibold text-ink">Upload Date</th>
            <th className="text-right py-3 px-4 text-sm font-semibold text-ink">Actions</th>
          </tr>
        </thead>
        <tbody>
          {files.map((file) => (
            <tr key={file.id} className="border-b border-border hover:bg-subtle transition-colors">
              <td className="py-3 px-4">
                <div className="font-medium text-ink">{file.title}</div>
                <div className="text-xs text-ink-muted">{file.file_type}</div>
              </td>
              <td className="py-3 px-4 text-sm text-ink-soft">{file.course_code}</td>
              <td className="py-3 px-4 text-sm text-ink-soft">{file.level}</td>
              <td className="py-3 px-4 text-sm text-ink-soft">{file.downloads}</td>
              <td className="py-3 px-4 text-sm text-ink-soft">
                {new Date(file.created_at).toLocaleDateString()}
              </td>
              <td className="py-3 px-4 text-right">
                <div className="flex items-center justify-end gap-2">
                  <a
                    href={`/api/download/${file.id}`}
                    className="p-2 text-ink-muted hover:text-ink transition-colors"
                    title="Download"
                  >
                    <Download className="size-4" />
                  </a>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-ink-muted hover:text-red-600"
                        onClick={() => setDeletingFile(file)}
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete File</AlertDialogTitle>
                        <AlertDialogDescription>
                          Are you sure you want to delete &quot;{file.title}&quot;? This action cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={handleDelete}
                          disabled={isDeleting}
                          className="bg-red-600 hover:bg-red-700"
                        >
                          {isDeleting ? 'Deleting...' : 'Delete'}
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
