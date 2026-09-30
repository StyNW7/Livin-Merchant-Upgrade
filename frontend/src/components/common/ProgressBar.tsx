import type { ReactNode } from "react";
import { cn } from "@/utils/cn";
import { useMounted } from "@/hooks/useCountUp";

interface ProgressBarProps {
  value: number;
  max?: number;
  tone?: "navy" | "gold" | "sky" | "success" | "warning" | "white";
  size?: "xs" | "sm" | "md";
  className?: string;
  label?: string;
  /** Optional marker (e.g. a target) drawn on the track, in the same unit as value. */
  marker?: number;
}

const fills = {
  navy: "bg-navy",
  gold: "bg-gold",
  sky: "bg-sky",
  success: "bg-success",
  warning: "bg-warning",
  white: "bg-white",
};

const heights = { xs: "h-1", sm: "h-1.5", md: "h-2.5" };

export function ProgressBar({ value, max = 100, tone = "navy", size = "sm", className, label, marker }: ProgressBarProps) {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  const mounted = useMounted();
  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={Math.round(value)}
      aria-label={label}
      className={cn(
        "relative w-full overflow-hidden rounded-full",
        tone === "white" ? "bg-white/20" : "bg-navy-50",
        heights[size],
        className,
      )}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-700 ease-out", fills[tone])}
        style={{ width: `${mounted ? pct : 0}%` }}
      />
      {marker !== undefined && (
        <span
          className="absolute top-0 h-full w-0.5 bg-ink/40"
          style={{ left: `${Math.min(100, (marker / max) * 100)}%` }}
          aria-hidden
        />
      )}
    </div>
  );
}

interface RingProps {
  value: number;
  size?: number;
  stroke?: number;
  tone?: string;
  track?: string;
  children?: ReactNode;
  label?: string;
}

/** Small circular progress for cards and list rows. */
export function ProgressRing({ value, size = 56, stroke = 6, tone = "#5192F6", track = "#F0F6FF", children, label }: RingProps) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const pct = Math.max(0, Math.min(100, value));
  const mounted = useMounted();
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }} role="img" aria-label={label ?? `${pct}%`}>
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={track} strokeWidth={stroke} />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={tone}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={c - ((mounted ? pct : 0) / 100) * c}
          style={{ transition: "stroke-dashoffset 800ms ease-out" }}
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">{children}</div>
    </div>
  );
}
