import type { ReactNode } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { ChevronLeft } from "lucide-react";
import { cn } from "@/utils/cn";

interface TopAppBarProps {
  title: string;
  subtitle?: string;
  /** Where the back button goes when there is no in-app history. */
  backTo?: string;
  hideBack?: boolean;
  right?: ReactNode;
  tone?: "light" | "navy";
  className?: string;
  children?: ReactNode;
}

/** Sticky page header with consistent back navigation for every sub page. */
export function TopAppBar({ title, subtitle, backTo = "/more", hideBack, right, tone = "light", className, children }: TopAppBarProps) {
  const navigate = useNavigate();
  const location = useLocation();

  const goBack = () => {
    const hasHistory = (location.key && location.key !== "default") || window.history.length > 2;
    if (hasHistory) navigate(-1);
    else navigate(backTo);
  };

  return (
    <header
      className={cn(
        "sticky top-0 z-20 px-3 pb-2.5 pt-2",
        tone === "light" ? "border-b border-surface-line/70 bg-surface/85 backdrop-blur-xl" : "bg-gradient-to-br from-navy-400 to-navy-600 text-white",
        className,
      )}
    >
      <div className="flex min-h-[44px] items-center gap-1.5">
        {!hideBack && (
          <button
            type="button"
            onClick={goBack}
            aria-label="Go back"
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl transition active:scale-95",
              tone === "light" ? "border border-surface-line bg-white text-navy-600 shadow-soft hover:bg-navy-50" : "bg-white/20 text-white hover:bg-white/30",
            )}
          >
            <ChevronLeft className="h-5 w-5" strokeWidth={2.4} />
          </button>
        )}
        <div className={cn("min-w-0 flex-1 pl-1.5", hideBack && "pl-2")}>
          <h1 className={cn("truncate text-[17.5px] font-extrabold tracking-tight", tone === "light" ? "text-ink" : "text-white")}>{title}</h1>
          {subtitle && (
            <p className={cn("truncate text-[12px]", tone === "light" ? "text-ink-muted" : "text-white/85")}>{subtitle}</p>
          )}
        </div>
        {right && <div className="flex shrink-0 items-center gap-1.5">{right}</div>}
      </div>
      {children && <div className="mt-2 px-1">{children}</div>}
    </header>
  );
}

/** Large title header used on the five primary tabs. */
export function TabHeader({ title, subtitle, right }: { title: string; subtitle?: string; right?: ReactNode }) {
  return (
    <header className="sticky top-0 z-20 border-b border-surface-line/60 bg-surface/85 px-5 pb-3 pt-3 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[24px] font-extrabold tracking-tight text-ink">{title}</h1>
          {subtitle && <p className="truncate text-[13px] text-ink-muted">{subtitle}</p>}
        </div>
        {right && <div className="flex shrink-0 items-center gap-2">{right}</div>}
      </div>
    </header>
  );
}

export function PageBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("space-y-5 px-5 pb-8 pt-4", className)}>{children}</div>;
}
