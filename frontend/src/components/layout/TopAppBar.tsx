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
        tone === "light" ? "border-b border-surface-line/70 bg-surface/90 backdrop-blur-md" : "bg-navy text-white",
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
              "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition active:scale-95",
              tone === "light" ? "text-navy hover:bg-navy-50" : "text-white hover:bg-white/10",
            )}
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        <div className={cn("min-w-0 flex-1", hideBack && "pl-2")}>
          <h1 className={cn("truncate text-[18px] font-bold tracking-tight", tone === "light" ? "text-ink" : "text-white")}>{title}</h1>
          {subtitle && (
            <p className={cn("truncate text-[12px]", tone === "light" ? "text-ink-muted" : "text-white/70")}>{subtitle}</p>
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
    <header className="sticky top-0 z-20 border-b border-transparent bg-surface/90 px-5 pb-3 pt-3 backdrop-blur-md">
      <div className="flex items-center justify-between gap-3">
        <div className="min-w-0">
          <h1 className="truncate text-[23px] font-extrabold tracking-tight text-ink">{title}</h1>
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
