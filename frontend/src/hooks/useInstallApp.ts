import { useSyncExternalStore } from "react";
import { installStore, promptInstall } from "@/pwa/install";

/** Whether Livin Merchant can be installed on this device, and how. */
export function useInstallApp() {
  const state = useSyncExternalStore(installStore.subscribe, installStore.getSnapshot, installStore.getSnapshot);
  return {
    ...state,
    /** Something useful can be offered: the native dialog, or Add to Home Screen steps on iOS. */
    installable: !state.standalone && !state.justInstalled && (state.canPrompt || state.ios),
    install: promptInstall,
  };
}
