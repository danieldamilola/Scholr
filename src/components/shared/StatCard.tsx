import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface StatCardProps {
  /** The metric label shown below the value */
  label: string;
  /** The numeric or text value to display */
  value: string | number;
  /** Lucide icon to render inside the icon container */
  icon: LucideIcon;
  /** Background class for the icon container, e.g. "bg-brand-wash" */
  iconBg?: string;
  /** Colour class for the icon, e.g. "text-brand-muted" */
  iconColor?: string;
  /** Additional wrapper class names */
  className?: string;
}

/**
 * A compact metric card for dashboards and admin panels.
 *
 * Example:
 *   <StatCard label="Total Users" value={1423} icon={Users} />
 *   <StatCard label="Books" value={89} icon={BookOpen} iconBg="bg-success-bg" iconColor="text-success" />
 */
export function StatCard({
  label,
  value,
  icon: Icon,
  iconBg = "bg-brand-wash",
  iconColor = "text-brand-muted",
  className,
}: StatCardProps) {
  return (
    <div className={cn("bg-surface border border-border rounded-md p-5", className)}>
      <div className="flex items-center gap-3">
        <div className={cn("p-2.5 rounded-md", iconBg)}>
          <Icon className={cn("size-5", iconColor)} />
        </div>
        <div>
          <p className="text-xl font-bold text-ink">{value}</p>
          <p className="text-xs text-ink-muted">{label}</p>
        </div>
      </div>
    </div>
  );
}
