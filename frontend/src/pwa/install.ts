/**
 * Install state for the Livin Merchant app (PWA).
 *
 * Chrome, Edge, Opera and Samsung Internet fire `beforeinstallprompt` once, early in the page life,
 * so this module is imported first in main.tsx and keeps the event until the user chooses to
 * install. Safari (iPhone, iPad and Mac) and Firefox have no install event; there the app is added
 * from the browser's own menu, and the install sheet shows the exact steps.
 */

export interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{ outcome: "accepted" | "dismissed"; platform: string }>;
  prompt: () => Promise<void>;
}

/** How this browser installs web apps. Drives the steps shown in the install sheet. */
export type InstallPlatform =
  | "ios-safari"
  | "ios-other"
  | "mac-safari"
  | "android"
  | "desktop"
  | "firefox-android"
  | "firefox-desktop"
  | "in-app"
  | "unknown";

export interface InstallState {
  /** The browser can show its own install dialog right now. */
  canPrompt: boolean;
  /** Running as the installed app (home screen / desktop window). */
  standalone: boolean;
  /** iPhone or iPad: install through Share > Add to Home Screen. */
  ios: boolean;
  /** Installed during this visit. */
  justInstalled: boolean;
  /** Browser family, used to show the right manual steps. */
  platform: InstallPlatform;
  /** Service workers and installing need HTTPS (or localhost). */
  secure: boolean;
}

let deferred: BeforeInstallPromptEvent | null = null;
const listeners = new Set<() => void>();

const detectStandalone = () =>
  typeof window !== "undefined" &&
  (window.matchMedia?.("(display-mode: standalone)").matches ||
    window.matchMedia?.("(display-mode: fullscreen)").matches ||
    window.matchMedia?.("(display-mode: minimal-ui)").matches ||
    window.matchMedia?.("(display-mode: window-controls-overlay)").matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true);

function detectPlatform(): InstallPlatform {
  if (typeof navigator === "undefined") return "unknown";
  const ua = navigator.userAgent;
  const iPadOs = navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1;
  const ios = /iphone|ipad|ipod/i.test(ua) || iPadOs;
  if (/FBAN|FBAV|Instagram|Line\/|WhatsApp|Twitter|TikTok|; wv\)/i.test(ua)) return "in-app";
  if (ios) return /crios|fxios|edgios|opios/i.test(ua) ? "ios-other" : "ios-safari";
  const android = /android/i.test(ua);
  if (/firefox|fxios/i.test(ua)) return android ? "firefox-android" : "firefox-desktop";
  if (android) return "android";
  const safari = /safari/i.test(ua) && !/chrome|chromium|crios|edg|opr/i.test(ua);
  if (safari && /macintosh/i.test(ua)) return "mac-safari";
  if (/chrome|chromium|edg|opr/i.test(ua)) return "desktop";
  return "unknown";
}

const platform = detectPlatform();

let state: InstallState = {
  canPrompt: false,
  standalone: detectStandalone(),
  ios: platform === "ios-safari" || platform === "ios-other",
  justInstalled: false,
  platform,
  secure: typeof window === "undefined" ? true : window.isSecureContext,
};

function update(patch: Partial<InstallState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

if (typeof window !== "undefined") {
  window.addEventListener("beforeinstallprompt", (event) => {
    // Keep the event so the app can show its own, richer install sheet first.
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

/**
 * Waits briefly for the browser's install event. Chromium can fire it a moment after the page
 * loads (once the service worker is ready), so an early tap on "Install" should not give up.
 */
export function waitForInstallPrompt(timeout = 3500): Promise<boolean> {
  if (deferred) return Promise.resolve(true);
  return new Promise((resolve) => {
    const timer = window.setTimeout(() => {
      unsubscribe();
      resolve(Boolean(deferred));
    }, timeout);
    const unsubscribe = installStore.subscribe(() => {
      if (!deferred) return;
      window.clearTimeout(timer);
      unsubscribe();
      resolve(true);
    });
  });
}

export type InstallOutcome = "accepted" | "dismissed" | "unavailable";

/** Opens the browser's install dialog. */
export async function promptInstall(): Promise<InstallOutcome> {
  if (!deferred && !(await waitForInstallPrompt())) return "unavailable";
  const event = deferred!;
  deferred = null;
  update({ canPrompt: false });
  try {
    await event.prompt();
    const choice = await event.userChoice;
    if (choice.outcome === "accepted") {
      update({ justInstalled: true });
      return "accepted";
    }
    return "dismissed";
  } catch {
    return "unavailable";
  }
}
