import { cn } from "@/lib/utils";

interface PageContainerProps {
  children: React.ReactNode;
  /** Maximum width of the container. Defaults to "xl". */
  size?: "sm" | "md" | "lg" | "xl" | "full";
  /** Additional wrapper class names */
  className?: string;
}

const WIDTH_MAP = {
  sm: "max-w-2xl",
  md: "max-w-4xl",
  lg: "max-w-5xl",
  xl: "max-w-6xl",
  full: "max-w-7xl",
};

/**
 * A centered container wrapper for page content with configurable max-width.
 *
 * Example:
 *   <PageContainer>
 *     <h1>Page content here</h1>
 *   </PageContainer>
 *
 *   <PageContainer size="sm">
 *     <p>Narrow form content</p>
 *   </PageContainer>
 */
export function PageContainer({ children, size = "xl", className }: PageContainerProps) {
  return (
    <div className={cn("mx-auto px-4 py-8", WIDTH_MAP[size], className)}>
      {children}
    </div>
  );
}
