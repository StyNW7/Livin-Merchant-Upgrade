import { Check, Lock } from "lucide-react";
import type { GrowthStage, GrowthStageId } from "@/types";
import { growthStages } from "@/data/growth";
import { cn } from "@/utils/cn";
import { useCountUp, useMounted } from "@/hooks/useCountUp";

/** Semicircular Growth Score gauge drawn in SVG so it renders crisply at any size. */
export function ScoreGauge({ score, size = 220, tone = "dark", label = "Growth Score" }: { score: number; size?: number; tone?: "dark" | "light"; label?: string }) {
  const stroke = 16;
  const r = (size - stroke) / 2;
  const cx = size / 2;
  const cy = size / 2;
  const circumference = Math.PI * r;
  const pct = Math.max(0, Math.min(100, score)) / 100;
  const mounted = useMounted();
  const shown = Math.round(useCountUp(score, { duration: 1100 }));
  const arc = `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
  const markers = growthStages.slice(1).map((s) => {
    const angle = Math.PI * (1 - s.min / 100);
    return { id: s.id, x: cx + r * Math.cos(angle), y: cy - r * Math.sin(angle) };
  });
  return (
    <div className="relative mx-auto" style={{ width: size, height: size / 2 + 24 }} role="img" aria-label={`${label} ${score} out of 100`}>
      <svg width={size} height={size / 2 + stroke} viewBox={`0 0 ${size} ${size / 2 + stroke}`}>
        <defs>
          <linearGradient id="gauge-fill" x1="0" x2="1" y1="0" y2="0">
            <stop offset="0%" stopColor="#FFD466" />
            <stop offset="100%" stopColor="#FFB600" />
          </linearGradient>
        </defs>
        <path d={arc} fill="none" stroke={tone === "dark" ? "rgba(255,255,255,0.14)" : "#EEF3F9"} strokeWidth={stroke} strokeLinecap="round" />
        <path
          d={arc}
          fill="none"
          stroke="url(#gauge-fill)"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={circumference * (1 - (mounted ? pct : 0))}
          style={{ transition: "stroke-dashoffset 1100ms cubic-bezier(0.2,0.8,0.2,1)" }}
        />
        {markers.map((m) => (
          <circle key={m.id} cx={m.x} cy={m.y} r={3} fill={tone === "dark" ? "#002245" : "#FFFFFF"} opacity={0.9} />
        ))}
      </svg>
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center">
        <p className={cn("tabular text-[46px] font-extrabold leading-none tracking-tight", tone === "dark" ? "text-white" : "text-ink")}>
          {shown}
          <span className={cn("text-[18px] font-bold", tone === "dark" ? "text-white/60" : "text-ink-muted")}> / 100</span>
        </p>
      </div>
    </div>
  );
}

/** BUILD → GROW → SCALE → THRIVE, with done / active / locked states labelled in text. */
export function GrowthStageStepper({
  current,
  onSelect,
  selected,
  tone = "light",
}: {
  current: GrowthStageId;
  onSelect?: (stage: GrowthStage) => void;
  selected?: GrowthStageId;
  tone?: "light" | "dark";
}) {
  const currentIndex = growthStages.findIndex((s) => s.id === current);
  return (
    <ol className="flex items-start">
      {growthStages.map((stage, i) => {
        const state = i < currentIndex ? "done" : i === currentIndex ? "active" : "locked";
        return (
          <li key={stage.id} className="relative flex flex-1 flex-col items-center">
            {i > 0 && (
              <span
                className={cn(
                  "absolute right-1/2 top-[17px] h-[3px] w-full -translate-y-1/2 rounded-full",
                  i <= currentIndex ? "bg-gold" : tone === "dark" ? "bg-white/15" : "bg-navy-100",
                )}
                aria-hidden
              />
            )}
            <button
              type="button"
              onClick={() => onSelect?.(stage)}
              aria-label={`${stage.id}: ${state === "done" ? "completed" : state === "active" ? "current stage" : "locked"}`}
              className={cn(
                "relative z-10 flex h-[34px] w-[34px] items-center justify-center rounded-full border-2 transition-transform active:scale-90",
                state === "done" && "border-gold bg-gold text-navy-900",
                state === "active" && "border-gold bg-navy text-gold ring-4 ring-gold/25",
                state === "locked" && (tone === "dark" ? "border-white/20 bg-navy-900 text-white/50" : "border-navy-100 bg-white text-ink-faint"),
                selected === stage.id && "scale-110",
              )}
            >
              {state === "done" ? <Check className="h-4 w-4" strokeWidth={3} /> : state === "locked" ? <Lock className="h-3.5 w-3.5" /> : <span className="h-2.5 w-2.5 rounded-full bg-gold" />}
            </button>
            <span
              className={cn(
                "mt-1.5 text-[11px] font-extrabold tracking-wide",
                tone === "dark" ? (state === "locked" ? "text-white/45" : "text-white") : state === "locked" ? "text-ink-faint" : "text-navy",
              )}
            >
              {stage.id}
            </span>
            <span className={cn("text-[10px]", tone === "dark" ? "text-white/55" : "text-ink-muted")}>
              {state === "done" ? "Completed" : state === "active" ? "Current" : "Locked"}
            </span>
          </li>
        );
      })}
    </ol>
  );
}
