import { useSyncExternalStore } from "react";
import { installStore, promptInstall } from "@/pwa/install";
import { serviceWorkerStore } from "@/pwa/serviceWorker";

/** Whether Livin Merchant can be installed on this device, and how. */
export function useInstallApp() {
  const state = useSyncExternalStore(installStore.subscribe, installStore.getSnapshot, installStore.getSnapshot);
  const installed = state.standalone || state.justInstalled;
  return {
    ...state,
    installed,
    /** Show install entry points (buttons, banners): the app is not installed yet. */
    installable: !installed,
    /** Worth asking automatically: one tap installs, or Safari's steps are short. */
    promptable: !installed && (state.canPrompt || state.platform === "ios-safari"),
    install: promptInstall,
  };
}

/** Service worker status: update available, offline ready. */
export function useServiceWorker() {
  return useSyncExternalStore(serviceWorkerStore.subscribe, serviceWorkerStore.getSnapshot, serviceWorkerStore.getSnapshot);
}
