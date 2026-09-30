import { useEffect, useState, type ReactNode } from "react";
import {
  AppWindow,
  CheckCircle2,
  Compass,
  Download,
  EllipsisVertical,
  Lock,
  MonitorDown,
  Share,
  ShieldCheck,
  SquarePlus,
  WifiOff,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { AppIcon } from "@/components/common/Brand";
import { useInstallApp } from "@/hooks/useInstallApp";
import { useUI } from "@/hooks/useApp";
import { OPEN_INSTALL_EVENT, openInstallSheet } from "@/pwa/events";
import type { InstallPlatform } from "@/pwa/install";
import { cn } from "@/utils/cn";

const SESSION_KEY = "livin-merchant:install-prompt-dismissed";
const BANNER_KEY = "livin-merchant:install-banner-dismissed";
/** Lets the splash screen finish before asking. */
const FIRST_ASK_DELAY = 2600;

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Zap, title: "Instant", text: "Opens in one tap" },
  { icon: WifiOff, title: "Offline", text: "Keeps working" },
  { icon: ShieldCheck, title: "Secure", text: "Mandiri protected" },
];

function readFlag(storage: "session" | "local", key: string) {
  try {
    return (storage === "session" ? window.sessionStorage : window.localStorage).getItem(key) === "1";
  } catch {
    return false;
  }
}

function writeFlag(storage: "session" | "local", key: string) {
  try {
    (storage === "session" ? window.sessionStorage : window.localStorage).setItem(key, "1");
  } catch {
    /* private browsing: the prompt may appear again next visit */
  }
}

type Step = { icon?: LucideIcon; text: ReactNode };

/** Manual install steps for browsers without a one-tap install dialog. */
function manualSteps(platform: InstallPlatform): { title: string; steps: Step[] } {
  switch (platform) {
    case "ios-safari":
      return {
        title: "Add to your Home Screen",
        steps: [
          { icon: Share, text: <>Tap <b>Share</b> in the Safari toolbar</> },
          { icon: SquarePlus, text: <>Scroll and choose <b>Add to Home Screen</b></> },
          { text: <>Tap <b>Add</b> — the Livin Merchant icon appears on your Home Screen</> },
        ],
      };
    case "ios-other":
      return {
        title: "Add to your Home Screen",
        steps: [
          { icon: Share, text: <>Tap <b>Share</b> next to the address bar</> },
          { icon: SquarePlus, text: <>Choose <b>Add to Home Screen</b></> },
          { text: <>If you don’t see it, open this page in <b>Safari</b> and try again</> },
        ],
      };
    case "mac-safari":
      return {
        title: "Add to your Dock",
        steps: [
          { icon: Share, text: <>Click <b>Share</b> in the Safari toolbar, or open the <b>File</b> menu</> },
          { icon: AppWindow, text: <>Choose <b>Add to Dock</b></> },
          { text: <>Click <b>Add</b> to finish</> },
        ],
      };
    case "android":
      return {
        title: "Install from the browser menu",
        steps: [
          { icon: EllipsisVertical, text: <>Tap the <b>menu</b> (three dots) at the top right</> },
          { icon: Download, text: <>Choose <b>Install app</b> or <b>Add to Home screen</b></> },
          { text: <>Tap <b>Install</b> to confirm</> },
        ],
      };
    case "firefox-android":
      return {
        title: "Install from the Firefox menu",
        steps: [
          { icon: EllipsisVertical, text: <>Tap the <b>menu</b> (three dots)</> },
          { icon: Download, text: <>Choose <b>Install</b> or <b>Add to Home screen</b></> },
          { text: <>Tap <b>Add</b> to confirm</> },
        ],
      };
    case "firefox-desktop":
      return {
        title: "Use Chrome or Edge to install",
        steps: [
          { icon: Compass, text: <>Firefox on computers can’t install web apps yet</> },
          { icon: MonitorDown, text: <>Open this page in <b>Chrome</b> or <b>Microsoft Edge</b></> },
          { text: <>Click <b>Install</b> in the address bar</> },
        ],
      };
    case "in-app":
      return {
        title: "Open in your browser first",
        steps: [
          { icon: EllipsisVertical, text: <>Tap the <b>menu</b> in this app’s browser</> },
          { icon: Compass, text: <>Choose <b>Open in Chrome</b> or <b>Open in Safari</b></> },
          { text: <>Then install Livin Merchant from there</> },
        ],
      };
    default:
      return {
        title: "Install from the address bar",
        steps: [
          { icon: MonitorDown, text: <>Click the <b>Install</b> icon at the right of the address bar</> },
          { icon: EllipsisVertical, text: <>Or open the browser <b>menu</b> and choose <b>Install Livin Merchant</b></> },
          { text: <>Confirm with <b>Install</b></> },
        ],
      };
  }
}

/** Browsers that can show a one-tap install dialog (possibly a moment after load). */
const ONE_TAP: InstallPlatform[] = ["android", "desktop", "unknown"];

/**
 * Asks visitors to install Livin Merchant when the website opens, and again whenever they choose
 * "Install app" from Home, More, Settings or the desktop side panel. Uses the browser's install
 * dialog where available and shows the exact Add to Home Screen steps everywhere else.
 */
export function InstallPrompt() {
  const app = useInstallApp();
  const { toast } = useUI();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [installing, setInstalling] = useState(false);
  const [showManual, setShowManual] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), FIRST_ASK_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  // Ask automatically once per visit, as soon as installing is possible.
  useEffect(() => {
    if (ready && app.promptable && !readFlag("session", SESSION_KEY)) setOpen(true);
  }, [ready, app.promptable]);

  // "Install app" buttons anywhere in the app.
  useEffect(() => {
    const show = () => {
      setShowManual(false);
      setOpen(true);
    };
    window.addEventListener(OPEN_INSTALL_EVENT, show);
    return () => window.removeEventListener(OPEN_INSTALL_EVENT, show);
  }, []);

  const close = () => {
    setOpen(false);
    writeFlag("session", SESSION_KEY);
  };

  const install = async () => {
    setInstalling(true);
    const outcome = await app.install();
    setInstalling(false);
    if (outcome === "accepted") toast("Livin Merchant is being installed on your device");
    else if (outcome === "dismissed") close();
    else setShowManual(true);
  };

  const oneTap = app.canPrompt || (ONE_TAP.includes(app.platform) && app.secure && !showManual);
  const mode = app.installed ? "installed" : oneTap ? "prompt" : "manual";
  const manual = manualSteps(app.platform);

  return (
    <BottomSheet open={open} onClose={close}>
      <div className="relative -mx-5 -mt-1 overflow-hidden px-5 pb-1 pt-3 text-center">
        <div className="brand-soft absolute inset-x-0 top-0 h-[120px] rounded-b-[40px]" aria-hidden />
        <div className="relative mx-auto w-fit">
          <span className="absolute -inset-4 rounded-[36%] bg-navy-300/40 blur-2xl" aria-hidden />
          <AppIcon size={84} className="relative animate-float shadow-float ring-4 ring-white" />
          {mode === "installed" && (
            <span className="absolute -bottom-1 -right-1 flex h-8 w-8 items-center justify-center rounded-full bg-success text-white ring-4 ring-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          )}
        </div>
        <h2 className="relative mt-5 text-[22px] font-extrabold tracking-tight text-ink">
          {mode === "installed" ? "Livin Merchant is installed" : "Install Livin Merchant"}
        </h2>
        <p className="relative mx-auto mt-1.5 max-w-[300px] text-[13.5px] leading-relaxed text-ink-muted">
          {mode === "installed"
            ? "Open it any time from your home screen, app list or taskbar."
            : "Get the app on your device — the fastest way to sell, get paid and grow."}
        </p>
      </div>

      {mode !== "installed" && (
        <ul className="mt-5 grid grid-cols-3 gap-2">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex flex-col items-center rounded-2xl border border-navy-100 bg-gradient-to-b from-white to-navy-50 px-2 py-3 text-center">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-navy text-white shadow-brand">
                <b.icon className="h-[18px] w-[18px]" />
              </span>
              <span className="mt-2 text-[13px] font-extrabold text-ink">{b.title}</span>
              <span className="text-[11.5px] leading-tight text-ink-muted">{b.text}</span>
            </li>
          ))}
        </ul>
      )}

      {mode !== "installed" && !app.secure && (
        <p className="mt-4 flex items-start gap-2.5 rounded-2xl border border-warning/30 bg-warning-soft p-3.5 text-[12.5px] leading-relaxed text-warning-dark">
          <Lock className="mt-0.5 h-4 w-4 shrink-0" />
          <span>
            Installing needs a secure link. Open Livin Merchant from its <b>https://</b> address (or <b>localhost</b> on this computer),
            then install.
          </span>
        </p>
      )}

      {mode === "manual" && (
        <div className="mt-4 rounded-2xl bg-surface p-4">
          <p className="text-[12px] font-extrabold uppercase tracking-wide text-navy-600">{manual.title}</p>
          <ol className="mt-3 space-y-3">
            {manual.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3 text-[13px] leading-snug text-ink-soft [&_b]:font-bold [&_b]:text-ink">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-navy text-[12px] font-extrabold text-white shadow-brand">
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">{s.text}</span>
                {s.icon && (
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-surface-line bg-white text-navy-600">
                    <s.icon className="h-4 w-4" />
                  </span>
                )}
              </li>
            ))}
          </ol>
        </div>
      )}

      <div className="mt-5 space-y-2">
        {mode === "prompt" ? (
          <>
            <Button block size="lg" variant="accent" loading={installing} leftIcon={<Download className="h-5 w-5" />} onClick={install}>
              {installing ? "Preparing install…" : "Install app"}
            </Button>
            <Button block variant="ghost" onClick={close}>
              Not now
            </Button>
          </>
        ) : (
          <Button block size="lg" onClick={close}>
            {mode === "installed" ? "Done" : "Got it"}
          </Button>
        )}
      </div>
    </BottomSheet>
  );
}

/**
 * Slim, dismissible install card for Home and the sign-in screens. Stays until the app is
 * installed or the merchant closes it.
 */
export function InstallBanner({ className, tone = "light" }: { className?: string; tone?: "light" | "brand" }) {
  const app = useInstallApp();
  const [hidden, setHidden] = useState(() => readFlag("local", BANNER_KEY));
  if (!app.installable || hidden) return null;
  return (
    <div
      className={cn(
        "relative flex animate-pop-in items-center gap-3 overflow-hidden rounded-3xl p-3 pr-2",
        tone === "light" ? "border border-navy-100 bg-white shadow-card" : "border border-white/30 bg-white/15 text-white backdrop-blur",
        className,
      )}
    >
      <AppIcon size={44} className="ring-2 ring-white" />
      <button type="button" onClick={openInstallSheet} className="min-w-0 flex-1 text-left">
        <span className={cn("block text-[14px] font-extrabold tracking-tight", tone === "light" ? "text-ink" : "text-white")}>Get the app</span>
        <span className={cn("block truncate text-[12px]", tone === "light" ? "text-ink-muted" : "text-white/90")}>Faster access, even offline</span>
      </button>
      <button
        type="button"
        onClick={openInstallSheet}
        className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gold px-3 text-[13px] font-bold text-navy-900 shadow-glow active:scale-95"
      >
        <Download className="h-4 w-4" /> Install
      </button>
      <button
        type="button"
        aria-label="Hide install suggestion"
        onClick={() => {
          writeFlag("local", BANNER_KEY);
          setHidden(true);
        }}
        className={cn(
          "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
          tone === "light" ? "text-ink-faint hover:bg-surface" : "text-white/90 hover:bg-white/20",
        )}
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}

/** Compact "Install" pill for headers. Hidden once the app is installed. */
export function InstallChip({ className }: { className?: string }) {
  const app = useInstallApp();
  if (!app.installable) return null;
  return (
    <button
      type="button"
      onClick={openInstallSheet}
      className={cn(
        "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full bg-gold px-3.5 text-[12.5px] font-bold text-navy-900 shadow-glow transition active:scale-95",
        className,
      )}
    >
      <Download className="h-4 w-4" /> Install app
    </button>
  );
}
