import { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BarChart3, ChevronLeft, CircleHelp, Clock, LayoutGrid, Landmark, Package, ReceiptText, SearchX, Store, UserRound, Users, type LucideIcon } from "lucide-react";
import { useData, useSession } from "@/hooks/useApp";
import { usePersistentState } from "@/hooks/usePersistentState";
import { EmptyState } from "@/components/common/EmptyState";
import { SearchInput } from "@/components/common/Form";
import { financingProducts } from "@/data/financing";
import { helpArticles, searchFeatures, searchReports } from "@/data/support";
import { outlets } from "@/data/outlets";
import { METHOD_LABEL } from "@/data/analytics";
import { formatRupiah } from "@/utils/format";

interface Result {
  id: string;
  title: string;
  subtitle: string;
  to: string;
}

const SUGGESTIONS = ["Croissant", "INV-2026-0926", "QRIS", "Rina", "Settlement", "Financing", "A-102", "Refund"];

export default function SearchPage() {
  const navigate = useNavigate();
  const { transactions, products, customers, employees } = useData();
  const [query, setQuery] = useState("");
  const { isGuest } = useSession();
  const [recent, setRecent] = usePersistentState<string[]>("recent-searches", [], !isGuest);
  const wrapRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    wrapRef.current?.querySelector("input")?.focus();
  }, []);

  const q = query.trim().toLowerCase();
  const groups = useMemo(() => {
    if (q.length < 2) return [];
    const digits = q.replace(/[^\d]/g, "");
    const match = (...fields: string[]) => fields.some((f) => f.toLowerCase().includes(q));
    const g: { key: string; label: string; icon: LucideIcon; items: Result[] }[] = [
      {
        key: "features",
        label: "Features",
        icon: LayoutGrid,
        items: searchFeatures
          .filter((f) => match(f.title, f.keywords))
          .slice(0, 4)
          .map((f) => ({ id: f.id, title: f.title, subtitle: f.section, to: f.to })),
      },
      {
        key: "tx",
        label: "Transactions",
        icon: ReceiptText,
        items: transactions
          .filter((t) => match(t.id, METHOD_LABEL[t.method], t.status, t.cashier, t.type) || (digits.length >= 4 && String(t.amount).includes(digits)))
          .slice(0, 5)
          .map((t) => ({ id: t.id, title: t.id, subtitle: `${METHOD_LABEL[t.method]} · ${formatRupiah(t.amount)} · ${t.status}`, to: `/transactions/${t.id}` })),
      },
      {
        key: "products",
        label: "Products",
        icon: Package,
        items: products
          .filter((p) => match(p.name, p.sku, p.category))
          .slice(0, 5)
          .map((p) => ({ id: p.id, title: p.name, subtitle: `${p.category} · ${formatRupiah(p.price)} · Stock ${p.stock}`, to: `/products?id=${p.id}` })),
      },
      {
        key: "customers",
        label: "Customers",
        icon: Users,
        items: customers
          .filter((c) => match(c.label, c.segment, c.favorite))
          .slice(0, 4)
          .map((c) => ({ id: c.id, title: c.label, subtitle: `${c.segment} · ${c.visits} visits`, to: `/customers?id=${c.id}` })),
      },
      {
        key: "reports",
        label: "Reports",
        icon: BarChart3,
        items: searchReports.filter((r) => match(r.title)).map((r) => ({ id: r.id, title: r.title, subtitle: "Report", to: r.to })),
      },
      {
        key: "staff",
        label: "Staff",
        icon: UserRound,
        items: employees
          .filter((e) => match(e.name, e.role))
          .map((e) => ({ id: e.id, title: e.name, subtitle: `${e.role} · ${outlets.find((o) => o.id === e.outletId)?.area}`, to: `/employees?id=${e.id}` })),
      },
      {
        key: "outlets",
        label: "Outlets",
        icon: Store,
        items: outlets.filter((o) => match(o.area, o.address)).map((o) => ({ id: o.id, title: o.area, subtitle: o.status, to: "/outlets" })),
      },
      {
        key: "financing",
        label: "Financing",
        icon: Landmark,
        items: financingProducts
          .filter((f) => match(f.name, f.tagline, "financing loan modal"))
          .map((f) => ({ id: f.id, title: f.name, subtitle: f.tagline, to: `/financing/${f.id}` })),
      },
      {
        key: "help",
        label: "Help topics",
        icon: CircleHelp,
        items: helpArticles
          .filter((h) => match(h.title, h.category, ...h.body))
          .slice(0, 4)
          .map((h) => ({ id: h.id, title: h.title, subtitle: h.category, to: `/help?article=${h.id}` })),
      },
    ];
    return g.filter((x) => x.items.length);
  }, [q, transactions, products, customers, employees]);

  const open = (to: string) => {
    if (q.length >= 2) setRecent((prev) => [query.trim(), ...prev.filter((r) => r.toLowerCase() !== q)].slice(0, 6));
    navigate(to);
  };

  return (
    <>
      <header className="sticky top-0 z-20 flex items-center gap-1.5 border-b border-surface-line/70 bg-surface/90 px-3 py-2.5 backdrop-blur-md">
        <button type="button" onClick={() => navigate(-1)} aria-label="Go back" className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl text-navy-600 hover:bg-navy-50">
          <ChevronLeft className="h-6 w-6" />
        </button>
        <div ref={wrapRef} className="flex-1">
          <SearchInput value={query} onChange={setQuery} placeholder="Search transactions, products, help..." />
        </div>
      </header>

      <div className="px-5 pb-8 pt-4">
        {q.length < 2 ? (
          <div className="space-y-6">
            {recent.length > 0 && (
              <section>
                <div className="mb-2 flex items-center justify-between">
                  <h2 className="text-[13px] font-bold text-ink">Recent searches</h2>
                  <button type="button" onClick={() => setRecent([])} className="text-[12px] font-semibold text-sky-600">
                    Clear
                  </button>
                </div>
                <div className="flex flex-wrap gap-2">
                  {recent.map((r) => (
                    <button key={r} type="button" onClick={() => setQuery(r)} className="inline-flex items-center gap-1.5 rounded-full border border-surface-line bg-white px-3 py-2 text-[13px] text-ink-soft">
                      <Clock className="h-3.5 w-3.5 text-ink-faint" />
                      {r}
                    </button>
                  ))}
                </div>
              </section>
            )}
            <section>
              <h2 className="mb-2 text-[13px] font-bold text-ink">Try searching for</h2>
              <div className="flex flex-wrap gap-2">
                {SUGGESTIONS.map((s) => (
                  <button key={s} type="button" onClick={() => setQuery(s)} className="rounded-full bg-navy-50 px-3 py-2 text-[13px] font-semibold text-navy-600 hover:bg-navy-100">
                    {s}
                  </button>
                ))}
              </div>
            </section>
          </div>
        ) : groups.length ? (
          <div className="space-y-5">
            {groups.map((g) => (
              <section key={g.key}>
                <h2 className="mb-2 flex items-center gap-1.5 text-[12px] font-bold uppercase tracking-wide text-ink-muted">
                  <g.icon className="h-3.5 w-3.5" /> {g.label}
                </h2>
                <div className="card divide-y divide-surface-line overflow-hidden">
                  {g.items.map((r) => (
                    <button key={r.id} type="button" onClick={() => open(r.to)} className="block w-full px-4 py-3 text-left hover:bg-surface/70">
                      <span className="block truncate text-[14px] font-semibold text-ink">{r.title}</span>
                      <span className="block truncate text-[12px] text-ink-muted">{r.subtitle}</span>
                    </button>
                  ))}
                </div>
              </section>
            ))}
          </div>
        ) : (
          <EmptyState icon={SearchX} title={`No results for "${query}"`} message="Try an invoice number, product name, staff name or a help topic." />
        )}
      </div>
    </>
  );
}
