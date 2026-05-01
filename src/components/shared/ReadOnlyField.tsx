import { FormField } from "./FormField";

interface ReadOnlyFieldProps {
  label: string;
  value: string;
  hint?: string;
  className?: string;
}

export function ReadOnlyField({
  label,
  value,
  hint,
  className,
}: ReadOnlyFieldProps) {
  return (
    <FormField label={label} hint={hint} className={className}>
      <div className="flex h-9 w-full items-center rounded-md border border-border bg-subtle px-3 text-sm text-ink-muted select-none">
        {value}
      </div>
    </FormField>
  );
}
