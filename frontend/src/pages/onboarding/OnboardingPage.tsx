import { useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRight,
  BarChart3,
  Boxes,
  Compass,
  Landmark,
  LogIn,
  QrCode,
  ReceiptText,
  ShieldCheck,
  ShoppingCart,
  Sparkles,
  Target,
  TrendingUp,
} from "lucide-react";
import { Button } from "@/components/common/Button";
import { AppIcon } from "@/components/common/Brand";
import { ProgressBar } from "@/components/common/ProgressBar";
import { useSession } from "@/hooks/useApp";
import { cn } from "@/utils/cn";

const SLIDES = [
  {
    eyebrow: "Manage your business",
    title: "Run your daily business from one simple place.",
    body: "Cashier, payments, stock and transactions work together, so every sale is recorded automatically.",
    visual: <ManageVisual />,
  },
  {
    eyebrow: "Understand your growth",
    title: "Turn everyday transactions into meaningful business insights.",
    body: "See what sells, when you are busiest and how your Growth Score is moving.",
    visual: <UnderstandVisual />,
  },
  {
    eyebrow: "Grow toward opportunity",
    title: "Know your next step and discover when your business is ready to grow.",
    body: "Growth Missions guide you forward and Financing Readiness shows how prepared your business looks.",
    visual: <GrowVisual />,
  },
];

export default function OnboardingPage() {
  const navigate = useNavigate();
  const { onboarded, exploreAsGuest, completeOnboarding } = useSession();
  const [index, setIndex] = useState(onboarded ? SLIDES.length : 0);
  const touchX = useRef<number | null>(null);
  const isFinal = index === SLIDES.length;

  const go = (next: number) => setIndex(Math.max(0, Math.min(SLIDES.length, next)));

  return (
    <div
      className="flex flex-1 flex-col overflow-y-auto bg-white"
      onTouchStart={(e) => (touchX.current = e.touches[0].clientX)}
      onTouchEnd={(e) => {
        if (touchX.current === null) return;
        const dx = e.changedTouches[0].clientX - touchX.current;
        if (Math.abs(dx) > 50) go(index + (dx < 0 ? 1 : -1));
        touchX.current = null;
      }}
    >
      {isFinal ? (
        <FinalScreen
          onLogin={() => {
            completeOnboarding();
            navigate("/login");
          }}
          onGuest={() => {
            exploreAsGuest();
            navigate("/home");
          }}
          onCreate={() => {
            completeOnboarding();
            navigate("/create-account");
          }}
          onBack={() => go(SLIDES.length - 1)}
        />
      ) : (
        <>
          <div className="flex items-center justify-between px-5 pt-4">
            <div className="flex items-center gap-2">
              <AppIcon size={30} />
              <span className="text-[14px] font-bold text-navy">Livin Merchant</span>
            </div>
            <button type="button" onClick={() => go(SLIDES.length)} className="rounded-full px-3 py-2 text-[13px] font-semibold text-ink-muted hover:bg-surface">
              Skip
            </button>
          </div>
          <div key={index} className="flex flex-1 animate-screen-in flex-col px-6">
            <div className="relative mt-4 flex h-[300px] items-center justify-center overflow-hidden rounded-[32px] bg-navy-50/70">
              <div className="dot-grid absolute inset-0 opacity-60" aria-hidden />
              {SLIDES[index].visual}
            </div>
            <p className="mt-7 text-[12px] font-bold uppercase tracking-[0.14em] text-gold-700">{SLIDES[index].eyebrow}</p>
            <h1 className="mt-2 text-[24px] font-extrabold leading-tight tracking-tight text-ink">{SLIDES[index].title}</h1>
            <p className="mt-3 text-[14.5px] leading-relaxed text-ink-muted">{SLIDES[index].body}</p>
          </div>
          <div className="flex items-center justify-between px-6 pb-8 pt-6">
            <div className="flex gap-1.5" role="tablist" aria-label="Onboarding progress">
              {SLIDES.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  role="tab"
                  aria-selected={i === index}
                  aria-label={`Slide ${i + 1}`}
                  onClick={() => go(i)}
                  className={cn("h-2 rounded-full transition-all", i === index ? "w-7 bg-navy" : "w-2 bg-navy-100")}
                />
              ))}
            </div>
            <Button size="lg" onClick={() => go(index + 1)} rightIcon={<ArrowRight className="h-4 w-4" />}>
              {index === SLIDES.length - 1 ? "Get Started" : "Next"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

function FinalScreen({ onLogin, onGuest, onCreate, onBack }: { onLogin: () => void; onGuest: () => void; onCreate: () => void; onBack: () => void }) {
  return (
    <div className="flex flex-1 animate-screen-in flex-col">
      <div className="hero-navy relative overflow-hidden px-6 pb-10 pt-8 text-white">
        <div className="dot-grid absolute inset-0 opacity-25" aria-hidden />
        <div className="relative">
          <AppIcon size={60} className="shadow-float" />
          <h1 className="mt-6 text-[27px] font-extrabold leading-tight tracking-tight">
            More than a transaction tool.
            <br />
            <span className="text-gold">A growth companion.</span>
          </h1>
          <p className="mt-3 max-w-[300px] text-[14px] leading-relaxed text-white/75">
            Every transaction helps Livin Merchant understand your business better.
          </p>
          <div className="mt-6 flex flex-wrap gap-2">
            {["Transact", "Understand", "Improve", "Grow", "Finance"].map((s, i) => (
              <span key={s} className="inline-flex items-center gap-1 rounded-full bg-white/10 px-2.5 py-1 text-[11.5px] font-semibold">
                {i > 0 && <ArrowRight className="h-3 w-3 text-gold" />}
                {s}
              </span>
            ))}
          </div>
        </div>
      </div>
      <div className="-mt-5 flex flex-1 flex-col rounded-t-[28px] bg-white px-6 pb-8 pt-7">
        <div className="space-y-3">
          <Button block size="lg" onClick={onLogin} leftIcon={<LogIn className="h-4 w-4" />}>
            Login with Mandiri
          </Button>
          <Button block size="lg" variant="accent" onClick={onGuest} leftIcon={<Compass className="h-4 w-4" />}>
            Explore as Guest
          </Button>
        </div>
        <p className="mt-3 text-center text-[12.5px] text-ink-muted">Explore Livin Merchant with sample data. No account needed.</p>
        <button type="button" onClick={onCreate} className="mx-auto mt-5 text-[13.5px] font-semibold text-sky-600 hover:underline">
          Create Mandiri Account
        </button>
        <div className="mt-auto flex items-center justify-center gap-2 pt-8 text-[11.5px] text-ink-faint">
          <ShieldCheck className="h-4 w-4" />
          Protected by Bank Mandiri security standards
        </div>
        <button type="button" onClick={onBack} className="mt-3 text-center text-[12px] font-semibold text-ink-muted">
          Back to introduction
        </button>
      </div>
    </div>
  );
}

function Float({ className, children }: { className?: string; children: ReactNode }) {
  return <div className={cn("absolute rounded-2xl border border-surface-line bg-white p-3 shadow-float", className)}>{children}</div>;
}

function ManageVisual() {
  return (
    <div className="relative h-full w-full">
      <Float className="left-6 top-8 w-[170px]">
        <p className="text-[10px] font-semibold text-ink-muted">Cart</p>
        {[["Cafe Latte", "32.000"], ["Croissant", "24.000"], ["Americano", "25.000"]].map(([n, p]) => (
          <div key={n} className="mt-1.5 flex justify-between text-[11px]">
            <span className="text-ink-soft">{n}</span>
            <span className="font-bold text-ink">{p}</span>
          </div>
        ))}
        <div className="mt-2 rounded-lg bg-navy py-1.5 text-center text-[11px] font-bold text-white">Charge Rp 81.000</div>
      </Float>
      <Float className="right-5 top-16 flex items-center gap-2">
        <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-gold">
          <QrCode className="h-5 w-5" />
        </span>
        <div>
          <p className="text-[10px] text-ink-muted">QRIS received</p>
          <p className="text-[12px] font-extrabold text-success-dark">+Rp 87.000</p>
        </div>
      </Float>
      <Float className="bottom-8 left-10 right-8 flex items-center justify-around">
        {[ShoppingCart, QrCode, Boxes, ReceiptText].map((Icon, i) => (
          <span key={i} className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy">
            <Icon className="h-5 w-5" />
          </span>
        ))}
      </Float>
    </div>
  );
}

function UnderstandVisual() {
  return (
    <div className="relative h-full w-full">
      <Float className="left-6 right-6 top-7">
        <p className="text-[10px] font-semibold text-ink-muted">Revenue this month</p>
        <p className="text-[18px] font-extrabold text-ink">Rp 48.75M</p>
        <svg viewBox="0 0 200 50" className="mt-1 h-12 w-full" aria-hidden>
          <path d="M0 42 C 30 38, 40 30, 60 32 S 100 20, 120 24 S 160 10, 200 6" fill="none" stroke="#003A70" strokeWidth="2.5" />
          <path d="M0 42 C 30 38, 40 30, 60 32 S 100 20, 120 24 S 160 10, 200 6 V50 H0Z" fill="#003A70" opacity="0.08" />
        </svg>
      </Float>
      <Float className="bottom-7 left-6 w-[150px]">
        <p className="text-[10px] font-semibold text-ink-muted">Growth Score</p>
        <p className="text-[22px] font-extrabold text-navy">
          78<span className="text-[12px] text-ink-muted"> / 100</span>
        </p>
        <ProgressBar value={78} tone="gold" />
      </Float>
      <Float className="bottom-10 right-5 w-[140px]">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-gold-700">
          <Sparkles className="h-3.5 w-3.5" /> Insight
        </div>
        <p className="mt-1 text-[11px] leading-snug text-ink-soft">Lunch hours bring your highest order value.</p>
      </Float>
    </div>
  );
}

function GrowVisual() {
  return (
    <div className="relative h-full w-full">
      <Float className="left-6 right-6 top-7">
        <div className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-gold-50 text-gold-700">
            <Target className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-[11px] font-bold text-ink">Reach Rp 50M monthly revenue</p>
            <ProgressBar value={97} tone="gold" className="mt-1" />
          </div>
          <span className="text-[11px] font-extrabold">97.5%</span>
        </div>
      </Float>
      <Float className="left-8 top-[120px] flex items-center gap-2">
        {["BUILD", "GROW", "SCALE"].map((s, i) => (
          <span key={s} className={cn("rounded-full px-2 py-1 text-[10px] font-extrabold", i === 1 ? "bg-navy text-gold" : i === 0 ? "bg-gold text-navy" : "bg-surface text-ink-faint")}>
            {s}
          </span>
        ))}
        <TrendingUp className="h-4 w-4 text-success" />
      </Float>
      <Float className="bottom-7 right-6 w-[180px]">
        <div className="flex items-center gap-1.5 text-[10px] font-semibold text-ink-muted">
          <Landmark className="h-3.5 w-3.5" /> Financing Readiness
        </div>
        <p className="mt-1 text-[20px] font-extrabold text-ink">82%</p>
        <p className="text-[10.5px] font-semibold text-gold-700">Almost Ready</p>
      </Float>
      <Float className="bottom-10 left-6 flex h-12 w-12 items-center justify-center p-0">
        <BarChart3 className="h-5 w-5 text-navy" />
      </Float>
    </div>
  );
}
