import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { ChevronRight } from "lucide-react";
import { cn } from "@/utils/cn";

interface ListRowProps {
  icon?: LucideIcon;
  iconTone?: "navy" | "gold" | "sky" | "success" | "warning" | "danger" | "neutral";
  title: string;
  subtitle?: string;
  right?: ReactNode;
  to?: string;
  onClick?: () => void;
  chevron?: boolean;
  className?: string;
  leading?: ReactNode;
}

const iconTones = {
  navy: "bg-navy-50 text-navy-600",
  gold: "bg-gold-50 text-gold-700",
  sky: "bg-sky-50 text-sky-600",
  success: "bg-success-soft text-success-dark",
  warning: "bg-warning-soft text-warning-dark",
  danger: "bg-danger-soft text-danger-dark",
  neutral: "bg-surface text-ink-soft",
};

/** The standard tappable row for menus and lists. Renders a Link, a button or a plain row. */
export function ListRow({ icon: Icon, iconTone = "navy", title, subtitle, right, to, onClick, chevron, className, leading }: ListRowProps) {
  const content = (
    <>
      {leading ??
        (Icon && (
          <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", iconTones[iconTone])}>
            <Icon className="h-[18px] w-[18px]" />
          </span>
        ))}
      <span className="min-w-0 flex-1">
        <span className="block truncate text-[14px] font-semibold text-ink">{title}</span>
        {subtitle && <span className="mt-0.5 block truncate text-[12px] text-ink-muted">{subtitle}</span>}
      </span>
      {right}
      {(chevron ?? Boolean(to || onClick)) && <ChevronRight className="h-4 w-4 shrink-0 text-ink-faint" />}
    </>
  );
  const base = cn("flex min-h-[60px] w-full items-center gap-3 px-4 py-2.5 text-left", className);
  if (to) {
    return (
      <Link to={to} className={cn(base, "transition-colors hover:bg-surface/70 active:bg-surface")}>
        {content}
      </Link>
    );
  }
  if (onClick) {
    return (
      <button type="button" onClick={onClick} className={cn(base, "transition-colors hover:bg-surface/70 active:bg-surface")}>
        {content}
      </button>
    );
  }
  return <div className={base}>{content}</div>;
}

export function ListGroup({ children, className, title }: { children: ReactNode; className?: string; title?: string }) {
  return (
    <section className={className}>
      {title && <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted">{title}</h2>}
      <div className="card divide-y divide-surface-line overflow-hidden">{children}</div>
    </section>
  );
}

export function InfoRow({ label, value, strong, className }: { label: string; value: ReactNode; strong?: boolean; className?: string }) {
  return (
    <div className={cn("flex items-start justify-between gap-4 py-2 text-[13.5px]", className)}>
      <span className="shrink-0 text-ink-muted">{label}</span>
      <span className={cn("min-w-0 text-right", strong ? "font-bold text-ink" : "font-medium text-ink-soft")}>{value}</span>
    </div>
  );
}
