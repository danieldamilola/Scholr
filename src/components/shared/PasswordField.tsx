"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { FormField } from "./FormField";
import { TextInput } from "./TextInput";

interface PasswordFieldProps {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  hint?: string;
}

export function PasswordField({
  id,
  label,
  value,
  onChange,
  placeholder,
  required,
  disabled,
  error,
  hint,
}: PasswordFieldProps) {
  const [show, setShow] = useState(false);

  return (
    <FormField label={label} required={required} error={error} hint={hint}>
      <div className="relative">
        <TextInput
          id={id}
          type={show ? "text" : "password"}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(!show)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
          aria-label={show ? "Hide password" : "Show password"}
        >
          {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
        </button>
      </div>
    </FormField>
  );
}
