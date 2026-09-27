import { useEffect, useMemo, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  AlertTriangle,
  BookOpen,
  Check,
  ChevronRight,
  CreditCard,
  Headphones,
  Landmark,
  MessageCircle,
  Package,
  Phone,
  ReceiptText,
  Rocket,
  ShieldCheck,
  TrendingUp,
  UserRound,
  Wallet,
  type LucideIcon,
} from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { SearchInput, SelectField, TextField } from "@/components/common/Form";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { EmptyState } from "@/components/common/EmptyState";
import { SectionHeader } from "@/components/common/SectionHeader";
import { useData, useUI } from "@/hooks/useApp";
import { StatusBadge } from "@/components/common/StatusBadge";
import { formatShortDate } from "@/utils/format";
import { HELP_CATEGORIES, helpArticles, type HelpCategory } from "@/data/support";

const categoryIcon: Record<HelpCategory, LucideIcon> = {
  "Getting Started": Rocket,
  Payments: CreditCard,
  Transactions: ReceiptText,
  Settlement: Wallet,
  Products: Package,
  Growth: TrendingUp,
  Financing: Landmark,
  Account: UserRound,
  Security: ShieldCheck,
};

export default function HelpPage() {
  const navigate = useNavigate();
  const [params, setParams] = useSearchParams();
  const { toast } = useUI();
  const { tickets, createTicket, helpfulArticles, markArticleHelpful } = useData();
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<HelpCategory | null>(null);
  const [articleId, setArticleId] = useState<string | null>(params.get("article"));
  const [reportOpen, setReportOpen] = useState(false);
  const [report, setReport] = useState({ topic: "Payments", detail: "" });

  useEffect(() => {
    if (params.get("article")) setArticleId(params.get("article"));
  }, [params]);

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    return helpArticles.filter(
      (a) => (!category || a.category === category) && (!q || a.title.toLowerCase().includes(q) || a.body.some((b) => b.toLowerCase().includes(q))),
    );
  }, [query, category]);
  const article = helpArticles.find((a) => a.id === articleId) ?? null;
  const showList = query.trim() || category;

  return (
    <>
      <TopAppBar title="Help Center" subtitle="We are here for you, 07:00 - 22:00" />
      <PageBody>
        <SearchInput value={query} onChange={setQuery} placeholder="Search help articles" />

        {!showList && (
          <section className="grid grid-cols-3 gap-2">
            {HELP_CATEGORIES.map((c) => {
              const Icon = categoryIcon[c];
              return (
                <button key={c} type="button" onClick={() => setCategory(c)} className="card flex flex-col items-center gap-2 px-2 py-4 text-center transition hover:shadow-float">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy">
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-[12px] font-semibold leading-tight text-ink-soft">{c}</span>
                </button>
              );
            })}
          </section>
        )}

        <section>
          <SectionHeader
            title={showList ? (category ? category : "Search results") : "Common articles"}
            actionLabel={category ? "All topics" : undefined}
            onAction={() => setCategory(null)}
          />
          {(showList ? results : helpArticles.filter((a) => a.popular)).length ? (
            <div className="card divide-y divide-surface-line overflow-hidden">
              {(showList ? results : helpArticles.filter((a) => a.popular)).map((a) => (
                <button key={a.id} type="button" onClick={() => setArticleId(a.id)} className="flex w-full items-center gap-3 px-4 py-3.5 text-left hover:bg-surface/70">
                  <BookOpen className="h-4 w-4 shrink-0 text-ink-faint" />
                  <span className="flex-1 text-[13.5px] font-semibold text-ink">{a.title}</span>
                  <ChevronRight className="h-4 w-4 text-ink-faint" />
                </button>
              ))}
            </div>
          ) : (
            <EmptyState icon={BookOpen} title="No articles found" message="Try other words or chat with our support team." />
          )}
        </section>

        <section className="space-y-2">
          <h2 className="text-[16px] font-bold text-ink">Contact support</h2>
          <button type="button" onClick={() => navigate("/support-chat")} className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy text-gold">
              <MessageCircle className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-[14.5px] font-bold text-ink">Chat with support</span>
              <span className="block text-[12px] text-ink-muted">Usually replies in 5 minutes</span>
            </span>
            <ChevronRight className="h-5 w-5 text-ink-faint" />
          </button>
          <a href="tel:14000" className="card flex items-center gap-3 p-4 transition hover:shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-navy-50 text-navy">
              <Phone className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-[14.5px] font-bold text-ink">Mandiri Call 14000</span>
              <span className="block text-[12px] text-ink-muted">24 hours, every day</span>
            </span>
            <Headphones className="h-5 w-5 text-ink-faint" />
          </a>
          <button type="button" onClick={() => setReportOpen(true)} className="card flex w-full items-center gap-3 p-4 text-left transition hover:shadow-float">
            <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-warning-soft text-warning-dark">
              <AlertTriangle className="h-5 w-5" />
            </span>
            <span className="flex-1">
              <span className="block text-[14.5px] font-bold text-ink">Report a problem</span>
              <span className="block text-[12px] text-ink-muted">Payments, devices or app issues</span>
            </span>
            <ChevronRight className="h-5 w-5 text-ink-faint" />
          </button>
        </section>

        {tickets.length > 0 && (
          <section>
            <SectionHeader title="Your reports" subtitle="We will update you through Notifications" />
            <div className="card divide-y divide-surface-line overflow-hidden">
              {tickets.map((t) => (
                <div key={t.id} className="flex items-start gap-3 px-4 py-3">
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13.5px] font-semibold text-ink">
                      {t.id} · {t.topic}
                    </span>
                    <span className="block truncate text-[12px] text-ink-muted">{t.detail}</span>
                    <span className="block text-[11.5px] text-ink-faint">
                      Sent {formatShortDate(t.createdAt.slice(0, 10))}, {t.createdAt.slice(11)}
                    </span>
                  </span>
                  <StatusBadge status={t.status} tone="info" />
                </div>
              ))}
            </div>
          </section>
        )}
      </PageBody>

      <BottomSheet
        open={!!article}
        onClose={() => {
          setArticleId(null);
          if (params.get("article")) setParams({}, { replace: true });
        }}
        title={article?.title ?? ""}
        subtitle={article?.category}
      >
        {article && (
          <>
            <ol className="space-y-3">
              {article.body.map((b, i) => (
                <li key={i} className="flex gap-3 text-[14px] leading-relaxed text-ink-soft">
                  <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy-50 text-[12px] font-bold text-navy">{i + 1}</span>
                  {b}
                </li>
              ))}
            </ol>
            <div className="mt-5 flex items-center justify-between rounded-2xl bg-surface px-4 py-3">
              <span className="text-[13px] text-ink-soft">{helpfulArticles.includes(article.id) ? "You found this helpful" : "Was this helpful?"}</span>
              <span className="flex gap-2">
                {helpfulArticles.includes(article.id) ? (
                  <span className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-success-soft px-3 text-[13px] font-semibold text-success-dark">
                    <Check className="h-4 w-4" /> Thanks
                  </span>
                ) : (
                  <Button size="sm" variant="secondary" onClick={() => markArticleHelpful(article.id)}>
                    Yes
                  </Button>
                )}
                <Button size="sm" variant="secondary" onClick={() => { setArticleId(null); navigate("/support-chat"); }}>
                  No, chat
                </Button>
              </span>
            </div>
          </>
        )}
      </BottomSheet>

      <BottomSheet
        open={reportOpen}
        onClose={() => setReportOpen(false)}
        title="Report a problem"
        footer={
          <Button
            block
            size="lg"
            disabled={report.detail.trim().length < 10}
            onClick={() => {
              const ticket = createTicket(report.topic, report.detail.trim());
              setReportOpen(false);
              setReport({ topic: "Payments", detail: "" });
              toast(`Report ${ticket.id} received. You can follow it under Your reports.`);
            }}
          >
            Submit report
          </Button>
        }
      >
        <div className="space-y-3">
          <SelectField label="Topic" value={report.topic} onChange={(e) => setReport({ ...report, topic: e.target.value })} options={HELP_CATEGORIES.map((c) => ({ value: c, label: c }))} />
          <TextField label="What happened?" placeholder="At least 10 characters" value={report.detail} onChange={(e) => setReport({ ...report, detail: e.target.value })} maxLength={200} />
          <p className="text-[12px] text-ink-muted">Your device model, app version and recent activity are attached to help us investigate.</p>
        </div>
      </BottomSheet>
    </>
  );
}
