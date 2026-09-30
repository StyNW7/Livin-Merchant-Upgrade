import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Trophy } from "lucide-react";
import { Modal } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useCountUp } from "@/hooks/useCountUp";
import { growthStages } from "@/data/growth";

export interface Celebration {
  missionTitle: string;
  points: number;
  from: number;
  to: number;
}

const stageFor = (score: number) => [...growthStages].reverse().find((s) => score >= s.min) ?? growthStages[0];

/** Shown when a merchant claims a completed Growth Mission: the score visibly moves. */
export function MissionCelebration({ celebration, onClose }: { celebration: Celebration | null; onClose: () => void }) {
  return (
    <Modal open={celebration !== null} onClose={onClose} labelledBy="celebration-title" className="overflow-hidden p-0">
      {celebration && <Content celebration={celebration} onClose={onClose} />}
    </Modal>
  );
}

function Content({ celebration: c, onClose }: { celebration: Celebration; onClose: () => void }) {
  const navigate = useNavigate();
  const score = Math.round(useCountUp(c.to, { from: c.from, duration: 1400 }));
  const before = stageFor(c.from);
  const after = stageFor(c.to);
  const next = growthStages[growthStages.indexOf(after) + 1];
  const stageUp = before.id !== after.id;
  const progress = next ? ((c.to - after.min) / (next.min - after.min)) * 100 : 100;

  return (
    <>
      <div className="hero-navy relative px-6 pb-6 pt-8 text-center text-white">
        <span className="relative mx-auto flex h-16 w-16 items-center justify-center">
          <span className="absolute inset-0 animate-ring-pulse rounded-full bg-gold/40" aria-hidden />
          <span className="relative flex h-16 w-16 animate-pop-in items-center justify-center rounded-full bg-gold text-navy-900 shadow-glow">
            <Trophy className="h-8 w-8" />
          </span>
        </span>
        <p className="mt-4 inline-block rounded-full bg-gold px-3 py-1 text-[11.5px] font-extrabold uppercase tracking-wide text-navy-900">Mission completed</p>
        <h2 id="celebration-title" className="mt-1 text-[17px] font-extrabold leading-snug">
          {c.missionTitle}
        </h2>
        <div className="mt-5 flex items-end justify-center gap-3">
          <span className="tabular text-[20px] font-bold text-white/80 line-through decoration-white/30">{c.from}</span>
          <ArrowRight className="mb-2 h-4 w-4 text-white/80" />
          <span className="tabular text-[52px] font-extrabold leading-none">{score}</span>
          <span className="mb-1.5 rounded-full bg-white/25 px-2 py-0.5 text-[12px] font-extrabold text-white">+{c.points}</span>
        </div>
        <p className="mt-1 text-[12px] text-white/85">Business Growth Score</p>
      </div>
      <div className="p-5">
        {stageUp ? (
          <p className="flex items-center gap-2 rounded-2xl bg-gold-50 px-3 py-2.5 text-[13px] font-semibold text-ink">
            <Sparkles className="h-4 w-4 shrink-0 text-gold-600" />
            You reached the {after.id} stage.
          </p>
        ) : next ? (
          <div>
            <div className="flex justify-between text-[12px]">
              <span className="font-bold text-navy-600">{after.id}</span>
              <span className="text-ink-muted">
                {next.min - c.to} points to <span className="font-bold text-ink">{next.id}</span>
              </span>
            </div>
            <ProgressBar value={progress} tone="gold" size="md" className="mt-1.5" label="Progress to next stage" />
          </div>
        ) : null}
        <div className="mt-5 space-y-2.5">
          <Button block onClick={onClose}>
            Keep growing
          </Button>
          <Button
            block
            variant="ghost"
            onClick={() => {
              onClose();
              navigate("/growth/score");
            }}
          >
            See score breakdown
          </Button>
        </div>
      </div>
    </>
  );
}
