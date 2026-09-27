import type { ReactNode } from "react";
import { Lightbulb } from "lucide-react";
import { cn } from "@/utils/cn";

/**
 * Every chart answers one question and carries a plain-language interpretation underneath.
 */
export function ChartCard({
  question,
  title,
  right,
  insight,
  children,
  className,
  legend,
}: {
  question?: string;
  title: string;
  right?: ReactNode;
  insight?: ReactNode;
  children: ReactNode;
  className?: string;
  legend?: { label: string; color: string; dashed?: boolean }[];
}) {
  return (
    <section className={cn("card p-4", className)}>
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          {question && <p className="text-[11.5px] font-semibold text-sky-600">{question}</p>}
          <h3 className="text-[15px] font-bold text-ink">{title}</h3>
        </div>
        {right}
      </div>
      {legend && (
        <div className="mb-2 flex flex-wrap gap-x-4 gap-y-1">
          {legend.map((l) => (
            <span key={l.label} className="inline-flex items-center gap-1.5 text-[11.5px] font-medium text-ink-soft">
              <span
                className="h-2 w-3.5 rounded-full"
                style={
                  l.dashed
                    ? { backgroundImage: `repeating-linear-gradient(90deg, ${l.color} 0 4px, transparent 4px 7px)` }
                    : { backgroundColor: l.color }
                }
              />
              {l.label}
            </span>
          ))}
        </div>
      )}
      <div className="-mx-1">{children}</div>
      {insight && (
        <div className="mt-3 flex gap-2 rounded-xl bg-surface px-3 py-2.5">
          <Lightbulb className="mt-0.5 h-4 w-4 shrink-0 text-gold-600" />
          <p className="text-[12.5px] leading-relaxed text-ink-soft">{insight}</p>
        </div>
      )}
    </section>
  );
}

interface TooltipEntry {
  name?: unknown;
  value?: unknown;
  color?: string;
  dataKey?: unknown;
  payload?: unknown;
}

/** Clean tooltip used by all Recharts charts. */
export function ChartTooltip({
  active,
  payload,
  label,
  format,
  labels,
}: {
  active?: boolean;
  payload?: readonly TooltipEntry[];
  label?: string | number;
  format: (value: number) => string;
  labels?: Record<string, string>;
}) {
  if (!active || !payload?.length) return null;
  const rows = payload.filter((p) => p.value !== null && p.value !== undefined);
  if (!rows.length) return null;
  return (
    <div className="rounded-xl border border-surface-line bg-white px-3 py-2 shadow-float">
      {label !== undefined && label !== "" && <p className="mb-1 text-[11px] font-semibold text-ink-muted">{label}</p>}
      {rows.map((p, i) => (
        <p key={i} className="flex items-center gap-2 text-[12.5px] font-bold text-ink">
          <span className="h-2 w-2 rounded-full" style={{ backgroundColor: p.color }} />
          {labels?.[String(p.dataKey)] ?? (labels ? String(p.name ?? "") : "")}
          <span className="tabular">{format(Number(p.value))}</span>
        </p>
      ))}
    </div>
  );
}

export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "#6B7788" },
} as const;

export const gridProps = {
  stroke: "#EEF1F5",
  strokeDasharray: "0",
  vertical: false,
} as const;
