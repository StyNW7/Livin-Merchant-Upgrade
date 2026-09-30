import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AppIcon } from "@/components/common/Brand";
import { useSession } from "@/hooks/useApp";

export default function SplashPage() {
  const navigate = useNavigate();
  const { mode } = useSession();

  useEffect(() => {
    const target = mode === "none" ? "/welcome" : "/home";
    const timer = window.setTimeout(() => navigate(target + window.location.search, { replace: true }), 1900);
    return () => window.clearTimeout(timer);
  }, [mode, navigate]);

  return (
    <button
      type="button"
      onClick={() => navigate(mode === "none" ? "/welcome" : "/home", { replace: true })}
      className="hero-navy relative flex flex-1 flex-col items-center justify-center overflow-hidden px-8 text-center text-white"
      aria-label="Continue"
    >
      <div className="dot-grid absolute inset-0 opacity-30" aria-hidden />
      <div className="relative animate-pop-in">
        <div className="relative mx-auto w-fit">
          <span className="absolute inset-0 animate-ring-pulse rounded-[30%] bg-gold/40" aria-hidden />
          <AppIcon size={104} className="relative animate-float shadow-float ring-4 ring-white/40" />
        </div>
        <p className="mt-7 text-[30px] font-extrabold tracking-tight">Livin Merchant</p>
        <p className="mx-auto mt-2 w-fit rounded-full bg-gold px-3.5 py-1 text-[11.5px] font-extrabold uppercase tracking-[0.28em] text-navy-900 shadow-glow">by Mandiri</p>
        <p className="mx-auto mt-8 max-w-[270px] text-[15px] font-medium leading-relaxed text-white/95">
          More than payments. Grow your business with every transaction.
        </p>
      </div>
      <div className="absolute bottom-10 flex gap-1.5" aria-hidden>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-2 w-2 animate-pulse rounded-full bg-white" style={{ animationDelay: `${i * 180}ms` }} />
        ))}
      </div>
    </button>
  );
}
