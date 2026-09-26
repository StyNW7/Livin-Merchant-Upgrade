import type { ReactNode } from "react";
import { ChevronRight } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  actionLabel?: string;
  to?: string;
  onAction?: () => void;
  right?: ReactNode;
  className?: string;
}

export function SectionHeader({ title, subtitle, actionLabel, to, onAction, right, className }: SectionHeaderProps) {
  const action = actionLabel ? (
    to ? (
      <Link to={to} className="inline-flex min-h-[32px] items-center gap-0.5 text-[13px] font-semibold text-sky-600 hover:text-sky-700">
        {actionLabel}
        <ChevronRight className="h-4 w-4" />
      </Link>
    ) : (
      <button
        type="button"
        onClick={onAction}
        className="inline-flex min-h-[32px] items-center gap-0.5 text-[13px] font-semibold text-sky-600 hover:text-sky-700"
      >
        {actionLabel}
        <ChevronRight className="h-4 w-4" />
      </button>
    )
  ) : null;

  return (
    <div className={cn("mb-3 flex items-end justify-between gap-3", className)}>
      <div className="min-w-0">
        <h2 className="text-[16px] font-bold tracking-tight text-ink">{title}</h2>
        {subtitle && <p className="mt-0.5 text-[12.5px] text-ink-muted">{subtitle}</p>}
      </div>
      {right ?? action}
    </div>
  );
}
