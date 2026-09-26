import { useCallback, useMemo, type ReactNode } from "react";
import type { AppMode } from "@/types";
import { guestProfile, merchantProfile } from "@/data/merchant";
import { outlets } from "@/data/outlets";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS, clearAppStorage } from "@/utils/storage";
import { SessionContext, type SessionState } from "./contexts";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = usePersistentState<AppMode>(STORAGE_KEYS.mode, "none");
  const [onboarded, setOnboarded] = usePersistentState<boolean>(STORAGE_KEYS.onboarded, false);
  const [outletId, setOutletId] = usePersistentState<string>(STORAGE_KEYS.outlet, "gading-serpong");
  const [insightConsent, setInsightConsent] = usePersistentState<boolean>(STORAGE_KEYS.consent, false);

  const merchant = mode === "guest" ? guestProfile : merchantProfile;
  const outlet = outlets.find((o) => o.id === outletId) ?? outlets[0];

  const completeOnboarding = useCallback(() => setOnboarded(true), [setOnboarded]);
  const loginAsMerchant = useCallback(() => {
    setOnboarded(true);
    setMode("merchant");
  }, [setMode, setOnboarded]);
  const exploreAsGuest = useCallback(() => {
    setOnboarded(true);
    setMode("guest");
    setOutletId("gading-serpong");
  }, [setMode, setOnboarded, setOutletId]);
  const logout = useCallback(() => setMode("none"), [setMode]);
  const resetDemo = useCallback(() => {
    clearAppStorage();
    window.location.assign("/");
  }, []);

  const value = useMemo<SessionState>(
    () => ({
      mode,
      isGuest: mode === "guest",
      isMerchant: mode === "merchant",
      onboarded,
      merchant,
      outletId: outlet.id,
      outletName: `${merchant.name} — ${outlet.area}`,
      insightConsent,
      completeOnboarding,
      loginAsMerchant,
      exploreAsGuest,
      logout,
      setOutletId,
      setInsightConsent,
      resetDemo,
    }),
    [
      mode,
      onboarded,
      merchant,
      outlet,
      insightConsent,
      completeOnboarding,
      loginAsMerchant,
      exploreAsGuest,
      logout,
      setOutletId,
      setInsightConsent,
      resetDemo,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
