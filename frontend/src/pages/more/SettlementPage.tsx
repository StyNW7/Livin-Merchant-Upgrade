import { Link } from "react-router-dom";
import { Building2, CalendarClock, CheckCircle2, ChevronRight, Clock } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { SectionHeader } from "@/components/common/SectionHeader";
import { ChartCard } from "@/components/charts/ChartKit";
import { SimpleBars } from "@/components/charts/Charts";
import { useSession } from "@/hooks/useApp";
import { useSettlements } from "@/hooks/useBusiness";
import { DEMO_TODAY } from "@/data/merchant";
import { formatCompactRupiah, formatDate, formatRupiah, formatShortDate } from "@/utils/format";

export default function SettlementPage() {
  const settlements = useSettlements();
  const { merchant } = useSession();
  const scheduled = settlements.find((s) => s.status === "Scheduled");
  const today = settlements.find((s) => s.date === DEMO_TODAY);
  const history = settlements.filter((s) => s.status !== "Scheduled");
  const last14 = history.slice(0, 14).reverse();
  const avg = last14.reduce((s, x) => s + x.net, 0) / (last14.length || 1);

  return (
    <>
      <TopAppBar title="Settlement Center" subtitle="Non-cash sales sent to your business account" backTo="/more" />
      <PageBody>
        {today && (
          <Link to={`/settlement/${today.id}`} className="hero-navy block rounded-[28px] p-5 text-white shadow-float">
            <div className="flex items-center justify-between">
              <p className="text-[12.5px] font-semibold text-white/85">Today’s Settlement</p>
              <span className="inline-flex items-center gap-1 rounded-full bg-white/20 px-2.5 py-1 text-[11.5px] font-bold text-white">
                <CheckCircle2 className="h-3.5 w-3.5" /> {today.status}
              </span>
            </div>
            <p className="tabular mt-2 text-[30px] font-extrabold">{formatRupiah(today.net)}</p>
            <div className="mt-3 flex items-center gap-2 text-[12.5px] text-white/85">
              <Building2 className="h-4 w-4 text-gold-200" /> Mandiri Business Account · {merchant.accountNumber}
            </div>
            <p className="mt-1 text-[12px] text-white/80">
              Credited at {today.time} · sales of {formatShortDate(today.salesDate)} · {today.transactions} transactions
            </p>
          </Link>
        )}

        {scheduled && (
          <Link to={`/settlement/${scheduled.id}`} className="card flex items-center gap-3 p-4 transition hover:shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-sky-50 text-sky-600">
              <CalendarClock className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-[12px] text-ink-muted">Next settlement · estimated</p>
              <p className="tabular text-[16px] font-extrabold text-ink">{formatRupiah(scheduled.net)}</p>
              <p className="text-[12px] text-ink-muted">
                {formatDate(scheduled.date)} at {scheduled.time} · grows with today’s non-cash sales
              </p>
            </div>
            <ChevronRight className="h-5 w-5 text-ink-faint" />
          </Link>
        )}

        <ChartCard question="How steady are my settlements?" title="Last 14 settlements" insight={`Average settlement is ${formatRupiah(Math.round(avg))} per day.`}>
          <SimpleBars
            data={last14.map((s) => ({ label: formatShortDate(s.date).split(" ")[0], value: s.net, highlight: s.date === DEMO_TODAY }))}
            xKey="label"
            yKey="value"
            format={formatRupiah}
            highlightKey="highlight"
            height={160}
          />
        </ChartCard>

        <section>
          <SectionHeader title="Settlement history" subtitle="All outlets, consolidated" />
          <div className="card divide-y divide-surface-line overflow-hidden">
            {history.slice(0, 30).map((s) => (
              <Link key={s.id} to={`/settlement/${s.id}`} className="flex items-center gap-3 px-4 py-3 hover:bg-surface/70">
                <span className="flex h-10 w-10 flex-col items-center justify-center rounded-xl bg-navy-50 text-navy-600">
                  <span className="text-[13px] font-extrabold leading-none">{Number(s.date.slice(8))}</span>
                  <span className="text-[9.5px] font-semibold uppercase">{formatShortDate(s.date).split(" ")[1]}</span>
                </span>
                <span className="min-w-0 flex-1">
                  <span className="tabular block text-[14px] font-bold text-ink">{formatRupiah(s.net)}</span>
                  <span className="block text-[12px] text-ink-muted">
                    {s.transactions} transactions · fee {formatCompactRupiah(s.fee)}
                  </span>
                </span>
                <StatusBadge status={s.status} />
              </Link>
            ))}
          </div>
        </section>

        <p className="flex items-start gap-2 text-[12px] leading-relaxed text-ink-muted">
          <Clock className="mt-0.5 h-4 w-4 shrink-0" />
          Estimated settlement time: every day at 06:15 for the previous day’s QRIS, debit, credit and transfer sales. Cash sales are not settled.
        </p>
      </PageBody>
    </>
  );
}
