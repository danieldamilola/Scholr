import { Search, X } from 'lucide-react'

interface SearchBarProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
}

export function SearchBar({ value, onChange, placeholder = 'Search...' }: SearchBarProps) {
  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-ink-muted" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-surface border border-border rounded-md text-sm text-ink placeholder:text-ink-muted focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent h-9 pl-9 pr-9 transition-shadow"
      />
      {value && (
        <button
          type="button"
          onClick={() => onChange('')}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-muted hover:text-ink-soft"
          aria-label="Clear search"
        >
          <X className="size-4" />
        </button>
      )}
    </div>
  )
}
