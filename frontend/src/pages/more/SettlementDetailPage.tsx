import { Link, useParams } from "react-router-dom";
import { CheckCircle2, FileSearch, Scale } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { useData, useSession } from "@/hooks/useApp";
import { useSettlements } from "@/hooks/useBusiness";
import { isCountedSale, netAmount } from "@/data/analytics";
import { outletArea } from "@/data/outlets";
import { formatDate, formatRupiah } from "@/utils/format";

export default function SettlementDetailPage() {
  const { id } = useParams();
  const settlements = useSettlements();
  const { allTransactions } = useData();
  const { merchant } = useSession();
  const s = settlements.find((x) => x.id === id);

  if (!s) {
    return (
      <>
        <TopAppBar title="Settlement" backTo="/settlement" />
        <EmptyState icon={FileSearch} title="Settlement not found" message="Settlements older than 90 days are available in your monthly statement." />
      </>
    );
  }

  // Reconciliation: recompute recorded non-cash sales for the sales date and compare with settled gross.
  const recon = s.breakdown.map((b) => {
    const recorded = (allTransactions[b.outletId] ?? []).filter((t) => t.date === s.salesDate && isCountedSale(t) && t.method !== "Cash");
    const recordedGross = recorded.reduce((sum, t) => sum + netAmount(t), 0);
    return { ...b, recordedGross, recordedCount: recorded.length, matched: recordedGross === b.gross };
  });
  const allMatched = recon.every((r) => r.matched);

  return (
    <>
      <TopAppBar title="Settlement detail" subtitle={s.id} backTo="/settlement" />
      <PageBody>
        <section className="card flex flex-col items-center p-5 text-center">
          <p className="text-[12px] text-ink-muted">{s.status === "Scheduled" ? "Estimated net settlement" : "Net settled"}</p>
          <p className="tabular text-[30px] font-extrabold text-ink">{formatRupiah(s.net)}</p>
          <StatusBadge status={s.status} className="mt-1" />
        </section>

        <section className="card px-4 py-2">
          <InfoRow label="Settlement date" value={`${formatDate(s.date)}, ${s.time}`} />
          <InfoRow label="Sales date" value={formatDate(s.salesDate)} />
          <InfoRow label="Destination" value={`Mandiri Business Account ${merchant.accountNumber.replace("Mandiri Business ", "")}`} />
          <InfoRow label="Non-cash transactions" value={String(s.transactions)} />
          <InfoRow label="Gross sales" value={formatRupiah(s.gross)} />
          <InfoRow label="Merchant discount rate" value={`-${formatRupiah(s.fee)}`} />
          <InfoRow label="Net amount" value={formatRupiah(s.net)} strong />
        </section>

        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <Scale className="h-4 w-4 text-navy-600" /> Transaction reconciliation
          </h2>
          <p className="mt-1 text-[12.5px] text-ink-muted">Recorded non-cash sales compared with the settled amount, per outlet.</p>
          <div className="mt-3 space-y-3">
            {recon.map((r) => (
              <div key={r.outletId} className="rounded-2xl bg-surface p-3">
                <div className="flex items-center justify-between">
                  <p className="text-[13.5px] font-bold text-ink">{outletArea(r.outletId)}</p>
                  {r.matched && <span className="inline-flex items-center gap-1 text-[12px] font-bold text-success-dark"><CheckCircle2 className="h-4 w-4" /> Matched</span>}
                </div>
                <InfoRow label="Recorded sales" value={`${formatRupiah(r.recordedGross)} · ${r.recordedCount} trx`} />
                <InfoRow label="Settled gross" value={formatRupiah(r.gross)} />
                <InfoRow label="Fee" value={`-${formatRupiah(r.fee)}`} />
                <InfoRow label="Net" value={formatRupiah(r.net)} strong />
              </div>
            ))}
          </div>
          <p className={`mt-3 rounded-xl px-3 py-2 text-[12.5px] font-semibold ${allMatched ? "bg-success-soft text-success-dark" : "bg-warning-soft text-warning-dark"}`}>
            {allMatched ? "All recorded non-cash sales are included in this settlement." : "Some sales changed after settlement (for example a refund). The difference is adjusted in the next settlement."}
          </p>
        </section>

        <Link to="/transactions" className="block text-center text-[13px] font-semibold text-sky-600">
          View transactions
        </Link>
      </PageBody>
    </>
  );
}
