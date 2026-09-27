import type { ReactNode } from "react";
import { BatteryFull, Signal, Wifi } from "lucide-react";
import { OVERLAY_ROOT_ID } from "@/components/common/Overlay";
import { AppIcon } from "@/components/common/Brand";
import { DEMO_NOW } from "@/data/merchant";

const STORY = [
  { step: "Operate", text: "Orders, stock, staff and suppliers" },
  { step: "Transact", text: "POS, QRIS and settlement" },
  { step: "Understand", text: "Analytics and business insights" },
  { step: "Improve", text: "Growth Missions and next actions" },
  { step: "Grow", text: "Growth Score and stages" },
  { step: "Finance", text: "Financing readiness with Mandiri" },
];

/**
 * Simulates a native phone. On phones it fills the screen; from 640px up it becomes a centered
 * device frame on a quiet Mandiri backdrop, with a presentation caption on wide screens.
 */
export function MobileShell({ children }: { children: ReactNode }) {
  return (
    <div className="desk-backdrop flex min-h-[100dvh] items-center justify-center sm:py-6 xl:gap-16">
      <aside className="hidden max-w-[340px] xl:block" aria-hidden>
        <div className="flex items-center gap-3">
          <AppIcon size={52} className="shadow-float" />
          <div>
            <p className="text-xl font-extrabold tracking-tight text-navy">Livin Merchant</p>
            <p className="text-sm text-ink-muted">by Mandiri</p>
          </div>
        </div>
        <h1 className="mt-8 text-[30px] font-extrabold leading-tight tracking-tight text-navy">
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
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-white text-xs font-bold text-navy shadow-card">
                {i + 1}
              </span>
              <span className="text-sm">
                <span className="font-bold text-navy">{s.step}</span>
                <span className="text-ink-muted"> — {s.text}</span>
              </span>
            </li>
          ))}
        </ol>
        <p className="mt-10 text-xs text-ink-faint">Interactive prototype. All figures are demonstration data.</p>
      </aside>

      <div className="relative flex h-[100dvh] w-full flex-col overflow-hidden bg-surface sm:h-[min(880px,calc(100dvh-48px))] sm:w-[412px] sm:rounded-[46px] sm:border-[10px] sm:border-navy-950 sm:shadow-device">
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
      <span className="absolute left-1/2 top-2 h-[22px] w-[92px] -translate-x-1/2 rounded-full bg-navy-950" />
      <span className="flex items-center gap-1.5">
        <Signal className="h-3.5 w-3.5" />
        <Wifi className="h-3.5 w-3.5" />
        <BatteryFull className="h-4 w-4" />
      </span>
    </div>
  );
}
