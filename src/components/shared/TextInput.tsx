import { cn } from "@/lib/utils";

interface TextInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  inputSize?: "default" | "sm";
}

export function TextInput({ className, inputSize = "default", ...props }: TextInputProps) {
  return (
    <input
      className={cn(
        "flex w-full rounded-md border border-border bg-surface text-sm text-ink placeholder:text-ink-muted",
        "focus:outline-none focus:ring-2 focus:ring-brand-muted focus:border-transparent",
        "disabled:opacity-50 disabled:cursor-not-allowed transition-shadow",
        inputSize === "default" ? "h-9 px-3" : "h-8 px-2.5 text-xs",
        className,
      )}
      {...props}
    />
  );
}
