import type { ReactNode } from "react";
import { BatteryFull, Download, Signal, Wifi } from "lucide-react";
import { OVERLAY_ROOT_ID } from "@/components/common/Overlay";
import { AppIcon } from "@/components/common/Brand";
import { DEMO_NOW } from "@/data/merchant";
import { useInstallApp } from "@/hooks/useInstallApp";
import { openInstallSheet } from "@/pwa/events";

const STORY = [
  { step: "Operate", text: "Orders, stock, staff and suppliers" },
  { step: "Transact", text: "POS, QRIS and settlement" },
  { step: "Understand", text: "Analytics and business insights" },
  { step: "Improve", text: "Growth Missions and next actions" },
  { step: "Grow", text: "Growth Score and stages" },
  { step: "Finance", text: "Financing readiness with Mandiri" },
];

/**
 * App frame. On phones and in the installed app it fills the screen; in a desktop browser it is
 * shown in a phone frame on a quiet Mandiri backdrop, with the product story on wide screens.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  const { standalone, justInstalled } = useInstallApp();

  if (standalone) {
    return (
      <div className="flex min-h-[100dvh] justify-center bg-[#EAF2FE]">
        <div className="relative flex h-[100dvh] w-full max-w-[480px] flex-col overflow-hidden bg-surface pt-[env(safe-area-inset-top)] sm:shadow-device">
          <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
          <div id={OVERLAY_ROOT_ID} className="pointer-events-none absolute inset-0 z-50" />
        </div>
      </div>
    );
  }

  return (
    <div className="desk-backdrop flex min-h-[100dvh] items-center justify-center sm:py-6 xl:gap-16">
      <aside className="hidden max-w-[340px] xl:block">
        <div className="flex items-center gap-3">
          <AppIcon size={52} className="shadow-float" />
          <div>
            <p className="text-xl font-extrabold tracking-tight text-navy-600">Livin Merchant</p>
            <p className="text-sm text-ink-muted">by Mandiri</p>
          </div>
        </div>
        <h1 className="mt-8 text-[30px] font-extrabold leading-tight tracking-tight text-navy-600">
          Manage your business today.
          <br />
          <span className="text-gold-600">Grow it tomorrow.</span>
        </h1>
        <p className="mt-3 text-[15px] leading-relaxed text-ink-soft">
          Every transaction moves your business forward.
        </p>
        <ol className="mt-8 space-y-3">
          {STORY.map((s, i) => (
            <li key={s.step} className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-navy-400 to-navy-600 text-xs font-bold text-white shadow-brand">
                {i + 1}
              </span>
              <span className="text-sm">
                <span className="font-bold text-navy-600">{s.step}</span>
                <span className="text-ink-muted"> — {s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <div className="mt-10 flex items-center gap-4 rounded-3xl bg-white/80 p-4 shadow-card backdrop-blur">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-bold text-navy-600">{justInstalled ? "Installed on this computer" : "Get the Livin Merchant app"}</p>
            <p className="text-xs text-ink-muted">{justInstalled ? "Open it from your apps or taskbar." : "Install it on your phone or computer in one tap."}</p>
          </div>
          {!justInstalled && (
            <button
              type="button"
              onClick={openInstallSheet}
              className="inline-flex h-10 shrink-0 items-center gap-2 rounded-2xl bg-gold px-4 text-sm font-bold text-navy-900 shadow-glow hover:bg-gold-400 active:scale-95"
            >
              <Download className="h-4 w-4" /> Install
            </button>
          )}
        </div>
      </aside>

      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-surface sm:h-[min(880px,calc(100dvh-48px))] sm:w-[412px] sm:rounded-[46px] sm:border-[10px] sm:border-[#141B2B] sm:shadow-device">
        <StatusBar />
        <div className="relative flex min-h-0 flex-1 flex-col">{children}</div>
        <div id={OVERLAY_ROOT_ID} className="pointer-events-none absolute inset-0 z-50" />
      </div>
    </div>
  );
}

/** Decorative status bar shown only in the desktop device frame. On phones the real one is used. */
function StatusBar() {
  return (
    <div
      className="relative z-40 hidden h-9 shrink-0 items-center justify-between bg-transparent px-7 text-[13px] font-semibold text-ink sm:flex"
      aria-hidden
    >
      <span className="tabular">{DEMO_NOW}</span>
      <span className="absolute left-1/2 top-2 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-[#141B2B]" />
      <span className="flex items-center gap-1.5">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </span>
    </div>
  );
}
