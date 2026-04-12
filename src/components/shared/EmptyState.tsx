import type { LucideIcon } from 'lucide-react'

interface EmptyStateProps {
  icon: LucideIcon
  heading: string
  subtext: string
  actionLabel?: string
  onAction?: () => void
}

export function EmptyState({ icon: Icon, heading, subtext, actionLabel, onAction }: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">
          <Icon className="size-12 text-zinc-300" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-zinc-900">
          {heading}
        </h3>
        <p className="max-w-sm text-sm text-zinc-400 text-pretty">
          {subtext}
        </p>
        {actionLabel && onAction && (
          <div className="mt-6">
            <button
              onClick={onAction}
              className="bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium px-4 py-2 rounded-md transition-colors"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
