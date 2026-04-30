import type { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  heading: string;
  subtext: string;
  actionLabel?: string;
  onAction?: () => void;
}

export function EmptyState({
  icon: Icon,
  heading,
  subtext,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <div className="flex min-h-[400px] w-full flex-col items-center justify-center px-4 py-20">
      <div className="flex flex-col items-center text-center">
        <div className="mb-6">
          <Icon className="size-12 text-ink-muted opacity-40" strokeWidth={1.5} />
        </div>
        <h3 className="mb-2 text-lg font-semibold text-ink">{heading}</h3>
        <p className="max-w-sm text-sm text-ink-muted text-pretty">{subtext}</p>
        {actionLabel && onAction && (
          <div className="mt-6">
            <button
              onClick={onAction}
              className="bg-brand hover:bg-brand-hover text-white text-sm font-medium h-9 px-4 py-2 rounded-md transition-colors"
            >
              {actionLabel}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
