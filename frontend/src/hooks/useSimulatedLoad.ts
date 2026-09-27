import { useCallback, useEffect, useState } from "react";
import { useSession } from "./useApp";

type LoadStatus = "loading" | "ready" | "error";

/**
 * Simulates fetching a section from the server: a short skeleton, then content.
 * When the device is offline the request fails and the caller shows a retry state.
 */
export function useSimulatedLoad(delay = 450) {
  const { online } = useSession();
  const [status, setStatus] = useState<LoadStatus>("loading");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    setStatus("loading");
    const timer = window.setTimeout(() => setStatus(online ? "ready" : "error"), delay);
    return () => window.clearTimeout(timer);
  }, [online, delay, attempt]);

  const retry = useCallback(() => setAttempt((a) => a + 1), []);
  return { status, retry };
}
