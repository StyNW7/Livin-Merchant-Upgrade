import { useState } from "react";
import { Navigate, useNavigate, useParams } from "react-router-dom";
import { CheckCircle2, CircleDashed, Clock, FileCheck2, Info, Landmark, ShieldCheck } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { StatusBadge } from "@/components/common/StatusBadge";
import { InfoRow } from "@/components/cards/ListRow";
import { useSession, useUI } from "@/hooks/useApp";
import { useGrowth } from "@/hooks/useBusiness";
import { usePersistentState } from "@/hooks/usePersistentState";
import { FINANCING_DISCLAIMER, FINANCING_DISCLAIMER_FULL, financingProducts } from "@/data/financing";
import { formatCompactRupiah } from "@/utils/format";

export default function FinancingDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { merchant, isGuest, scenario } = useSession();
  const { requireAccount, requirePin, toast } = useUI();
  const growth = useGrowth();
  const [interests, setInterests] = usePersistentState<Record<string, string>>(`${scenario}.financing-interest`, {}, !isGuest);
  const [consentOpen, setConsentOpen] = useState(false);
  const [agree, setAgree] = useState(false);
  const product = financingProducts.find((p) => p.id === id);
  if (!product) return <Navigate to="/financing" replace />;

  const Icon = product.icon;
  const reference = interests[product.id];

  const submit = () => {
    setConsentOpen(false);
    requirePin("Confirm financing interest", () => {
      const ref = `FIN-${Date.now().toString().slice(-6)}`;
      setInterests((prev) => ({ ...prev, [product.id]: ref }));
      toast("Your interest was sent to Bank Mandiri");
    });
  };

  return (
    <>
      <TopAppBar title={product.name} subtitle={product.tagline} backTo="/financing" />
      <PageBody>
        <section className="hero-navy rounded-[28px] p-5 text-white">
          <div className="flex items-center gap-3">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gold text-navy-900">
              <Icon className="h-6 w-6" />
            </span>
            <StatusBadge status={product.matchLevel} tone="gold" hideIcon />
          </div>
          <p className="mt-4 text-[12px] text-white/85">Estimated Potential Financing</p>
          <p className="tabular text-[26px] font-extrabold">
            {formatCompactRupiah(product.rangeMin, 0)} – {formatCompactRupiah(product.rangeMax, 0)}
          </p>
          <p className="mt-1 text-[12px] text-white/85">Indicative range · Tenor {product.tenor}</p>
        </section>

        <section className="card p-4">
          <h2 className="text-[15px] font-bold text-ink">Why it is recommended</h2>
          <p className="mt-1.5 text-[13.5px] leading-relaxed text-ink-soft">{product.reason}</p>
          <div className="mt-3 border-t border-surface-line pt-2">
            <InfoRow label="Purpose" value={product.purpose} />
            <InfoRow label="Your readiness" value={`${growth.readiness}% · ${growth.readinessStatus}`} strong />
            <InfoRow label="Growth Score" value={`${growth.score} · ${growth.stage.id}`} />
          </div>
        </section>

        <section className="card p-4">
          <h2 className="text-[15px] font-bold text-ink">Readiness factors</h2>
          <ul className="mt-3 space-y-2.5">
            {product.readinessFactors.map((f) => (
              <li key={f.label} className="flex items-center gap-2.5 text-[13.5px]">
                {f.met ? <CheckCircle2 className="h-5 w-5 text-success" /> : <CircleDashed className="h-5 w-5 text-warning" />}
                <span className={f.met ? "text-ink" : "text-ink-soft"}>{f.label}</span>
                <span className="ml-auto text-[11.5px] font-semibold text-ink-muted">{f.met ? "Met" : "To do"}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="card p-4">
          <h2 className="flex items-center gap-2 text-[15px] font-bold text-ink">
            <FileCheck2 className="h-4 w-4 text-navy-600" /> Preliminary requirements
          </h2>
          <ul className="mt-3 space-y-2">
            {product.requirements.map((r) => (
              <li key={r} className="flex gap-2 text-[13.5px] text-ink-soft">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-navy" />
                {r}
              </li>
            ))}
          </ul>
        </section>

        {reference ? (
          <section className="rounded-2xl border border-success/30 bg-success-soft p-4">
            <p className="flex items-center gap-2 text-[14px] font-bold text-success-dark">
              <Clock className="h-4 w-4" /> Interest submitted
            </p>
            <p className="mt-1 text-[13px] leading-relaxed text-ink-soft">
              Reference {reference}. A Mandiri business relationship officer may contact you to continue the assessment.
            </p>
          </section>
        ) : (
          <Button
            block
            size="lg"
            leftIcon={<Landmark className="h-4 w-4" />}
            onClick={() => {
              if (!requireAccount("financing applications")) return;
              setConsentOpen(true);
            }}
          >
            Continue with Mandiri
          </Button>
        )}
        <Button block variant="ghost" onClick={() => navigate("/growth/readiness")}>
          How to strengthen readiness
        </Button>

        <p className="flex gap-2 text-[11.5px] leading-relaxed text-ink-muted">
          <Info className="mt-0.5 h-4 w-4 shrink-0" />
          {FINANCING_DISCLAIMER}
        </p>
      </PageBody>

      <BottomSheet
        open={consentOpen}
        onClose={() => setConsentOpen(false)}
        title="Share your business profile"
        subtitle="Required to continue with Bank Mandiri"
        footer={
          <Button block size="lg" disabled={!agree} onClick={submit}>
            Agree and continue
          </Button>
        }
      >
        <div className="space-y-3 text-[13.5px] leading-relaxed text-ink-soft">
          <p>To start a preliminary assessment, {merchant.name} will share with Bank Mandiri:</p>
          <ul className="space-y-1.5">
            {["Business profile and verification status", "Transaction summary for the last 12 months", "Growth Score and readiness factors"].map((x) => (
              <li key={x} className="flex gap-2">
                <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-success" />
                {x}
              </li>
            ))}
          </ul>
          <p className="rounded-xl bg-surface p-3 text-[12.5px]">
            This is a request to be contacted, not a loan application. Potentially eligible merchants are reviewed individually. {FINANCING_DISCLAIMER_FULL}
          </p>
          <label className="flex items-start gap-3">
            <input type="checkbox" checked={agree} onChange={(e) => setAgree(e.target.checked)} className="mt-1 h-5 w-5 accent-[#5192F6]" />
            <span>I agree to share this information with Bank Mandiri for this purpose.</span>
          </label>
        </div>
      </BottomSheet>
    </>
  );
}
