'use client'

import RoleGuard from '@/components/auth/RoleGuard'
import { FileUploadForm } from '@/components/files/FileUploadForm'

export default function UploadPage() {
  return (
    <RoleGuard allowedRoles={['lecturer', 'class_rep']}>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-semibold text-zinc-900 mb-1">Upload Course Material</h1>
          <p className="text-sm text-zinc-500">
            Share notes, slides, and past questions with your students.
          </p>
        </div>
        <div className="bg-white border border-zinc-200 rounded-[10px] p-6">
          <FileUploadForm />
        </div>
      </div>
    </RoleGuard>
  )
}
