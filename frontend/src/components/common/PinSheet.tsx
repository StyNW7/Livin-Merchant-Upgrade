import { useEffect, useState } from "react";
import { Delete, ShieldCheck } from "lucide-react";
import { BottomSheet } from "./Overlay";
import { cn } from "@/utils/cn";

export const DEFAULT_PIN = "123456";

interface PinSheetProps {
  open: boolean;
  title: string;
  subtitle?: string;
  onClose: () => void;
  /** Return true when the PIN is accepted. */
  onSubmit: (pin: string) => boolean;
  hint?: string;
}

export function PinSheet({ open, title, subtitle, onClose, onSubmit, hint }: PinSheetProps) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);

  useEffect(() => {
    if (open) {
      setPin("");
      setError(false);
    }
  }, [open]);

  useEffect(() => {
    if (pin.length !== 6) return;
    const timer = window.setTimeout(() => {
      if (!onSubmit(pin)) {
        setError(true);
        setPin("");
      }
    }, 180);
    return () => window.clearTimeout(timer);
  }, [pin, onSubmit]);

  const press = (digit: string) => {
    setError(false);
    setPin((p) => (p.length < 6 ? p + digit : p));
  };

  return (
    <BottomSheet open={open} onClose={onClose} title={title} subtitle={subtitle ?? "Enter your 6-digit transaction PIN"}>
      <div className="flex flex-col items-center pb-2">
        <div className="mb-2 flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy-600">
          <ShieldCheck className="h-6 w-6" />
        </div>
        <div className={cn("my-4 flex gap-3", error && "animate-[pop-in_200ms]")} aria-live="polite">
          {Array.from({ length: 6 }).map((_, i) => (
            <span
              key={i}
              className={cn(
                "h-3.5 w-3.5 rounded-full border-2 transition-colors",
                i < pin.length ? "border-navy bg-navy" : error ? "border-danger" : "border-navy-200",
              )}
            />
          ))}
        </div>
        <p className={cn("mb-4 h-4 text-xs", error ? "text-danger" : "text-ink-muted")}>
          {error ? "Incorrect PIN. Please try again." : hint ?? "Enter your 6-digit transaction PIN"}
        </p>
        <div className="grid w-full max-w-[300px] grid-cols-3 gap-2">
          {["1", "2", "3", "4", "5", "6", "7", "8", "9"].map((d) => (
            <PadKey key={d} onClick={() => press(d)} label={d} />
          ))}
          <span />
          <PadKey onClick={() => press("0")} label="0" />
          <button
            type="button"
            aria-label="Delete digit"
            onClick={() => setPin((p) => p.slice(0, -1))}
            className="flex h-14 items-center justify-center rounded-2xl text-ink-soft hover:bg-surface active:scale-95"
          >
            <Delete className="h-5 w-5" />
          </button>
        </div>
      </div>
    </BottomSheet>
  );
}

function PadKey({ label, onClick }: { label: string; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-14 rounded-2xl bg-surface text-xl font-bold text-ink transition-all hover:bg-navy-50 active:scale-95"
    >
      {label}
    </button>
  );
}
