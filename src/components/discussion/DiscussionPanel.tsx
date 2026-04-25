"use client";

import { useState } from "react";
import { MessageSquare, CornerDownRight, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useDiscussion,
  type DiscussionThreadWithReplies,
} from "@/hooks/useDiscussion";
import type { DiscussionReply, UserProfile } from "@/types";

export function DiscussionPanel({ fileId }: { fileId: string }) {
  const [newThread, setNewThread] = useState("");
  const [isComposing, setIsComposing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyContent, setReplyContent] = useState("");
  const [isReplying, setIsReplying] = useState(false);
  const { threads, loading, createThread, createReply } = useDiscussion({
    fileId,
  });

  const handlePost = async () => {
    if (!newThread.trim() || isSubmitting) return;
    setIsSubmitting(true);
    try {
      await createThread(newThread);
      setNewThread("");
      setIsComposing(false);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReply = async (threadId: string) => {
    if (!replyContent.trim() || isReplying) return;
    setIsReplying(true);
    try {
      await createReply(threadId, replyContent);
      setReplyContent("");
      setReplyingTo(null);
    } finally {
      setIsReplying(false);
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-[22px] font-semibold text-ink">Discussion</h2>
        {!isComposing && (
          <button
            onClick={() => setIsComposing(true)}
            className="h-9 px-4 bg-subtle hover:bg-border text-ink text-[13px] font-medium rounded-md transition-colors"
          >
            Start a thread
          </button>
        )}
      </div>

      {/* Compose Box */}
      {isComposing && (
        <div className="mb-8 bg-surface border border-border rounded-[10px] p-4">
          <textarea
            value={newThread}
            onChange={(e) => setNewThread(e.target.value)}
            placeholder="Share a question or insight about this document…"
            rows={3}
            autoFocus
            className="w-full text-sm text-ink placeholder:text-ink-muted bg-subtle border border-border rounded-md p-3 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
          />
          <div className="flex justify-end gap-2 mt-3">
            <button
              onClick={() => {
                setIsComposing(false);
                setNewThread("");
              }}
              className="h-8 px-3 text-sm text-ink-muted hover:text-ink transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handlePost}
              disabled={!newThread.trim() || isSubmitting}
              className="h-8 px-4 bg-brand hover:bg-brand-hover text-white text-sm font-medium rounded-md disabled:opacity-50 transition-colors flex items-center gap-2"
            >
              {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
              Post
            </button>
          </div>
        </div>
      )}

      {/* Thread List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="size-5 text-ink-muted animate-spin" />
        </div>
      ) : threads.length === 0 ? (
        <div className="py-12 text-center bg-surface border border-border rounded-[10px]">
          <MessageSquare
            className="size-7 text-ink-muted opacity-40 mx-auto mb-3"
            strokeWidth={1.5}
          />
          <p className="text-sm font-medium text-ink mb-1">
            No discussions yet
          </p>
          <p className="text-xs text-ink-muted">
            Be the first to start a conversation.
          </p>
        </div>
      ) : (
        <div className="space-y-8">
          {threads.map((thread: DiscussionThreadWithReplies) => (
            <div key={thread.id} className="flex gap-3">
              {/* Author avatar */}
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-soft text-xs font-semibold mt-0.5">
                {thread.user?.full_name?.charAt(0)?.toUpperCase() || "?"}
              </div>

              <div className="flex-1 min-w-0">
                {/* Thread meta */}
                <div className="flex items-baseline gap-2 mb-1 flex-wrap">
                  <span className="text-[13px] font-semibold text-ink">
                    {thread.user?.full_name || "Anonymous"}
                  </span>
                  <span className="text-[11px] text-ink-muted">
                    {new Date(thread.created_at).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                {/* Thread body */}
                <p className="text-[14px] text-ink-soft mb-3 leading-relaxed">
                  {thread.content}
                </p>

                {/* Actions */}
                <div className="flex items-center gap-4 mb-4">
                  <button
                    onClick={() =>
                      setReplyingTo(replyingTo === thread.id ? null : thread.id)
                    }
                    className="flex items-center gap-1.5 text-[12px] font-medium text-ink-muted hover:text-blue-600 transition-colors"
                  >
                    <CornerDownRight className="size-3.5" />
                    Reply
                  </button>
                </div>

                {/* Inline reply compose */}
                {replyingTo === thread.id && (
                  <div className="mb-4 bg-subtle border border-border rounded-md p-3">
                    <textarea
                      value={replyContent}
                      onChange={(e) => setReplyContent(e.target.value)}
                      placeholder="Write a reply…"
                      rows={2}
                      autoFocus
                      className="w-full text-sm text-ink placeholder:text-ink-muted bg-surface border border-border rounded-md p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent resize-none"
                    />
                    <div className="flex justify-end gap-2 mt-2">
                      <button
                        onClick={() => {
                          setReplyingTo(null);
                          setReplyContent("");
                        }}
                        className="h-7 px-3 text-xs text-ink-muted hover:text-ink transition-colors"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleReply(thread.id)}
                        disabled={!replyContent.trim() || isReplying}
                        className="h-7 px-3 bg-brand hover:bg-brand-hover text-white text-xs font-medium rounded-md disabled:opacity-50 transition-colors flex items-center gap-1.5"
                      >
                        {isReplying && (
                          <Loader2 className="size-3 animate-spin" />
                        )}
                        Reply
                      </button>
                    </div>
                  </div>
                )}

                {/* Replies */}
                {thread.replies && thread.replies.length > 0 && (
                  <div className="space-y-4 pl-4 border-l-2 border-border">
                    {thread.replies.map(
                      (reply: DiscussionReply & { user: UserProfile }) => (
                        <div key={reply.id} className="flex gap-2.5">
                          <div className="flex size-6 shrink-0 items-center justify-center rounded-full bg-subtle text-ink-soft text-[10px] font-semibold mt-0.5">
                            {reply.user?.full_name?.charAt(0)?.toUpperCase() ||
                              "?"}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <span className="text-[13px] font-semibold text-ink">
                                {reply.user?.full_name || "Anonymous"}
                              </span>
                              {reply.user?.role === "lecturer" && (
                                <span className="bg-blue-50 dark:bg-[#0d1f2d] text-blue-700 dark:text-blue-400 text-[10px] px-1.5 py-0.5 rounded-sm font-medium">
                                  Lecturer
                                </span>
                              )}
                              <span className="text-[11px] text-ink-muted">
                                {new Date(reply.created_at).toLocaleDateString(
                                  "en-US",
                                  {
                                    month: "short",
                                    day: "numeric",
                                  },
                                )}
                              </span>
                            </div>
                            <p className="text-[14px] text-ink-soft leading-relaxed">
                              {reply.content}
                            </p>
                          </div>
                        </div>
                      ),
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
