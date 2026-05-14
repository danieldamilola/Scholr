import { CheckCircle2, AlertCircle, Info, AlertTriangle, type LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

type AlertType = "success" | "error" | "warning" | "info";

interface AlertBannerProps {
  type: AlertType;
  message: string;
  /** Optional custom icon overrides the default per-type icon */
  icon?: LucideIcon;
  /** Optional additional class names */
  className?: string;
}

const ICON_MAP: Record<AlertType, LucideIcon> = {
  success: CheckCircle2,
  error: AlertCircle,
  warning: AlertTriangle,
  info: Info,
};

const STYLE_MAP: Record<AlertType, string> = {
  success: "bg-success-bg border-success text-success-text",
  error: "bg-error-bg border-error text-error-text",
  warning: "bg-amber-50 border-amber-200 text-amber-800",
  info: "bg-blue-50 border-blue-200 text-blue-800",
};

/**
 * An inline alert banner (toast-like) for success, error, warning, and info messages.
 *
 * Examples:
 *   <AlertBanner type="success" message="File deleted." />
 *   <AlertBanner type="error" message="Something went wrong." />
 */
export function AlertBanner({ type, message, icon: CustomIcon, className }: AlertBannerProps) {
  const Icon = CustomIcon || ICON_MAP[type];
  return (
    <div
      className={cn(
        "flex items-start gap-2.5 rounded-md border px-4 py-3 text-sm",
        STYLE_MAP[type],
        className,
      )}
    >
      <Icon className="size-4 shrink-0 mt-0.5" />
      <span>{message}</span>
    </div>
  );
}
