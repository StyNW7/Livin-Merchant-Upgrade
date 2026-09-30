import { useMemo, useState, type ReactNode } from "react";
import { CalendarRange, ReceiptText, SlidersHorizontal } from "lucide-react";
import type { PaymentMethod, SalesChannel, Transaction, TransactionStatus } from "@/types";
import { TabHeader } from "@/components/layout/TopAppBar";
import { IconButton, Button } from "@/components/common/Button";
import { ChipRow, FilterChip, Segmented } from "@/components/common/FilterChip";
import { SearchInput, TextField } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { EmptyState } from "@/components/common/EmptyState";
import { TransactionItem } from "@/components/cards/TransactionItem";
import { useData, useSession } from "@/hooks/useApp";
import { DEMO_TODAY } from "@/data/merchant";
import { ACTIVE_OUTLET_IDS, outletArea } from "@/data/outlets";
import { METHOD_LABEL, PAYMENT_METHODS, isCountedSale, netAmount, rangeStart, shiftDate } from "@/data/analytics";
import { formatCompactRupiah, formatCount, formatDayDate, formatRupiah } from "@/utils/format";

type Tab = "all" | "sale" | "settlement" | "refund";
type Range = "today" | "7d" | "30d" | "custom";

interface Advanced {
  methods: PaymentMethod[];
  outlet: "current" | "all";
  cashiers: string[];
  statuses: TransactionStatus[];
  channels: SalesChannel[];
  min: string;
  max: string;
}

const EMPTY: Advanced = { methods: [], outlet: "current", cashiers: [], statuses: [], channels: [], min: "", max: "" };
const PAGE = 40;

export default function TransactionsPage() {
  const { transactions, allTransactions } = useData();
  const { outletName, outletId } = useSession();
  const [tab, setTab] = useState<Tab>("all");
  const [range, setRange] = useState<Range>("today");
  const [custom, setCustom] = useState({ from: shiftDate(DEMO_TODAY, -6), to: DEMO_TODAY });
  const [customOpen, setCustomOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [advanced, setAdvanced] = useState<Advanced>(EMPTY);
  const [draft, setDraft] = useState<Advanced>(EMPTY);
  const [filterOpen, setFilterOpen] = useState(false);
  const [limit, setLimit] = useState(PAGE);

  const source = useMemo(
    () =>
      advanced.outlet === "all"
        ? ACTIVE_OUTLET_IDS.flatMap((id) => allTransactions[id] ?? []).sort((a, b) => b.timestamp - a.timestamp)
        : transactions,
    [advanced.outlet, allTransactions, transactions],
  );

  const cashierNames = useMemo(() => [...new Set(source.filter((t) => t.type === "sale").map((t) => t.cashier))].sort(), [source]);

  const [from, to] =
    range === "today" ? [DEMO_TODAY, DEMO_TODAY] : range === "7d" ? [rangeStart(7), DEMO_TODAY] : range === "30d" ? [rangeStart(30), DEMO_TODAY] : [custom.from, custom.to];

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    const min = Number(advanced.min || 0);
    const max = Number(advanced.max || 0);
    return source.filter((t) => {
      if (t.date < from || t.date > to) return false;
      if (tab !== "all" && t.type !== tab) return false;
      if (advanced.methods.length && !advanced.methods.includes(t.method as PaymentMethod)) return false;
      if (advanced.cashiers.length && !advanced.cashiers.includes(t.cashier)) return false;
      if (advanced.statuses.length && !advanced.statuses.includes(t.status)) return false;
      if (advanced.channels.length && (!t.channel || !advanced.channels.includes(t.channel))) return false;
      if (min && t.amount < min) return false;
      if (max && t.amount > max) return false;
      if (q && !(t.id.toLowerCase().includes(q) || METHOD_LABEL[t.method].toLowerCase().includes(q) || String(t.amount).includes(q.replace(/\D/g, "") || "#") || t.items.some((i) => i.name.toLowerCase().includes(q)))) return false;
      return true;
    });
  }, [source, from, to, tab, advanced, query]);

  const sales = filtered.filter(isCountedSale);
  const totalSales = sales.reduce((s, t) => s + netAmount(t), 0);
  const activeAdvanced =
    advanced.methods.length + advanced.cashiers.length + advanced.statuses.length + advanced.channels.length + (advanced.min ? 1 : 0) + (advanced.max ? 1 : 0) + (advanced.outlet === "all" ? 1 : 0);

  const groups = useMemo(() => {
    const map = new Map<string, Transaction[]>();
    filtered.slice(0, limit).forEach((t) => {
      const list = map.get(t.date) ?? [];
      list.push(t);
      map.set(t.date, list);
    });
    return [...map.entries()];
  }, [filtered, limit]);

  const toggle = <K extends "methods" | "cashiers" | "statuses" | "channels">(key: K, value: Advanced[K][number]) =>
    setDraft((d) => {
      const list = d[key] as string[];
      return { ...d, [key]: list.includes(value as string) ? list.filter((x) => x !== value) : [...list, value] };
    });

  return (
    <div className="pb-6">
      <TabHeader
        title="Transactions"
        subtitle={advanced.outlet === "all" ? "All outlets" : outletName}
        right={
          <IconButton
            label={`Filters${activeAdvanced ? `, ${activeAdvanced} active` : ""}`}
            badge={activeAdvanced > 0}
            onClick={() => {
              setDraft(advanced);
              setFilterOpen(true);
            }}
          >
            <SlidersHorizontal className="h-5 w-5" />
          </IconButton>
        }
      />

      <div className="space-y-3 px-5 pt-1">
        <Segmented<Tab>
          value={tab}
          onChange={(v) => {
            setTab(v);
            setLimit(PAGE);
          }}
          ariaLabel="Transaction type"
          options={[
            { value: "all", label: "All" },
            { value: "sale", label: "Sales" },
            { value: "settlement", label: "Settlement" },
            { value: "refund", label: "Refund" },
          ]}
        />
        <ChipRow>
          {(
            [
              ["today", "Today"],
              ["7d", "7 Days"],
              ["30d", "30 Days"],
              ["custom", range === "custom" ? `${custom.from.slice(5)} – ${custom.to.slice(5)}` : "Custom"],
            ] as [Range, string][]
          ).map(([value, label]) => (
            <FilterChip
              key={value}
              label={label}
              active={range === value}
              icon={value === "custom" ? <CalendarRange className="h-3.5 w-3.5" /> : undefined}
              onClick={() => {
                if (value === "custom") setCustomOpen(true);
                else {
                  setRange(value);
                  setLimit(PAGE);
                }
              }}
            />
          ))}
        </ChipRow>
        <SearchInput value={query} onChange={setQuery} placeholder="Search invoice, amount or item" />

        <section className="grid grid-cols-3 gap-2 rounded-2xl hero-navy overflow-hidden shadow-float p-3.5 text-white">
          <div>
            <p className="text-[11px] text-white/80">Total Sales</p>
            <p className="tabular text-[15px] font-extrabold">{formatCompactRupiah(totalSales)}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/80">Transactions</p>
            <p className="tabular text-[15px] font-extrabold">{formatCount(sales.length)}</p>
          </div>
          <div>
            <p className="text-[11px] text-white/80">Average</p>
            <p className="tabular text-[15px] font-extrabold">{formatRupiah(sales.length ? Math.round(totalSales / sales.length) : 0)}</p>
          </div>
        </section>
      </div>

      <div className="space-y-4 px-5 pt-4">
        {groups.length ? (
          groups.map(([date, list]) => (
            <section key={date}>
              <h2 className="mb-2 flex items-center justify-between px-1 text-[12px] font-bold text-ink-muted">
                <span>{date === DEMO_TODAY ? "Today" : formatDayDate(date)}</span>
                <span>{list.length} records</span>
              </h2>
              <div className="card divide-y divide-surface-line overflow-hidden">
                {list.map((t) => (
                  <TransactionItem key={t.id + t.outletId} transaction={t} />
                ))}
              </div>
            </section>
          ))
        ) : (
          <EmptyState
            icon={ReceiptText}
            title="No transactions found"
            message={
              query || activeAdvanced ? "Try a different search or clear the filters." : "Your transactions will appear here once you start selling."
            }
            action={
              query || activeAdvanced ? (
                <Button
                  variant="secondary"
                  onClick={() => {
                    setQuery("");
                    setAdvanced(EMPTY);
                  }}
                >
                  Clear filters
                </Button>
              ) : undefined
            }
          />
        )}
        {filtered.length > limit && (
          <Button block variant="secondary" onClick={() => setLimit((l) => l + PAGE)}>
            Load more ({formatCount(filtered.length - limit)} remaining)
          </Button>
        )}
      </div>

      <BottomSheet
        open={customOpen}
        onClose={() => setCustomOpen(false)}
        title="Custom date range"
        subtitle="Up to the last 90 days"
        footer={
          <Button
            block
            size="lg"
            disabled={custom.from > custom.to}
            onClick={() => {
              setRange("custom");
              setLimit(PAGE);
              setCustomOpen(false);
            }}
          >
            Apply range
          </Button>
        }
      >
        <div className="grid grid-cols-2 gap-3">
          <TextField label="From" type="date" min={rangeStart(90)} max={DEMO_TODAY} value={custom.from} onChange={(e) => setCustom((c) => ({ ...c, from: e.target.value || c.from }))} />
          <TextField label="To" type="date" min={rangeStart(90)} max={DEMO_TODAY} value={custom.to} onChange={(e) => setCustom((c) => ({ ...c, to: e.target.value || c.to }))} />
        </div>
        {custom.from > custom.to && <p className="mt-2 text-[12px] text-danger">Start date must be before end date.</p>}
      </BottomSheet>

      <BottomSheet
        open={filterOpen}
        onClose={() => setFilterOpen(false)}
        title="Filter transactions"
        footer={
          <div className="grid grid-cols-2 gap-2">
            <Button variant="secondary" size="lg" onClick={() => setDraft(EMPTY)}>
              Reset
            </Button>
            <Button
              size="lg"
              onClick={() => {
                setAdvanced(draft);
                setLimit(PAGE);
                setFilterOpen(false);
              }}
            >
              Apply
            </Button>
          </div>
        }
      >
        <div className="space-y-5">
          <FilterGroup title="Outlet">
            <FilterChip label={`Current (${outletArea(outletId)})`} active={draft.outlet === "current"} onClick={() => setDraft((d) => ({ ...d, outlet: "current" }))} />
            <FilterChip label="All outlets" active={draft.outlet === "all"} onClick={() => setDraft((d) => ({ ...d, outlet: "all" }))} />
          </FilterGroup>
          <FilterGroup title="Payment">
            {PAYMENT_METHODS.map((m) => (
              <FilterChip key={m} label={METHOD_LABEL[m]} active={draft.methods.includes(m)} onClick={() => toggle("methods", m)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Employee">
            {cashierNames.map((c) => (
              <FilterChip key={c} label={c} active={draft.cashiers.includes(c)} onClick={() => toggle("cashiers", c)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Status">
            {(["Completed", "Refunded", "Partially Refunded"] as TransactionStatus[]).map((s) => (
              <FilterChip key={s} label={s} active={draft.statuses.includes(s)} onClick={() => toggle("statuses", s)} />
            ))}
          </FilterGroup>
          <FilterGroup title="Sales channel">
            {(["Dine-in", "Takeaway", "Delivery"] as SalesChannel[]).map((c) => (
              <FilterChip key={c} label={c} active={draft.channels.includes(c)} onClick={() => toggle("channels", c)} />
            ))}
          </FilterGroup>
          <div>
            <p className="mb-2 text-[13px] font-bold text-ink">Amount</p>
            <div className="grid grid-cols-2 gap-3">
              <TextField label="Minimum" prefix="Rp" inputMode="numeric" value={draft.min} onChange={(e) => setDraft((d) => ({ ...d, min: e.target.value.replace(/\D/g, "") }))} />
              <TextField label="Maximum" prefix="Rp" inputMode="numeric" value={draft.max} onChange={(e) => setDraft((d) => ({ ...d, max: e.target.value.replace(/\D/g, "") }))} />
            </div>
          </div>
        </div>
      </BottomSheet>
    </div>
  );
}

function FilterGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-[13px] font-bold text-ink">{title}</p>
      <div className="flex flex-wrap gap-2">{children}</div>
    </div>
  );
}
