'use client'

import { useEffect, useState } from 'react'
import { createClientSingleton } from '@/lib/supabase/client'
import type { FileRecord, BookRecord } from '@/types'

export default function AdminContentPage() {
  const [files, setFiles] = useState<FileRecord[]>([])
  const [books, setBooks] = useState<BookRecord[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<'files' | 'books'>('files')

  useEffect(() => {
    async function fetchContent() {
      try {
        const supabase = createClientSingleton()

        const [filesData, booksData] = await Promise.all([
          supabase.from('files').select('*').order('created_at', { ascending: false }).limit(20),
          supabase.from('books').select('*').order('created_at', { ascending: false }).limit(20),
        ])

        if (filesData.error) throw filesData.error
        if (booksData.error) throw booksData.error

        setFiles((filesData.data || []) as FileRecord[])
        setBooks((booksData.data || []) as BookRecord[])
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch content')
      } finally {
        setLoading(false)
      }
    }

    fetchContent()
  }, [])

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold text-zinc-900 mb-8">Content Management</h1>

      <div className="mb-6">
        <div className="border-b border-zinc-200">
          <div className="flex">
            <button
              onClick={() => setActiveTab('files')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'files'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Files ({files.length})
            </button>
            <button
              onClick={() => setActiveTab('books')}
              className={`px-6 py-3 text-sm font-medium transition-colors ${
                activeTab === 'books'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-zinc-500 hover:text-zinc-900'
              }`}
            >
              Books ({books.length})
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="text-zinc-500">Loading content...</div>
      ) : error ? (
        <div className="text-red-600">{error}</div>
      ) : (activeTab === 'files' && files.length === 0) || (activeTab === 'books' && books.length === 0) ? (
        <div className="text-center py-12 text-zinc-500">
          {activeTab === 'files' ? 'No files found.' : 'No books found.'}
        </div>
      ) : (
        <div className="bg-white border border-zinc-200 rounded-md overflow-hidden">
          <table className="w-full">
            <thead className="bg-zinc-50 border-b border-zinc-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  Title
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  {activeTab === 'files' ? 'Course Code' : 'Author'}
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  College
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  Department
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  Uploaded By
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-zinc-500 uppercase">
                  Date
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-200">
              {activeTab === 'files' ? (
                files.map((file) => (
                  <tr key={file.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                      {file.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {file.course_code}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {file.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {file.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {file.uploader_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {new Date(file.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              ) : (
                books.map((book) => (
                  <tr key={book.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-900">
                      {book.title}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {book.author}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {book.college}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {book.department}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {book.uploader_name}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-zinc-600">
                      {new Date(book.created_at).toLocaleDateString()}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
