/**
 * Install state for the Livin Merchant app (PWA).
 *
 * Chrome, Edge and Samsung Internet fire `beforeinstallprompt` once, early in the page life, so
 * this module is imported first in main.tsx and keeps the event until the user chooses to install.
 * Safari on iPhone and iPad has no install event; there the app is added from the Share menu.
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

export interface InstallState {
  /** The browser can show its own install dialog right now. */
  canPrompt: boolean;
  /** Running as the installed app (home screen / desktop window). */
  standalone: boolean;
  /** iPhone or iPad Safari: install through Share > Add to Home Screen. */
  ios: boolean;
  /** Installed during this visit. */
  justInstalled: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const detectStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

const detectIos = () => {
  if (typeof navigator === "undefined") return false;
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  return (/iphone|ipad|ipod/i.test(ua) || iPadOs) && !/crios|fxios|edgios/i.test(ua);
};

let state: InstallState = { canPrompt: false, standalone: detectStandalone(), ios: detectIos(), justInstalled: false };

function update(patch: Partial<InstallState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferred = event as BeforeInstallPromptEvent;
    update({ canPrompt: true });
  });
  window.addEventListener("appinstalled", () => {
    deferred = null;
    update({ canPrompt: false, justInstalled: true });
  });
  window.matchMedia?.("(display-mode: standalone)").addEventListener?.("change", () => update({ standalone: detectStandalone() }));
}

export const installStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
};

/** Opens the browser's install dialog. Resolves to true when the user accepts. */
export async function promptInstall(): Promise<boolean> {
  if (!deferred) return false;
  const event = deferred;
  deferred = null;
  update({ canPrompt: false });
  await event.prompt();
  const choice = await event.userChoice;
  if (choice.outcome === "accepted") {
    update({ justInstalled: true });
    return true;
  }
  return false;
}
