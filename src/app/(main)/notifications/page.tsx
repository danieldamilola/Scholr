'use client'

import { useNotifications } from '@/hooks/useNotifications'
import { Bell, Check, ExternalLink } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { EmptyState } from '@/components/shared/EmptyState'

export default function NotificationsPage() {
  const { notifications, unreadCount, loading, markAsRead, markAllAsRead } = useNotifications()

  return (
    <div className="container mx-auto max-w-3xl px-4 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-900 mb-2">Notifications</h1>
          <p className="text-zinc-500">
            {unreadCount} {unreadCount === 1 ? 'unread' : 'unread'} notification{unreadCount !== 1 ? 's' : ''}
          </p>
        </div>
        {unreadCount > 0 && (
          <Button variant="outline" onClick={markAllAsRead}>
            <Check className="size-4 mr-2" />
            Mark All Read
          </Button>
        )}
      </div>

      {loading ? (
        <div className="text-center py-12 text-zinc-500">Loading notifications...</div>
      ) : notifications.length === 0 ? (
        <EmptyState
          icon={Bell}
          heading="No notifications"
          subtext="You're all caught up! Check back later for updates."
        />
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => (
            <div
              key={notification.id}
              className={`p-4 rounded-md border ${notification.is_read
                  ? 'bg-white border-zinc-200'
                  : 'bg-blue-50 border-blue-200'
                }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <p className="text-sm text-zinc-900">{notification.message}</p>
                  <p className="text-xs text-zinc-500 mt-2">
                    {new Date(notification.created_at).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  {!notification.is_read && (
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => markAsRead(notification.id)}
                    >
                      <Check className="size-4" />
                    </Button>
                  )}
                  {notification.link && (
                    <a
                      href={notification.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-zinc-500 hover:text-zinc-900 transition-colors"
                    >
                      <ExternalLink className="size-4" />
                    </a>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
