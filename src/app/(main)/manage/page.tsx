'use client'

import { useEffect, useState } from 'react'
import { useUser } from '@/hooks/useUser'
import { createClientSingleton } from '@/lib/supabase/client'
import type { FileRecord } from '@/types'
import RoleGuard from '@/components/auth/RoleGuard'
import { ManageFilesTable } from '@/components/files/ManageFilesTable'

export default function ManagePage() {
  const { user } = useUser()
  const [files, setFiles] = useState<FileRecord[]>([])
  const [loading, setLoading] = useState(true)

  const fetchFiles = async () => {
    if (!user?.session?.user.id) return

    setLoading(true)
    try {
      const supabase = createClientSingleton()
      const { data, error } = await supabase
        .from('files')
        .select('*')
        .eq('uploaded_by', user.session.user.id)
        .order('created_at', { ascending: false })

      if (error) throw error
      setFiles(data || [])
    } catch (error) {
      console.error('Error fetching files:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchFiles()
  }, [user])

  const handleDelete = async (file: FileRecord) => {
    if (!user?.session?.user.id) return

    try {
      const supabase = createClientSingleton()

      // Delete from storage
      await supabase.storage.from('course-materials').remove([file.storage_path])

      // Delete from database
      const { error } = await supabase.from('files').delete().eq('id', file.id)

      if (error) throw error

      // Refresh files list
      await fetchFiles()
      alert('File deleted successfully')
    } catch (error) {
      console.error('Error deleting file:', error)
      alert('Failed to delete file')
    }
  }

  return (
    <RoleGuard allowedRoles={['lecturer', 'class_rep']}>
      <div className="container mx-auto max-w-6xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Manage Files</h1>
          <p className="text-zinc-500">
            View and manage your uploaded course materials.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-md">
          <ManageFilesTable files={files} loading={loading} onDelete={handleDelete} />
        </div>
      </div>
    </RoleGuard>
  )
}
