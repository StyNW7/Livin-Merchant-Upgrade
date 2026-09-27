import { useEffect, useState, type ReactNode } from "react";
import { CheckCircle2, Download, EllipsisVertical, LayoutGrid, Share, SquarePlus, WifiOff, Zap, type LucideIcon } from "lucide-react";
import { BottomSheet } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { AppIcon } from "@/components/common/Brand";
import { useInstallApp } from "@/hooks/useInstallApp";
import { useUI } from "@/hooks/useApp";
import { OPEN_INSTALL_EVENT } from "@/pwa/events";

const SESSION_KEY = "livin-merchant:install-prompt-dismissed";
/** Lets the splash screen finish before asking. */
const FIRST_ASK_DELAY = 2600;

const BENEFITS: { icon: LucideIcon; title: string; text: string }[] = [
  { icon: Zap, title: "Opens instantly", text: "Start a sale straight from your home screen." },
  { icon: WifiOff, title: "Keeps working offline", text: "Your cashier and reports stay available when the signal drops." },
  { icon: LayoutGrid, title: "Quick actions", text: "Press and hold the icon for New Sale, QR Payment and Growth." },
];

const dismissedThisSession = () => {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === "1";
  } catch {
    return false;
  }
};

/**
 * Asks visitors to install Livin Merchant when the website opens, and again whenever they choose
 * "Install app" from More or Settings. Uses the browser's install dialog where available and
 * shows Add to Home Screen steps on iPhone and iPad.
 */
export function InstallPrompt() {
  const app = useInstallApp();
  const { toast } = useUI();
  const [open, setOpen] = useState(false);
  const [ready, setReady] = useState(false);
  const [installing, setInstalling] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => setReady(true), FIRST_ASK_DELAY);
    return () => window.clearTimeout(timer);
  }, []);

  // Ask automatically once per visit, as soon as installing is possible.
  useEffect(() => {
    if (ready && app.installable && !dismissedThisSession()) setOpen(true);
  }, [ready, app.installable]);

  // "Install app" from More or Settings.
  useEffect(() => {
    const show = () => setOpen(true);
    window.addEventListener(OPEN_INSTALL_EVENT, show);
    return () => window.removeEventListener(OPEN_INSTALL_EVENT, show);
  }, []);

  const close = () => {
    setOpen(false);
    try {
      window.sessionStorage.setItem(SESSION_KEY, "1");
    } catch {
      /* private browsing: the prompt may appear again next visit */
    }
  };

  const install = async () => {
    setInstalling(true);
    const accepted = await app.install();
    setInstalling(false);
    if (accepted) toast("Livin Merchant is being added to your device");
    else close();
  };

  const mode = app.justInstalled || app.standalone ? "installed" : app.canPrompt ? "prompt" : app.ios ? "ios" : "manual";

  return (
    <BottomSheet open={open} onClose={close}>
      <div className="flex flex-col items-center pb-1 pt-2 text-center">
        <div className="relative">
          <span className="absolute -inset-3 rounded-[34%] bg-sky-400/20 blur-xl" aria-hidden />
          <AppIcon size={76} className="relative shadow-float" />
          {mode === "installed" && (
            <span className="absolute -bottom-1 -right-1 flex h-7 w-7 items-center justify-center rounded-full bg-success text-white ring-4 ring-white">
              <CheckCircle2 className="h-4 w-4" />
            </span>
          )}
        </div>
        <h2 className="mt-5 text-[21px] font-extrabold tracking-tight text-ink">
          {mode === "installed" ? "Livin Merchant is installed" : "Install Livin Merchant"}
        </h2>
        <p className="mt-1.5 max-w-[300px] text-[13.5px] leading-relaxed text-ink-muted">
          {mode === "installed"
            ? "Open it any time from your home screen or app list."
            : "Get the app on your device for the fastest way to sell, get paid and grow."}
        </p>
      </div>

      {mode !== "installed" && (
        <ul className="mt-5 space-y-3">
          {BENEFITS.map((b) => (
            <li key={b.title} className="flex items-start gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-navy-50 text-navy">
                <b.icon className="h-5 w-5" />
              </span>
              <span>
                <span className="block text-[14px] font-bold text-ink">{b.title}</span>
                <span className="block text-[12.5px] leading-snug text-ink-muted">{b.text}</span>
              </span>
            </li>
          ))}
        </ul>
      )}

      {mode === "ios" && (
        <ol className="mt-5 space-y-2.5 rounded-2xl bg-surface p-4 text-[13px] text-ink-soft">
          <Step n={1}>
            Tap <Share className="mx-1 inline h-4 w-4 text-sky-600" aria-label="Share" /> in the Safari toolbar
          </Step>
          <Step n={2}>
            Choose <span className="font-bold text-ink">Add to Home Screen</span> <SquarePlus className="ml-1 inline h-4 w-4 text-ink" aria-hidden />
          </Step>
          <Step n={3}>
            Tap <span className="font-bold text-ink">Add</span> to finish
          </Step>
        </ol>
      )}

      {mode === "manual" && (
        <p className="mt-5 flex items-start gap-2 rounded-2xl bg-surface p-4 text-[13px] leading-relaxed text-ink-soft">
          <EllipsisVertical className="mt-0.5 h-4 w-4 shrink-0 text-navy" />
          Open your browser menu and choose <span className="font-bold text-ink">Install app</span> or{" "}
          <span className="font-bold text-ink">Add to Home screen</span>.
        </p>
      )}

      <div className="mt-6 space-y-2">
        {mode === "prompt" ? (
          <>
            <Button block size="lg" loading={installing} leftIcon={<Download className="h-5 w-5" />} onClick={install}>
              Install app
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

function Step({ n, children }: { n: number; children: ReactNode }) {
  return (
    <li className="flex items-center gap-3">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-navy text-[12px] font-bold text-white">{n}</span>
      <span>{children}</span>
    </li>
  );
}
