'use client'

import { useState } from 'react'
import { MessageSquare, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useDiscussion } from '@/hooks/useDiscussion'
import { ThreadCard } from './ThreadCard'

interface DiscussionSectionProps {
  fileId: string
}

export function DiscussionSection({ fileId }: DiscussionSectionProps) {
  const [newThreadContent, setNewThreadContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const { threads, loading, createThread } = useDiscussion({ fileId })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newThreadContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      await createThread(newThreadContent)
      setNewThreadContent('')
    } catch (error) {
      console.error('Failed to create thread:', error)
      alert('Failed to post your question. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <MessageSquare className="size-4 text-ink-soft" />
        <h3 className="text-lg font-semibold text-ink">Discussion</h3>
      </div>

      <form onSubmit={handleSubmit} className="space-y-3">
        <Input
          value={newThreadContent}
          onChange={(e) => setNewThreadContent(e.target.value)}
          placeholder="Ask a question about this file..."
          disabled={isSubmitting}
        />
        <Button type="submit" disabled={!newThreadContent.trim() || isSubmitting}>
          {isSubmitting ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            <Send className="size-4" />
          )}
          Post Question
        </Button>
      </form>

      {loading ? (
        <div className="text-center py-8 text-ink-muted">Loading discussions...</div>
      ) : threads.length === 0 ? (
        <div className="text-center py-8 text-ink-muted">
          No discussions yet. Be the first to ask a question!
        </div>
      ) : (
        <div className="space-y-4">
          {threads.map((thread) => (
            <ThreadCard key={thread.id} thread={thread} />
          ))}
        </div>
      )}
    </div>
  )
}
