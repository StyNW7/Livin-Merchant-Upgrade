import { useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { OverlayPortal } from "@/components/common/Overlay";
import { useUI } from "@/hooks/useApp";
import { useServiceWorker } from "@/hooks/useInstallApp";
import { acknowledgeOfflineReady, applyUpdate, dismissUpdate } from "@/pwa/serviceWorker";

/** Confirms offline readiness and offers new versions. The worker itself registers in main.tsx. */
export function UpdatePrompt() {
  const { toast } = useUI();
  const { needRefresh, offlineReady } = useServiceWorker();

  useEffect(() => {
    if (!offlineReady) return;
    toast("Livin Merchant is ready to work offline", "info");
    acknowledgeOfflineReady();
  }, [offlineReady, toast]);

  if (!needRefresh) return null;

  return (
    <OverlayPortal>
      <div
        role="status"
        className="pointer-events-auto absolute inset-x-3 bottom-[96px] z-[65] flex animate-toast-in items-center gap-3 rounded-2xl border border-navy-100 bg-white/95 p-2.5 pl-3 shadow-float backdrop-blur"
      >
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-navy-400 to-navy-600 text-white shadow-brand">
          <RefreshCw className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-extrabold text-ink">A new version is ready</p>
          <p className="text-[12px] text-ink-muted">Update now to get the latest improvements.</p>
        </div>
        <button
          type="button"
          onClick={() => applyUpdate()}
          className="h-9 shrink-0 rounded-xl bg-gold px-3.5 text-[13px] font-bold text-navy-900 shadow-glow active:scale-95"
        >
          Update
        </button>
        <button
          type="button"
          onClick={dismissUpdate}
          aria-label="Later"
          className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-ink-faint hover:bg-surface"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </OverlayPortal>
  );
}
