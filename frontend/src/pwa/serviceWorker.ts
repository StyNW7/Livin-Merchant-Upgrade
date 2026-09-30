import { registerSW } from "virtual:pwa-register";

/**
 * Registers the service worker as soon as the app starts (not from inside a React screen), so
 * offline support and installability never depend on which page opened first.
 */

/** Checks for a new version every hour while the app is open. */
const UPDATE_CHECK_MS = 60 * 60 * 1000;

export interface ServiceWorkerState {
  /** A new version has been downloaded and is waiting. */
  needRefresh: boolean;
  /** Everything is cached; the app works without a connection. */
  offlineReady: boolean;
  /** The service worker could not be registered (e.g. plain HTTP on a LAN address). */
  failed: boolean;
}

let registration: ServiceWorkerRegistration | null = null;
let state: ServiceWorkerState = { needRefresh: false, offlineReady: false, failed: false };
const listeners = new Set<() => void>();

function update(patch: Partial<ServiceWorkerState>) {
  state = { ...state, ...patch };
  listeners.forEach((l) => l());
}

let updateSW: ((reload?: boolean) => Promise<void>) | null = null;

export function startServiceWorker() {
  if (typeof window === "undefined" || !("serviceWorker" in navigator)) {
    update({ failed: true });
    return;
  }
  if (updateSW) return;
  updateSW = registerSW({
    immediate: true,
    onNeedRefresh: () => update({ needRefresh: true }),
    onOfflineReady: () => update({ offlineReady: true }),
    onRegisteredSW(_url, value) {
      if (!value) return;
      registration = value;
      window.setInterval(() => value.update().catch(() => undefined), UPDATE_CHECK_MS);
    },
    onRegisterError: () => update({ failed: true }),
  });
}

export const serviceWorkerStore = {
  subscribe(listener: () => void) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot: () => state,
};

/** Activates the waiting version and reloads. */
export function applyUpdate() {
  return updateSW?.(true);
}

export function dismissUpdate() {
  update({ needRefresh: false });
}

export function acknowledgeOfflineReady() {
  update({ offlineReady: false });
}

/**
 * Asks the server for a newer version. Resolves to "updating" when one was found (the update
 * banner then appears), "latest" when this is already the newest version, or "unavailable".
 */
export async function checkForUpdate(): Promise<"updating" | "latest" | "unavailable"> {
  if (!registration) return "unavailable";
  try {
    await registration.update();
    return registration.installing || registration.waiting ? "updating" : "latest";
  } catch {
    return "unavailable";
  }
}
