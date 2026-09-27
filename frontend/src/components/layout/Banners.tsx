import { useNavigate } from "react-router-dom";
import { Compass, Lightbulb, WifiOff, X } from "lucide-react";
import { useSession } from "@/hooks/useApp";
import { cn } from "@/utils/cn";

export function GuestBanner() {
  const { isGuest, logout } = useSession();
  const navigate = useNavigate();
  if (!isGuest) return null;
  return (
    <div className="z-30 flex shrink-0 items-center gap-2 bg-navy px-4 py-2 text-white">
      <Compass className="h-4 w-4 shrink-0 text-gold" />
      <p className="min-w-0 flex-1 truncate text-[12px] font-semibold">
        Explore Mode <span className="font-normal text-white/70">— Demo Data</span>
      </p>
      <button
        type="button"
        onClick={() => navigate("/why")}
        className="rounded-full px-2.5 py-1 text-[11px] font-semibold text-white/85 hover:bg-white/10"
      >
        Why Livin?
      </button>
      <button
        type="button"
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="rounded-full bg-gold px-3 py-1 text-[11px] font-bold text-navy-900 hover:bg-gold-400"
      >
        Login
      </button>
    </div>
  );
}

export function OfflineBanner() {
  const { online } = useSession();
  if (online) return null;
  return (
    <div role="status" className="z-30 flex shrink-0 items-center gap-2 bg-warning-soft px-4 py-2 text-warning-dark">
      <WifiOff className="h-4 w-4 shrink-0" />
      <p className="text-[12px] font-semibold">You’re offline. Some information may not be updated.</p>
    </div>
  );
}

/** Dismissible contextual hint shown the first time a merchant opens a feature. */
export function CoachMark({ id, title, text, className }: { id: string; title?: string; text: string; className?: string }) {
  const { hintSeen, dismissHint, isMerchant } = useSession();
  if (!isMerchant || hintSeen(id)) return null;
  return (
    <div className={cn("relative flex animate-pop-in gap-3 rounded-2xl bg-navy p-4 pr-11 text-white shadow-float", className)} role="note">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-white/10 text-gold">
        <Lightbulb className="h-[18px] w-[18px]" />
      </span>
      <div className="min-w-0">
        {title && <p className="text-[13px] font-bold">{title}</p>}
        <p className="text-[13px] leading-relaxed text-white/85">{text}</p>
        <button type="button" onClick={() => dismissHint(id)} className="mt-2 text-[12px] font-bold text-gold hover:underline">
          Got it
        </button>
      </div>
      <button
        type="button"
        onClick={() => dismissHint(id)}
        aria-label="Dismiss hint"
        className="absolute right-2 top-2 flex h-9 w-9 items-center justify-center rounded-full text-white/70 hover:bg-white/10"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
