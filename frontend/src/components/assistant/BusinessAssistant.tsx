import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowRight, MessageSquareText, Sparkles } from "lucide-react";
import { BottomSheet } from "@/components/common/Overlay";
import { useData } from "@/hooks/useApp";
import { formatStock, useGrowth, useInventoryAlerts, useMonthStats, useNextActions, useTodayStats } from "@/hooks/useBusiness";
import { completedSales, productPerformance, rangeStart } from "@/data/analytics";
import { formatCompactRupiah, formatPercent, formatRupiah } from "@/utils/format";

interface Answer {
  text: string[];
  link?: { label: string; to: string };
}

const QUESTIONS = [
  "How is my business doing?",
  "What should I improve?",
  "Which product sells best?",
  "Do I need to restock?",
  "How close am I to financing readiness?",
] as const;

/**
 * A shortcut-based assistant that answers from the merchant's own recorded data.
 * It does not generate free-form advice or make banking decisions.
 */
export function BusinessAssistant({ open, onClose }: { open: boolean; onClose: () => void }) {
  // Mount the data-heavy content only while the sheet is open.
  return open ? <AssistantContent onClose={onClose} /> : null;
}

function AssistantContent({ onClose }: { onClose: () => void }) {
  const navigate = useNavigate();
  const { transactions, products } = useData();
  const today = useTodayStats();
  const month = useMonthStats();
  const growth = useGrowth();
  const inventory = useInventoryAlerts();
  const actions = useNextActions();
  const [thread, setThread] = useState<{ q: string; a: Answer }[]>([]);
  const [thinking, setThinking] = useState<string | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [thread, thinking]);

  const answers = useMemo<Record<(typeof QUESTIONS)[number], Answer>>(() => {
    const top = productPerformance(completedSales(transactions, rangeStart(30)), (id) => products.find((p) => p.id === id)?.costPrice)[0];
    return {
      "How is my business doing?": {
        text: [
          `Today you have recorded ${formatRupiah(today.revenue)} from ${today.count} transactions, ${formatPercent(today.change, 1, true)} compared with yesterday.`,
          `Over the last 30 days revenue is ${formatCompactRupiah(month.revenue)}, ${formatPercent(month.growth, 1, true)} versus the previous 30 days.`,
          `Your Growth Score is ${growth.score} (${growth.status}), in the ${growth.stage.id} stage.`,
        ],
        link: { label: "Open Business Analytics", to: "/reports" },
      },
      "What should I improve?": {
        text: actions.length
          ? actions.slice(0, 3).map((a, i) => `${i + 1}. ${a.title} (${a.priority}). ${a.why}`)
          : ["Everything looks on track. Keep recording every sale to strengthen your Growth Score."],
        link: { label: "See Next Best Actions", to: "/growth" },
      },
      "Which product sells best?": {
        text: top
          ? [
              `${top.name} is your best seller in the last 30 days with ${top.qty} sold and ${formatCompactRupiah(top.revenue)} revenue.`,
              `Its estimated margin is ${top.margin.toFixed(0)}%.`,
            ]
          : ["There is not enough sales data yet."],
        link: { label: "View product performance", to: "/reports?section=product" },
      },
      "Do I need to restock?": {
        text: inventory.low.length
          ? [
              `${inventory.low.length} item${inventory.low.length > 1 ? "s are" : " is"} at or below the reorder level:`,
              ...inventory.low.slice(0, 4).map(
                (i) => `${i.name}: ${formatStock(i.stock)} ${i.unit} left, reorder at ${i.reorderLevel}.`,
              ),
            ]
          : ["All items are above their reorder level."],
        link: { label: "Open Restock Recommendation", to: "/inventory?tab=low" },
      },
      "How close am I to financing readiness?": {
        text: [
          `Your Financing Readiness is ${growth.readiness}% (${growth.readinessStatus}).`,
          growth.strengthen.length ? `To strengthen it: ${growth.strengthen[0].label.toLowerCase()}.` : "Your profile is in strong shape.",
          "This is an indicative measure. Final eligibility follows Bank Mandiri's assessment.",
        ],
        link: { label: "View Financing Readiness", to: "/growth/readiness" },
      },
    };
  }, [transactions, products, today, month, growth, inventory.low, actions]);

  useEffect(() => {
    if (!thinking) return;
    const timer = window.setTimeout(() => {
      setThread((prev) => [...prev, { q: thinking, a: answers[thinking as (typeof QUESTIONS)[number]] }]);
      setThinking(null);
    }, 650);
    return () => window.clearTimeout(timer);
  }, [thinking, answers]);

  const ask = (q: (typeof QUESTIONS)[number]) => {
    if (!thinking) setThinking(q);
  };

  return (
    <BottomSheet open onClose={onClose} title="Business Assistant" subtitle="Quick answers from your recorded business data">
      {thread.length === 0 && (
        <div className="mb-4 flex items-start gap-3 rounded-2xl bg-navy-50 p-4">
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-navy text-white">
            <Sparkles className="h-4 w-4" />
          </span>
          <p className="text-[13px] leading-relaxed text-ink-soft">
            Choose a question below. Answers are calculated from your transactions, stock and growth data. They are guidance, not banking decisions.
          </p>
        </div>
      )}

      <div className="space-y-4">
        {thread.map((item, i) => (
          <div key={i} className="space-y-2">
            <div className="ml-auto w-fit max-w-[85%] rounded-2xl rounded-br-md bg-navy px-3.5 py-2.5 text-[13px] font-medium text-white">
              {item.q}
            </div>
            <div className="max-w-[92%] animate-fade-in rounded-2xl rounded-bl-md border border-surface-line bg-white px-3.5 py-3 text-[13px] leading-relaxed text-ink-soft shadow-card">
              {item.a.text.map((line, k) => (
                <p key={k} className={k ? "mt-1.5" : ""}>
                  {line}
                </p>
              ))}
              {item.a.link && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    navigate(item.a.link!.to);
                  }}
                  className="mt-2.5 inline-flex items-center gap-1 text-[13px] font-semibold text-sky-600"
                >
                  {item.a.link.label}
                  <ArrowRight className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        ))}
        {thinking && (
          <div className="space-y-2">
            <div className="ml-auto w-fit max-w-[85%] animate-pop-in rounded-2xl rounded-br-md bg-navy px-3.5 py-2.5 text-[13px] font-medium text-white">
              {thinking}
            </div>
            <div className="flex w-fit items-center gap-1 rounded-2xl rounded-bl-md border border-surface-line bg-white px-4 py-3.5 shadow-card" aria-label="Checking your data">
              {[0, 150, 300].map((d) => (
                <span key={d} className="h-1.5 w-1.5 animate-bounce rounded-full bg-navy-300" style={{ animationDelay: `${d}ms` }} />
              ))}
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      <div className="mt-5">
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-ink-faint">Ask about</p>
        <div className="flex flex-wrap gap-2">
          {QUESTIONS.map((q) => (
            <button
              key={q}
              type="button"
              onClick={() => ask(q)}
              disabled={thinking !== null}
              className="disabled:opacity-60 inline-flex min-h-[40px] items-center gap-1.5 rounded-full border border-navy-100 bg-white px-3.5 text-left text-[13px] font-semibold text-navy-600 transition hover:border-navy-300 hover:bg-navy-50 active:scale-[0.98]"
            >
              <MessageSquareText className="h-3.5 w-3.5 shrink-0 text-sky-600" />
              {q}
            </button>
          ))}
        </div>
      </div>
    </BottomSheet>
  );
}
