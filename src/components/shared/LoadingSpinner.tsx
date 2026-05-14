import { Loader2 } from "lucide-react";

const SIZE_MAP: Record<number, string> = {
  4: "size-4",
  5: "size-5",
  6: "size-6",
  8: "size-8",
  10: "size-10",
};

interface LoadingSpinnerProps {
  /** Size of the spinner icon (default: 5) */
  size?: keyof typeof SIZE_MAP;
  /** Optional text shown below the spinner */
  text?: string;
  /** Minimum height for the container (default: false -> py-16) */
  fullPage?: boolean;
  /** Additional class names on the wrapper */
  className?: string;
}

/**
 * Centered loading spinner for async content areas.
 *
 * Examples:
 *   <LoadingSpinner />
 *   <LoadingSpinner size={6} text="Loading files…" />
 *   <LoadingSpinner fullPage />
 */
export function LoadingSpinner({
  size = 5,
  text,
  fullPage = false,
  className = "",
}: LoadingSpinnerProps) {
  return (
    <div
      className={`flex flex-col items-center justify-center ${fullPage ? "min-h-[60vh]" : "py-16"} ${className}`}
    >
      <Loader2
        className={`${SIZE_MAP[size as keyof typeof SIZE_MAP] || "size-5"} text-ink-muted animate-spin`}
      />
      {text && <p className="mt-3 text-sm text-ink-muted">{text}</p>}
    </div>
  );
}
