import { useEffect } from "react";
import { RefreshCw, X } from "lucide-react";
import { useRegisterSW } from "virtual:pwa-register/react";
import { OverlayPortal } from "@/components/common/Overlay";
import { useUI } from "@/hooks/useApp";
import { setServiceWorkerRegistration } from "@/pwa/serviceWorker";

/** Checks for a new version every hour while the app is open. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

/** Registers the service worker, confirms offline readiness and offers new versions. */
export function UpdatePrompt() {
  const { toast } = useUI();
  const {
    offlineReady: [offlineReady, setOfflineReady],
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW({
    onRegisteredSW(_url, registration) {
      if (!registration) return;
      setServiceWorkerRegistration(registration);
      window.setInterval(() => registration.update().catch(() => undefined), UPDATE_CHECK_MS);
    },
  });

  useEffect(() => {
    if (!offlineReady) return;
    toast("Livin Merchant is ready to work offline", "info");
    setOfflineReady(false);
  }, [offlineReady, setOfflineReady, toast]);

  if (!needRefresh) return null;

  return (
    <OverlayPortal>
      <div className="pointer-events-auto absolute inset-x-3 bottom-[88px] z-[65] flex animate-toast-in items-center gap-3 rounded-2xl bg-navy-950/95 p-3 pl-4 text-white shadow-float backdrop-blur">
        <RefreshCw className="h-5 w-5 shrink-0 text-gold" />
        <div className="min-w-0 flex-1">
          <p className="text-[13.5px] font-bold">A new version is ready</p>
          <p className="text-[12px] text-white/70">Update now to get the latest improvements.</p>
        </div>
        <button
          type="button"
          onClick={() => updateServiceWorker(true)}
          className="h-9 shrink-0 rounded-xl bg-gold px-3.5 text-[13px] font-bold text-navy-900 active:scale-95"
        >
          Update
        </button>
        <button type="button" onClick={() => setNeedRefresh(false)} aria-label="Later" className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-white/70 hover:bg-white/10">
          <X className="h-4 w-4" />
        </button>
      </div>
    </OverlayPortal>
  );
}
