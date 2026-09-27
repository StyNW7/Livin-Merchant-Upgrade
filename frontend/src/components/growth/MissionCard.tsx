import { useState } from "react";
import { Link } from "react-router-dom";
import {
  CalendarDays,
  ChevronDown,
  Sparkles,
  Trophy,
} from "lucide-react";
import type { GrowthMission } from "@/types";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { Button } from "@/components/common/Button";
import { missionCategoryMeta } from "@/data/growth";
import { cn } from "@/utils/cn";
import { formatProgress } from "@/utils/format";
import { missionIcons } from "@/components/icons";

interface MissionCardProps {
  mission: GrowthMission;
  claimed?: boolean;
  onClaim?: () => void;
  defaultOpen?: boolean;
  compact?: boolean;
}

export function MissionCard({ mission: m, claimed, onClaim, defaultOpen, compact }: MissionCardProps) {
  const [open, setOpen] = useState(!!defaultOpen);
  const Icon = missionIcons[m.category];
  const meta = missionCategoryMeta[m.category];
  const done = m.status === "Completed";

  return (
    <article className={cn("card overflow-hidden", done && !claimed && "ring-2 ring-gold/60")}>
      <button type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open} className="flex w-full items-start gap-3 p-4 text-left">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ backgroundColor: meta.bg, color: meta.color }}>
          <Icon className="h-5 w-5" />
        </span>
        <span className="min-w-0 flex-1">
          <span className="flex items-center gap-2">
            <span className="text-[11px] font-bold uppercase tracking-wide" style={{ color: meta.color }}>
              {m.category}
            </span>
            <StatusBadge status={claimed ? "Completed" : m.status} className="text-[10px]" />
          </span>
          <span className="mt-1 block text-[14.5px] font-bold leading-snug text-ink">{m.title}</span>
          <span className="mt-2.5 flex items-center gap-2.5">
            <ProgressBar value={m.progress} tone={done ? "success" : "gold"} size="sm" label={`${m.title} progress`} />
            <span className="tabular w-12 shrink-0 text-right text-[13px] font-extrabold text-ink">{formatProgress(m.progress)}</span>
          </span>
          {!compact && (
            <span className="mt-1.5 flex items-center justify-between text-[12px] text-ink-muted">
              <span>
                {m.current} of {m.target}
              </span>
              <span className="inline-flex items-center gap-1">
                <CalendarDays className="h-3.5 w-3.5" />
                {m.deadline}
              </span>
            </span>
          )}
        </span>
        <ChevronDown className={cn("mt-1 h-5 w-5 shrink-0 text-ink-faint transition-transform", open && "rotate-180")} />
      </button>

      {open && (
        <div className="animate-fade-in space-y-3 border-t border-surface-line bg-surface/50 px-4 py-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">Why it matters</p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">{m.reason}</p>
          </div>
          <div className="flex items-center gap-2 rounded-xl bg-white px-3 py-2.5">
            <Sparkles className="h-4 w-4 shrink-0 text-gold-600" />
            <p className="text-[12.5px] text-ink-soft">
              <span className="font-bold text-ink">Estimated impact: </span>
              {m.impact} Up to +{m.impactPoints} Growth Score.
            </p>
          </div>
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wide text-ink-muted">How to complete</p>
            <ul className="mt-1.5 space-y-1.5">
              {m.steps.map((s) => (
                <li key={s} className="flex gap-2 text-[13px] text-ink-soft">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                  {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-2 pt-1">
            {done && !claimed && onClaim ? (
              <Button size="sm" variant="accent" leftIcon={<Trophy className="h-4 w-4" />} onClick={onClaim} className="flex-1">
                Claim +{m.impactPoints} points
              </Button>
            ) : done && claimed ? (
              <span className="inline-flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-success-soft py-2 text-[13px] font-semibold text-success-dark">
                <Trophy className="h-4 w-4" /> Impact added to your score
              </span>
            ) : null}
            {m.action && !done && (
              <Link
                to={m.action.to}
                className="inline-flex h-9 flex-1 items-center justify-center rounded-xl bg-navy px-3.5 text-[13px] font-semibold text-white hover:bg-navy-800"
              >
                {m.action.label}
              </Link>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

