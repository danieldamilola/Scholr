'use client'

import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import RoleGuard from '@/components/auth/RoleGuard'
import { FileUploadForm } from '@/components/files/FileUploadForm'
import { BookUploadForm } from '@/components/library/BookUploadForm'

type Tab = 'file' | 'book'

export default function UploadPage() {
  const searchParams = useSearchParams()
  const [activeTab, setActiveTab] = useState<Tab>('file')

  // Allow linking directly to a tab via ?tab=book
  useEffect(() => {
    const tab = searchParams.get('tab')
    if (tab === 'book') setActiveTab('book')
    else if (tab === 'file') setActiveTab('file')
  }, [searchParams])

  return (
    <RoleGuard allowedRoles={['lecturer', 'class_rep']}>
      <div className="container mx-auto max-w-4xl px-4 py-8">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Upload Content</h1>
          <p className="text-zinc-500 text-sm">
            Share course materials and library books with students.
          </p>
        </div>

        <div className="bg-white border border-zinc-200 rounded-md">
          {/* Tabs */}
          <div className="border-b border-zinc-200">
            <div className="flex">
              <button
                type="button"
                onClick={() => setActiveTab('file')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'file'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Course Material
              </button>
              <button
                type="button"
                onClick={() => setActiveTab('book')}
                className={`flex-1 px-6 py-3 text-sm font-medium transition-colors ${
                  activeTab === 'book'
                    ? 'text-blue-600 border-b-2 border-blue-600'
                    : 'text-zinc-500 hover:text-zinc-900'
                }`}
              >
                Library Book
              </button>
            </div>
          </div>

          <div className="p-6">
            {activeTab === 'file' ? (
              <FileUploadForm />
            ) : (
              <BookUploadForm />
            )}
          </div>
        </div>
      </div>
    </RoleGuard>
  )
}
