'use client'

import { User, ThumbsUp } from 'lucide-react'
import type { DiscussionReply, UserProfile } from '@/types'

interface ReplyCardProps {
  reply: DiscussionReply & { user: UserProfile }
}

export function ReplyCard({ reply }: ReplyCardProps) {
  return (
    <div className="flex items-start gap-3 pl-4 border-l-2 border-border transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-subtle flex items-center justify-center">
          <User className="h-4 w-4 text-ink-muted" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-ink">{reply.user.full_name || 'Anonymous'}</span>
          <span className="text-xs text-ink-muted">
            {new Date(reply.created_at).toLocaleDateString()}
          </span>
          {reply.is_helpful && (
            <span className="flex items-center gap-1 text-xs text-success">
              <ThumbsUp className="size-3" />
              Helpful
            </span>
          )}
        </div>
        <p className="text-sm text-ink-soft">{reply.content}</p>
      </div>
    </div>
  )
}
