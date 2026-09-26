import { useCallback, useState } from "react";
import { readStorage, writeStorage } from "@/utils/storage";

/**
 * useState that mirrors to localStorage. When `persist` is false (Explore Mode),
 * changes live in memory only and never overwrite a merchant's saved data.
 */
export function usePersistentState<T>(key: string, initial: T, persist = true) {
  const [value, setValue] = useState<T>(() => (persist ? readStorage(key, initial) : initial));

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === "function" ? (next as (prev: T) => T)(prev) : next;
        if (persist) writeStorage(key, resolved);
        return resolved;
      });
    },
    [key, persist],
  );

  return [value, update] as const;
}
