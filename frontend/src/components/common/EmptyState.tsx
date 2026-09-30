import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/utils/cn";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  message: string;
  action?: ReactNode;
  className?: string;
}

/**
 * Premium empty state: a layered hexagon motif (a quiet nod to the BEE strategy)
 * holding a Lucide icon, instead of a cartoon illustration.
 */
export function EmptyState({ icon: Icon, title, message, action, className }: EmptyStateProps) {
  return (
    <div className={cn("flex flex-col items-center px-6 py-10 text-center", className)}>
      <div className="relative mb-5 h-24 w-24">
        <svg viewBox="0 0 96 96" className="absolute inset-0 h-full w-full" aria-hidden>
          <path d="M48 4 86 26v44L48 92 10 70V26z" fill="#FFF7E0" />
          <path d="M48 16 76 32v32L48 80 20 64V32z" fill="#FFFFFF" stroke="#FFE499" strokeWidth="1.5" />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center">
          <Icon className="h-9 w-9 text-navy-600" strokeWidth={1.6} />
        </div>
        <span className="absolute -right-1 top-3 h-3 w-3 rounded-full bg-gold" aria-hidden />
        <span className="absolute -left-0.5 bottom-5 h-2 w-2 rounded-full bg-sky" aria-hidden />
      </div>
      <h3 className="text-base font-bold text-ink">{title}</h3>
      <p className="mt-1.5 max-w-[260px] text-[13px] leading-relaxed text-ink-muted">{message}</p>
      {action && <div className="mt-5">{action}</div>}
    </div>
  );
}
