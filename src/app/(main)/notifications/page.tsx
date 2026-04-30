"use client";

import { useNotifications } from "@/hooks/useNotifications";
import { Bell, Check, ExternalLink, Loader2 } from "lucide-react";
import Link from "next/link";

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } =
    useNotifications();

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-semibold text-ink mb-1">
            Notifications
          </h1>
          <p className="text-sm text-ink-muted">
            {unreadCount > 0
              ? `${unreadCount} unread notification${unreadCount !== 1 ? "s" : ""}`
              : "You're all caught up"}
          </p>
        </div>
        {unreadCount > 0 && (
          <button
            type="button"
            onClick={markAllAsRead}
            className="inline-flex items-center gap-2 h-8 px-4 text-sm text-ink-soft hover:text-ink border border-border hover:border-border rounded-md transition-colors bg-surface"
          >
            <Check className="size-3.5" />
            Mark all read
          </button>
        )}
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex justify-center py-16">
          <Loader2 className="size-5 text-ink-muted animate-spin" />
        </div>
      )}

      {/* Empty */}
      {!loading && notifications.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Bell className="size-10 text-ink-muted mb-3" strokeWidth={1.5} />
          <p className="text-sm font-medium text-ink mb-1">
            No notifications yet
          </p>
          <p className="text-xs text-ink-muted">
            You&apos;ll be notified when someone responds to your requests.
          </p>
        </div>
      )}

      {/* List */}
      {!loading && notifications.length > 0 && (
        <div className="space-y-2">
          {notifications.map((n) => (
            <div
              key={n.id}
              className={`flex items-start gap-4 p-4 rounded-md border transition-colors ${
                n.is_read
                  ? "bg-surface border-border"
                  : "bg-brand-wash border-border"
              }`}
            >
              {/* Unread dot */}
              <div className="mt-1 shrink-0">
                {!n.is_read ? (
                  <span className="size-2 rounded-full bg-brand block" />
                ) : (
                  <span className="size-2 rounded-full bg-transparent block" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm text-ink leading-relaxed">
                  {n.message}
                </p>
                <p className="text-xs text-ink-muted mt-1.5">
                  {new Date(n.created_at).toLocaleString("en-US", {
                    month: "short",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                {!n.is_read && (
                  <button
                    type="button"
                    onClick={() => markAsRead(n.id)}
                    title="Mark as read"
                    className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                  >
                    <Check className="size-3.5" />
                  </button>
                )}
                {n.link && (
                  <Link
                    href={n.link}
                    className="p-1.5 rounded-md text-ink-muted hover:text-ink hover:bg-subtle transition-colors"
                    title="Go to related page"
                  >
                    <ExternalLink className="size-3.5" />
                  </Link>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
