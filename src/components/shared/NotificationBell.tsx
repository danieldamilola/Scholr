import { Bell } from 'lucide-react'
import { Button } from '@/components/ui/button'

interface NotificationBellProps {
  count: number
  onClick?: () => void
}

export function NotificationBell({ count, onClick }: NotificationBellProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="relative text-zinc-500 transition-colors hover:text-zinc-900"
      aria-label={`Notifications, ${count} unread`}
    >
      <Bell className="size-5" />
      {count > 0 && (
        <span className="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-blue-600 text-[10px] font-medium text-white">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </button>
  )
}
