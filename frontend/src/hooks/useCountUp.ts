import { useEffect, useRef, useState } from "react";

const prefersReducedMotion = () =>
  typeof window !== "undefined" && typeof window.matchMedia === "function" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;

/**
 * Animates a number towards `target`. The first render starts from `from` (0 by default) so key
 * figures "count up" when a screen opens; later changes animate from the previous value.
 */
export function useCountUp(target: number, { duration = 900, from = 0 }: { duration?: number; from?: number } = {}) {
  const [value, setValue] = useState(() => (prefersReducedMotion() ? target : from));
  const current = useRef(value);

  useEffect(() => {
    if (prefersReducedMotion()) {
      current.current = target;
      setValue(target);
      return;
    }
    const start = current.current;
    const delta = target - start;
    if (delta === 0) return;
    let frame = 0;
    const began = performance.now();
    const tick = (now: number) => {
      const t = Math.min(1, (now - began) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      const next = t === 1 ? target : start + delta * eased;
      current.current = next;
      setValue(next);
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [target, duration]);

  return value;
}

/** False on the first paint, true right after, so CSS transitions can animate from an empty state. */
export function useMounted() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);
  return mounted;
}
