import type { LucideIcon } from "lucide-react";

interface PageHeaderProps {
  /** Page title */
  title: string;
  /** Optional subtitle / description (supports JSX) */
  description?: React.ReactNode;
  /** Optional icon shown to the left of the title */
  icon?: LucideIcon;
  /** Optional background colour class for the icon container (default: bg-brand-wash) */
  iconBg?: string;
  /** Optional icon colour class (default: text-brand) */
  iconColor?: string;
  /** Optional action element (e.g. a button) shown on the right */
  action?: React.ReactNode;
  /** Optional additional wrapper class names */
  className?: string;
}

/**
 * Reusable page header with optional icon and action slot.
 *
 * Examples:
 *   <PageHeader title="My Files" description="View and manage your files." />
 *   <PageHeader title="Past Questions" description="..." icon={FileQuestion} />
 *   <PageHeader title="My Books" description="..." action={<Link href="...">Upload</Link>} />
 */
export function PageHeader({
  title,
  description,
  icon: Icon,
  iconBg = "bg-brand-wash",
  iconColor = "text-brand",
  action,
  className = "",
}: PageHeaderProps) {
  return (
    <div className={`mb-8 flex items-center justify-between ${className}`}>
      <div className="flex items-center gap-3">
        {Icon && (
          <div
            className={`inline-flex size-9 items-center justify-center rounded-md ${iconBg}`}
          >
            <Icon className={`size-4 ${iconColor}`} />
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold text-ink">{title}</h1>
          {description && (
            <p className="text-sm text-ink-muted mt-0.5">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}
