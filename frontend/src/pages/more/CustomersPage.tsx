import { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Gift, Lock, UserRound, Users } from "lucide-react";
import type { Customer } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { ChipRow, FilterChip } from "@/components/common/FilterChip";
import { SearchInput } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { MetricCard } from "@/components/cards/MetricCard";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { customerSummary } from "@/data/customers";
import { scenarios } from "@/data/scenarios";
import { formatCount, formatRupiah } from "@/utils/format";

const segmentTone = { Loyal: "gold", Regular: "info", New: "success", "At Risk": "warning" } as const;

export default function CustomersPage() {
  const [params] = useSearchParams();
  const { customers } = useData();
  const { scenario } = useSession();
  const { toast } = useUI();
  const [segment, setSegment] = useState<"All" | Customer["segment"]>("All");
  const [query, setQuery] = useState("");
  const [openId, setOpenId] = useState<string | null>(params.get("id"));
  const growth = scenarios[scenario].growth;

  useEffect(() => {
    if (params.get("id")) setOpenId(params.get("id"));
  }, [params]);

  const visible = useMemo(
    () =>
      customers.filter(
        (c) => (segment === "All" || c.segment === segment) && (!query.trim() || c.label.toLowerCase().includes(query.trim().toLowerCase())),
      ),
    [customers, segment, query],
  );
  const open = customers.find((c) => c.id === openId) ?? null;

  return (
    <>
      <TopAppBar title="Customers" subtitle="Anonymized customer intelligence">
        <ChipRow>
          {(["All", "Loyal", "Regular", "New", "At Risk"] as const).map((s) => (
            <FilterChip key={s} label={s} active={segment === s} onClick={() => setSegment(s)} />
          ))}
        </ChipRow>
      </TopAppBar>
      <div className="space-y-4 px-5 pb-8 pt-4">
        <section className="grid grid-cols-2 gap-3">
          <MetricCard icon={Users} label="Total Customers" value={formatCount(customerSummary.total + customers.length - 12)} />
          <MetricCard label="Returning" value={`${growth.returningRate}%`} hint={`from ${growth.previousReturningRate}% last month`} />
          <MetricCard label="New This Month" value={String(customerSummary.newThisMonth + customers.length - 12)} />
          <MetricCard label="Average Visits" value={customerSummary.averageVisits.toFixed(1)} hint="per customer" />
        </section>

        <p className="flex items-start gap-2 rounded-2xl bg-navy-50 px-3.5 py-3 text-[12px] leading-relaxed text-ink-soft">
          <Lock className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
          Customers are recognized by anonymized codes from QRIS and card payments. Names, phone numbers and bank details are never shown.
        </p>

        <SearchInput value={query} onChange={setQuery} placeholder="Search customer code" />

        {visible.length ? (
          <div className="card divide-y divide-surface-line overflow-hidden">
            {visible.map((c) => (
              <button key={c.id} type="button" onClick={() => setOpenId(c.id)} className="flex w-full items-center gap-3 px-4 py-3 text-left hover:bg-surface/70">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-navy-50 text-navy">
                  <UserRound className="h-5 w-5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-[14px] font-semibold text-ink">{c.label}</span>
                  <span className="block text-[12px] text-ink-muted">
                    {c.visits} visits · last {c.lastVisit.toLowerCase()}
                  </span>
                </span>
                <span className="text-right">
                  <span className="tabular block text-[13.5px] font-bold text-ink">{formatRupiah(c.totalSpending)}</span>
                  <StatusBadge status={c.segment} tone={segmentTone[c.segment]} hideIcon />
                </span>
              </button>
            ))}
          </div>
        ) : (
          <EmptyState icon={Users} title="No customers found" message="Customers appear after they pay with QRIS or card, or when you add them at checkout." />
        )}
      </div>

      <BottomSheet open={!!open} onClose={() => setOpenId(null)} title={open?.label ?? ""} subtitle={open ? `${open.segment} customer` : undefined}>
        {open && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <MetricCard label="Visits" value={String(open.visits)} tone="soft" />
              <MetricCard label="Total spending" value={formatRupiah(open.totalSpending)} tone="soft" />
            </div>
            <div className="card mt-3 px-4 py-2">
              <InfoRow label="Favorite item" value={open.favorite} />
              <InfoRow label="Last visit" value={open.lastVisit} />
              <InfoRow label="First visit" value={open.firstVisit} />
              <InfoRow label="Average spend" value={formatRupiah(open.averageSpend)} />
              <InfoRow label="Usually visits" value={open.preferredTime} />
            </div>
            <Button
              block
              className="mt-4"
              leftIcon={<Gift className="h-4 w-4" />}
              onClick={() => {
                toast(`A Rp 10.000 voucher will be applied on ${open.label}'s next QRIS payment`);
                setOpenId(null);
              }}
            >
              {open.segment === "At Risk" ? "Send come-back voucher" : "Send thank-you voucher"}
            </Button>
          </>
        )}
      </BottomSheet>
    </>
  );
}
