import { useNavigate } from "react-router-dom";
import { ArrowRight, BarChart3, Boxes, CircleCheck, Landmark, ScanLine, Target, TrendingUp, UserPlus, type LucideIcon } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { useSession } from "@/hooks/useApp";

const PILLARS: { icon: LucideIcon; title: string; text: string; to: string }[] = [
  { icon: ScanLine, title: "Sell", text: "Cashier, QRIS and split payments with receipts.", to: "/cashier" },
  { icon: Boxes, title: "Manage", text: "Orders, stock, suppliers, staff and outlets.", to: "/more" },
  { icon: BarChart3, title: "Understand", text: "Analytics with plain-language insights.", to: "/reports" },
  { icon: Target, title: "Improve", text: "Growth Missions and next best actions.", to: "/growth/missions" },
  { icon: TrendingUp, title: "Grow", text: "Growth Score and business stages.", to: "/growth/score" },
  { icon: Landmark, title: "Finance", text: "Financing readiness with Mandiri.", to: "/growth/readiness" },
];

export default function WhyLivinPage() {
  const navigate = useNavigate();
  const { isGuest, logout } = useSession();
  return (
    <>
      <TopAppBar title="Why Livin Merchant?" backTo="/home" />
      <PageBody>
        <section className="hero-navy overflow-hidden rounded-3xl p-5 text-white">
          <p className="text-[12px] font-bold uppercase tracking-[0.14em] text-gold">The upgrade</p>
          <h2 className="mt-2 text-[22px] font-extrabold leading-tight">Manage your business today. Grow it tomorrow.</h2>
          <div className="mt-5 grid grid-cols-2 gap-3 text-[12px]">
            <div className="rounded-2xl bg-white/5 p-3">
              <p className="font-bold text-white/60">Before</p>
              <p className="mt-1.5 leading-relaxed text-white/80">POS + Payment + Report</p>
            </div>
            <div className="rounded-2xl bg-white/10 p-3 ring-1 ring-gold/40">
              <p className="font-bold text-gold">Now</p>
              <p className="mt-1.5 leading-relaxed">Operate, Transact, Understand, Improve, Grow, Finance</p>
            </div>
          </div>
        </section>

        <section className="grid grid-cols-2 gap-3">
          {PILLARS.map((p) => (
            <button key={p.title} type="button" onClick={() => navigate(p.to)} className="card pressable p-4 text-left">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy">
                <p.icon className="h-5 w-5" />
              </span>
              <p className="mt-3 text-[14.5px] font-bold text-ink">{p.title}</p>
              <p className="mt-0.5 text-[12px] leading-snug text-ink-muted">{p.text}</p>
            </button>
          ))}
        </section>

        <section className="card p-4">
          <h3 className="text-[15px] font-bold text-ink">Every transaction moves your business forward</h3>
          <ol className="mt-3 space-y-2.5">
            {["Payment", "Transaction data", "Business insight", "Growth Mission", "Growth Score", "Financing readiness", "Business growth"].map((s, i) => (
              <li key={s} className="flex items-center gap-2.5 text-[13.5px] text-ink-soft">
                <CircleCheck className="h-4 w-4 text-success" />
                <span className="font-semibold text-ink">{s}</span>
                {i < 6 && <ArrowRight className="ml-auto h-3.5 w-3.5 text-ink-faint" />}
              </li>
            ))}
          </ol>
        </section>

        {isGuest && (
          <div className="space-y-2.5">
            <Button
              block
              size="lg"
              onClick={() => {
                logout();
                navigate("/login");
              }}
            >
              Login with Mandiri
            </Button>
            <Button
              block
              variant="secondary"
              leftIcon={<UserPlus className="h-4 w-4" />}
              onClick={() => {
                logout();
                navigate("/create-account");
              }}
            >
              Create Mandiri Account
            </Button>
          </div>
        )}
      </PageBody>
    </>
  );
}
