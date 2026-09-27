import type { ReactNode } from "react";
import { CheckCircle2, CircleDashed, Clock3, Lock, RotateCcw, AlertTriangle, Sparkles } from "lucide-react";
import { cn } from "@/utils/cn";

export type BadgeTone = "success" | "warning" | "danger" | "info" | "neutral" | "gold" | "navy";

const tones: Record<BadgeTone, string> = {
  success: "bg-success-soft text-success-dark",
  warning: "bg-warning-soft text-warning-dark",
  danger: "bg-danger-soft text-danger-dark",
  info: "bg-sky-50 text-sky-700",
  neutral: "bg-surface text-ink-soft",
  gold: "bg-gold-100 text-gold-800",
  navy: "bg-navy text-white",
};

/** Maps domain statuses to a tone and an icon, so state never relies on color alone. */
const presets: Record<string, { tone: BadgeTone; icon: ReactNode }> = {
  Completed: { tone: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  Active: { tone: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  Verified: { tone: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  Strong: { tone: "success", icon: <CheckCircle2 className="h-3 w-3" /> },
  Good: { tone: "info", icon: <CheckCircle2 className="h-3 w-3" /> },
  "In Progress": { tone: "info", icon: <CircleDashed className="h-3 w-3" /> },
  Processing: { tone: "info", icon: <Clock3 className="h-3 w-3" /> },
  Scheduled: { tone: "info", icon: <Clock3 className="h-3 w-3" /> },
  Pending: { tone: "warning", icon: <Clock3 className="h-3 w-3" /> },
  Planned: { tone: "neutral", icon: <Clock3 className="h-3 w-3" /> },
  "Needs Improvement": { tone: "warning", icon: <AlertTriangle className="h-3 w-3" /> },
  "Almost Ready": { tone: "gold", icon: <Sparkles className="h-3 w-3" /> },
  Refunded: { tone: "danger", icon: <RotateCcw className="h-3 w-3" /> },
  Inactive: { tone: "neutral", icon: <Lock className="h-3 w-3" /> },
  Locked: { tone: "neutral", icon: <Lock className="h-3 w-3" /> },
  Ended: { tone: "neutral", icon: <CheckCircle2 className="h-3 w-3" /> },
  Draft: { tone: "neutral", icon: <CircleDashed className="h-3 w-3" /> },
  "Low stock": { tone: "warning", icon: <AlertTriangle className="h-3 w-3" /> },
  "Out of stock": { tone: "danger", icon: <AlertTriangle className="h-3 w-3" /> },
};

interface StatusBadgeProps {
  status: string;
  tone?: BadgeTone;
  icon?: ReactNode;
  className?: string;
  hideIcon?: boolean;
}

export function StatusBadge({ status, tone, icon, className, hideIcon }: StatusBadgeProps) {
  const preset = presets[status];
  const resolvedTone = tone ?? preset?.tone ?? "neutral";
  const resolvedIcon = icon ?? preset?.icon;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2 py-0.5 text-[11px] font-semibold",
        tones[resolvedTone],
        className,
      )}
    >
      {!hideIcon && resolvedIcon}
      {status}
    </span>
  );
}
