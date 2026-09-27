import { useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
import type { AppMode, ScenarioId } from "@/types";
import { guestProfile, merchantProfile } from "@/data/merchant";
import { outlets } from "@/data/outlets";
import { usePersistentState } from "@/hooks/usePersistentState";
import { STORAGE_KEYS, clearAppStorage } from "@/utils/storage";
import { SessionContext, type SessionState } from "./contexts";

export function SessionProvider({ children }: { children: ReactNode }) {
  const [mode, setMode] = usePersistentState<AppMode>(STORAGE_KEYS.mode, "none");
  const [onboarded, setOnboarded] = usePersistentState<boolean>(STORAGE_KEYS.onboarded, false);
  const [outletId, setOutletId] = usePersistentState<string>(STORAGE_KEYS.outlet, "gading-serpong");
  const [insightConsent, setInsightConsent] = usePersistentState<boolean>(STORAGE_KEYS.consent, true);
  const [scenario, setScenario] = usePersistentState<ScenarioId>(STORAGE_KEYS.scenario, "A");
  const [hints, setHints] = usePersistentState<string[]>(STORAGE_KEYS.hints, []);
  const [online, setOnline] = useState(() => (typeof navigator === "undefined" ? true : navigator.onLine));

  useEffect(() => {
    const up = () => setOnline(true);
    const down = () => setOnline(false);
    window.addEventListener("online", up);
    window.addEventListener("offline", down);
    return () => {
      window.removeEventListener("online", up);
      window.removeEventListener("offline", down);
    };
  }, []);

  const merchant = mode === "guest" ? guestProfile : merchantProfile;
  const outlet = outlets.find((o) => o.id === outletId && o.status === "Active") ?? outlets[0];

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
  const hintSeen = useCallback((id: string) => hints.includes(id), [hints]);
  const dismissHint = useCallback(
    (id: string) => setHints((prev) => (prev.includes(id) ? prev : [...prev, id])),
    [setHints],
  );

  const value = useMemo<SessionState>(
    () => ({
      mode,
      isGuest: mode === "guest",
      isMerchant: mode === "merchant",
      onboarded,
      merchant,
      outletId: outlet.id,
      outletName: `${merchant.name} — ${outlet.area}`,
      scenario,
      insightConsent,
      online,
      completeOnboarding,
      loginAsMerchant,
      exploreAsGuest,
      logout,
      setOutletId,
      setScenario,
      setInsightConsent,
      hintSeen,
      dismissHint,
      resetDemo,
    }),
    [
      mode,
      onboarded,
      merchant,
      outlet,
      scenario,
      insightConsent,
      online,
      completeOnboarding,
      loginAsMerchant,
      exploreAsGuest,
      logout,
      setOutletId,
      setScenario,
      setInsightConsent,
      hintSeen,
      dismissHint,
      resetDemo,
    ],
  );

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>;
}
