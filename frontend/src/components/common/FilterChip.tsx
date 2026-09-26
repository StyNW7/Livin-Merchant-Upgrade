import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface FilterChipProps {
  label: string;
  active?: boolean;
  onClick?: () => void;
  icon?: ReactNode;
  count?: number;
  className?: string;
}

export function FilterChip({ label, active, onClick, icon, count, className }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 whitespace-nowrap rounded-full border px-3.5 text-[13px] font-semibold transition-all duration-150 active:scale-95",
        active
          ? "border-navy bg-navy text-white shadow-[0_4px_12px_-4px_rgba(0,58,112,0.45)]"
          : "border-surface-line bg-white text-ink-soft hover:border-navy-200 hover:text-navy",
        className,
      )}
    >
      {icon}
      {label}
      {count !== undefined && (
        <span
          className={cn(
            "rounded-full px-1.5 text-[11px] font-bold",
            active ? "bg-white/20 text-white" : "bg-surface text-ink-muted",
          )}
        >
          {count}
        </span>
      )}
    </button>
  );
}

interface SegmentedProps<T extends string> {
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
  tone?: "light" | "dark";
  ariaLabel?: string;
}

/** iOS-style segmented control for tabs and time ranges. */
export function Segmented<T extends string>({ options, value, onChange, className, tone = "light", ariaLabel }: SegmentedProps<T>) {
  return (
    <div
      role="tablist"
      aria-label={ariaLabel}
      className={cn(
        "flex rounded-2xl p-1",
        tone === "light" ? "bg-navy-50/70" : "bg-white/10",
        className,
      )}
    >
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(option.value)}
            className={cn(
              "h-9 flex-1 rounded-xl px-2 text-[13px] font-semibold transition-all duration-200",
              tone === "light"
                ? active
                  ? "bg-white text-navy shadow-card"
                  : "text-ink-muted hover:text-navy"
                : active
                  ? "bg-white text-navy"
                  : "text-white/75 hover:text-white",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}

export function ChipRow({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5", className)}>{children}</div>;
}
