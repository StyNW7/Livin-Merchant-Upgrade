import { useId, type InputHTMLAttributes, type ReactNode, type SelectHTMLAttributes } from "react";
import { ChevronDown, Minus, Plus, Search, X } from "lucide-react";
import { cn } from "@/utils/cn";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
  right?: ReactNode;
}

export function SearchInput({ value, onChange, placeholder = "Search", className, right }: SearchInputProps) {
  return (
    <div className={cn("relative flex items-center", className)}>
      <Search className="pointer-events-none absolute left-3.5 h-[18px] w-[18px] text-ink-faint" aria-hidden />
      <input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="h-11 w-full rounded-2xl border border-surface-line bg-white pl-10 pr-10 text-sm text-ink placeholder:text-ink-faint focus:border-sky-400 focus:ring-4 focus:ring-sky-100 [&::-webkit-search-cancel-button]:hidden"
      />
      {value ? (
        <button
          type="button"
          onClick={() => onChange("")}
          aria-label="Clear search"
          className="absolute right-2 flex h-8 w-8 items-center justify-center rounded-full text-ink-muted hover:bg-surface"
        >
          <X className="h-4 w-4" />
        </button>
      ) : (
        right && <div className="absolute right-1.5">{right}</div>
      )}
    </div>
  );
}

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  hint?: string;
  prefix?: string;
  error?: string;
}

export function TextField({ label, hint, prefix, error, className, ...props }: TextFieldProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{label}</span>
      <div
        className={cn(
          "flex h-12 items-center rounded-2xl border bg-white px-3.5 transition-shadow focus-within:border-sky-400 focus-within:ring-4 focus-within:ring-sky-100",
          error ? "border-danger" : "border-surface-line",
        )}
      >
        {prefix && <span className="mr-2 text-sm font-semibold text-ink-muted">{prefix}</span>}
        <input id={id} className="h-full w-full bg-transparent text-[15px] text-ink placeholder:text-ink-faint" {...props} />
      </div>
      {(error || hint) && (
        <span className={cn("mt-1 block text-xs", error ? "text-danger" : "text-ink-muted")}>{error ?? hint}</span>
      )}
    </label>
  );
}

interface SelectFieldProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  options: { value: string; label: string }[];
}

export function SelectField({ label, options, className, ...props }: SelectFieldProps) {
  const id = useId();
  return (
    <label htmlFor={id} className={cn("block", className)}>
      <span className="mb-1.5 block text-[13px] font-semibold text-ink-soft">{label}</span>
      <div className="relative">
        <select
          id={id}
          className="h-12 w-full appearance-none rounded-2xl border border-surface-line bg-white px-3.5 pr-10 text-[15px] text-ink focus:border-sky-400 focus:ring-4 focus:ring-sky-100"
          {...props}
        >
          {options.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" />
      </div>
    </label>
  );
}

interface ToggleProps {
  checked: boolean;
  onChange: (value: boolean) => void;
  label: string;
  description?: string;
  icon?: ReactNode;
  disabled?: boolean;
}

export function Toggle({ checked, onChange, label, description, icon, disabled }: ToggleProps) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className="flex min-h-[52px] w-full items-center gap-3 text-left disabled:opacity-50"
    >
      {icon}
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-semibold text-ink">{label}</span>
        {description && <span className="block text-xs text-ink-muted">{description}</span>}
      </span>
      <span
        className={cn(
          "relative h-7 w-12 shrink-0 rounded-full transition-colors duration-200",
          checked ? "bg-navy" : "bg-navy-100",
        )}
      >
        <span
          className={cn(
            "absolute top-1 h-5 w-5 rounded-full bg-white shadow transition-transform duration-200",
            checked ? "translate-x-6" : "translate-x-1",
          )}
        />
      </span>
    </button>
  );
}

export function Stepper({
  value,
  onChange,
  min = 0,
  label,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl bg-navy-50 p-1" role="group" aria-label={label}>
      <button
        type="button"
        onClick={() => onChange(Math.max(min, value - 1))}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-white text-lg font-bold text-navy shadow-card active:scale-90"
        aria-label={`Decrease ${label}`}
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="tabular w-7 text-center text-sm font-bold text-ink">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="flex h-8 w-8 items-center justify-center rounded-lg bg-navy text-lg font-bold text-white active:scale-90"
        aria-label={`Increase ${label}`}
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
