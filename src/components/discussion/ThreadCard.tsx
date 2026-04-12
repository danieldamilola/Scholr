'use client'

import { useState } from 'react'
import { User, MessageSquare, ThumbsUp, Send, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { ReplyCard } from './ReplyCard'
import type { DiscussionThreadWithReplies } from '@/hooks/useDiscussion'

interface ThreadCardProps {
  thread: DiscussionThreadWithReplies
}

export function ThreadCard({ thread }: ThreadCardProps) {
  const [showReplyForm, setShowReplyForm] = useState(false)
  const [replyContent, setReplyContent] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleReply = async () => {
    if (!replyContent.trim() || isSubmitting) return

    setIsSubmitting(true)
    try {
      // This would call the createReply function from useDiscussion
      // For now, we'll need to pass it as a prop or use a different approach
      setReplyContent('')
      setShowReplyForm(false)
    } catch (error) {
      console.error('Failed to post reply:', error)
      alert('Failed to post your reply. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="border border-zinc-200 rounded-md p-4 space-y-4 hover:border-zinc-300 transition-all duration-150 hover:shadow-md">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0">
          <div className="w-10 h-10 rounded-full bg-zinc-200 flex items-center justify-center">
            <User className="size-5 text-zinc-500" />
          </div>
        </div>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1">
            <span className="font-medium text-zinc-900">{thread.user.full_name || 'Anonymous'}</span>
            <span className="text-xs text-zinc-500">
              {new Date(thread.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-sm text-zinc-700">{thread.content}</p>
        </div>
      </div>

      <div className="flex items-center gap-4 ml-13">
        <button
          onClick={() => setShowReplyForm(!showReplyForm)}
          className="flex items-center gap-1 text-sm text-zinc-500 hover:text-zinc-900 transition-colors"
        >
          <MessageSquare className="h-4 w-4" />
          Reply ({thread.replies.length})
        </button>
      </div>

      {showReplyForm && (
        <div className="ml-13 space-y-2">
          <Input
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write a reply..."
            disabled={isSubmitting}
          />
          <div className="flex gap-2">
            <Button
              size="sm"
              onClick={handleReply}
              disabled={!replyContent.trim() || isSubmitting}
            >
              {isSubmitting ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              Reply
            </Button>
            <Button size="sm" variant="outline" onClick={() => setShowReplyForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {thread.replies.length > 0 && (
        <div className="ml-13 space-y-3">
          {thread.replies.map((reply: any) => (
            <ReplyCard key={reply.id} reply={reply} />
          ))}
        </div>
      )}
    </div>
  )
}
