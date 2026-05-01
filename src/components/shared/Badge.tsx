import { cn } from "@/lib/utils";

type BadgeColor = "default" | "brand" | "success" | "warning" | "danger" | "purple" | "amber";

interface BadgeProps {
  children: React.ReactNode;
  color?: BadgeColor;
  className?: string;
}

const BADGE_COLORS: Record<BadgeColor, string> = {
  default: "bg-subtle text-ink-soft",
  brand: "bg-brand-wash text-brand",
  success: "bg-success-bg text-success",
  warning: "bg-amber-50 text-amber-700",
  danger: "bg-red-50 text-red-700",
  purple: "bg-purple-50 text-purple-700",
  amber: "bg-amber-50 text-amber-700",
};

/**
 * A small colored pill for displaying roles, statuses, and tags.
 *
 * Examples:
 *   <Badge>active</Badge>
 *   <Badge color="brand">admin</Badge>
 *   <Badge color="success">verified</Badge>
 *   <Badge color="danger">banned</Badge>
 */
export function Badge({ children, color = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-block px-2 py-0.5 rounded-full text-xs font-medium capitalize",
        BADGE_COLORS[color],
        className,
      )}
    >
      {children}
    </span>
  );
}
