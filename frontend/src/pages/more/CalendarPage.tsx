import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { CalendarPlus, Check, ChevronRight, Clock } from "lucide-react";
import type { CalendarEvent } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { IconButton, Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { SelectField, TextField } from "@/components/common/Form";
import { useData, useUI } from "@/hooks/useApp";
import { DEMO_TODAY } from "@/data/merchant";
import { shiftDate } from "@/data/analytics";
import { dayName, formatDayDate, parseISODate } from "@/utils/format";
import { cn } from "@/utils/cn";

const CATEGORY_TONE: Record<CalendarEvent["category"], string> = {
  Finance: "bg-sky-50 text-sky-700",
  Operations: "bg-navy-50 text-navy-600",
  Campaign: "bg-[#F1EDFD] text-[#6D4FC9]",
  Staff: "bg-success-soft text-success-dark",
  Growth: "bg-gold-50 text-gold-800",
};

export default function CalendarPage() {
  const { events, addEvent, toggleEvent } = useData();
  const { toast } = useUI();
  const [selected, setSelected] = useState<string | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState({ title: "", date: DEMO_TODAY, time: "", category: "Operations" as CalendarEvent["category"], note: "" });

  const days = useMemo(() => Array.from({ length: 14 }, (_, i) => shiftDate(DEMO_TODAY, i)), []);
  const sorted = useMemo(() => [...events].filter((e) => e.date >= DEMO_TODAY).sort((a, b) => (a.date + (a.time ?? "")).localeCompare(b.date + (b.time ?? ""))), [events]);
  const visible = selected ? sorted.filter((e) => e.date === selected) : sorted;
  const grouped = useMemo(() => {
    const map = new Map<string, CalendarEvent[]>();
    visible.forEach((e) => map.set(e.date, [...(map.get(e.date) ?? []), e]));
    return [...map.entries()];
  }, [visible]);

  return (
    <>
      <TopAppBar
        title="Business Calendar"
        subtitle="Upcoming payments, campaigns and reviews"
        right={
          <IconButton label="Add agenda" onClick={() => setFormOpen(true)}>
            <CalendarPlus className="h-5 w-5" />
          </IconButton>
        }
      />
      <PageBody>
        <div className="no-scrollbar -mx-5 flex gap-2 overflow-x-auto px-5">
          {days.map((d) => {
            const count = events.filter((e) => e.date === d && !e.done).length;
            const active = selected === d;
            return (
              <button
                key={d}
                type="button"
                onClick={() => setSelected(active ? null : d)}
                aria-pressed={active}
                className={cn(
                  "flex w-14 shrink-0 flex-col items-center rounded-2xl border py-2.5 transition",
                  active ? "border-navy bg-navy text-white" : d === DEMO_TODAY ? "border-gold bg-gold-50" : "border-surface-line bg-white",
                )}
              >
                <span className={cn("text-[11px] font-semibold", active ? "text-white/85" : "text-ink-muted")}>{dayName(d)}</span>
                <span className="text-[17px] font-extrabold">{parseISODate(d).getDate()}</span>
                <span className={cn("mt-0.5 h-1.5 w-1.5 rounded-full", count ? (active ? "bg-gold" : "bg-navy") : "bg-transparent")} />
              </button>
            );
          })}
        </div>

        {grouped.length ? (
          grouped.map(([date, list]) => (
            <section key={date}>
              <h2 className="mb-2 px-1 text-[12.5px] font-bold text-ink-muted">{date === DEMO_TODAY ? "Today" : formatDayDate(date)}</h2>
              <div className="card divide-y divide-surface-line overflow-hidden">
                {list.map((e) => (
                  <div key={e.id} className="flex items-center gap-3 px-4 py-3">
                    <button
                      type="button"
                      onClick={() => {
                        toggleEvent(e.id);
                        toast(e.done ? `${e.title} reopened` : `${e.title} marked done`);
                      }}
                      aria-pressed={!!e.done}
                      aria-label={e.done ? "Mark as not done" : "Mark as done"}
                      className={cn("flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2", e.done ? "border-success bg-success text-white" : "border-navy-200")}
                    >
                      {e.done && <Check className="h-3.5 w-3.5" strokeWidth={3} />}
                    </button>
                    <div className="min-w-0 flex-1">
                      <p className={cn("text-[14px] font-semibold", e.done ? "text-ink-faint line-through" : "text-ink")}>{e.title}</p>
                      <p className="flex flex-wrap items-center gap-x-2 text-[12px] text-ink-muted">
                        <span className={cn("rounded-full px-1.5 text-[10.5px] font-bold", CATEGORY_TONE[e.category])}>{e.category}</span>
                        {e.time && (
                          <span className="inline-flex items-center gap-0.5">
                            <Clock className="h-3 w-3" /> {e.time}
                          </span>
                        )}
                        {e.note && <span className="truncate">{e.note}</span>}
                      </p>
                    </div>
                    {e.link && (
                      <Link to={e.link} aria-label={`Open ${e.title}`} className="rounded-full p-1.5 text-ink-faint hover:bg-surface">
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </section>
          ))
        ) : (
          <p className="rounded-2xl bg-white p-6 text-center text-[13px] text-ink-muted ring-1 ring-surface-line">Nothing scheduled for this day.</p>
        )}
      </PageBody>

      <BottomSheet
        open={formOpen}
        onClose={() => setFormOpen(false)}
        title="Add agenda"
        footer={
          <Button
            block
            size="lg"
            disabled={form.title.trim().length < 3 || form.date < DEMO_TODAY}
            onClick={() => {
              addEvent({ title: form.title.trim(), date: form.date, time: form.time || undefined, category: form.category, note: form.note.trim() || undefined });
              toast("Agenda added");
              setForm({ title: "", date: DEMO_TODAY, time: "", category: "Operations", note: "" });
              setFormOpen(false);
            }}
          >
            Save agenda
          </Button>
        }
      >
        <div className="space-y-3">
          <TextField label="Title" placeholder="e.g. Meet coffee supplier" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} maxLength={40} />
          <div className="grid grid-cols-2 gap-3">
            <TextField label="Date" type="date" min={DEMO_TODAY} value={form.date} onChange={(e) => setForm({ ...form, date: e.target.value || DEMO_TODAY })} />
            <TextField label="Time" type="time" value={form.time} onChange={(e) => setForm({ ...form, time: e.target.value })} />
          </div>
          <SelectField
            label="Category"
            value={form.category}
            onChange={(e) => setForm({ ...form, category: e.target.value as CalendarEvent["category"] })}
            options={(["Finance", "Operations", "Campaign", "Staff", "Growth"] as const).map((c) => ({ value: c, label: c }))}
          />
          <TextField label="Note" placeholder="Optional" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} maxLength={60} />
        </div>
      </BottomSheet>
    </>
  );
}
