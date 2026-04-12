'use client'

import { User, ThumbsUp } from 'lucide-react'
import type { DiscussionReply, UserProfile } from '@/types'

interface ReplyCardProps {
  reply: DiscussionReply & { user: UserProfile }
}

export function ReplyCard({ reply }: ReplyCardProps) {
  return (
    <div className="flex items-start gap-3 pl-4 border-l-2 border-zinc-200 hover:border-zinc-300 transition-colors">
      <div className="flex-shrink-0">
        <div className="w-8 h-8 rounded-full bg-zinc-200 flex items-center justify-center">
          <User className="h-4 w-4 text-zinc-500" />
        </div>
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2 mb-1">
          <span className="font-medium text-sm text-zinc-900">{reply.user.full_name || 'Anonymous'}</span>
          <span className="text-xs text-zinc-500">
            {new Date(reply.created_at).toLocaleDateString()}
          </span>
          {reply.is_helpful && (
            <span className="flex items-center gap-1 text-xs text-green-600">
              <ThumbsUp className="size-3" />
              Helpful
            </span>
          )}
        </div>
        <p className="text-sm text-zinc-700">{reply.content}</p>
      </div>
    </div>
  )
}
