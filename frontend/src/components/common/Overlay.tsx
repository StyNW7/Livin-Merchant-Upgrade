import { useEffect, useRef, useState, type ReactNode } from "react";
import { createPortal } from "react-dom";
import { X } from "lucide-react";
import { cn } from "@/utils/cn";

export const OVERLAY_ROOT_ID = "shell-overlay";

/** Portals overlays into the app frame so sheets and dialogs stay inside the app window. */
function OverlayPortal({ children }: { children: ReactNode }) {
  const [root, setRoot] = useState<HTMLElement | null>(null);
  useEffect(() => setRoot(document.getElementById(OVERLAY_ROOT_ID) ?? document.body), []);
  return root ? createPortal(children, root) : null;
}

function useEscape(open: boolean, onClose: () => void) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [open, onClose]);
}

function useAutoFocus<T extends HTMLElement>(open: boolean) {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (open) ref.current?.focus();
  }, [open]);
  return ref;
}

interface ModalProps {
  open: boolean;
  onClose: () => void;
  children: ReactNode;
  className?: string;
  labelledBy?: string;
}

export function Modal({ open, onClose, children, className, labelledBy }: ModalProps) {
  useEscape(open, onClose);
  const ref = useAutoFocus<HTMLDivElement>(open);
  if (!open) return null;
  return (
    <OverlayPortal>
      <div className="pointer-events-auto absolute inset-0 z-50 flex items-center justify-center p-5">
        <div className="absolute inset-0 animate-fade-in bg-navy-950/40 backdrop-blur-[3px]" onClick={onClose} />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-labelledby={labelledBy}
          tabIndex={-1}
          className={cn(
            "relative w-full max-w-[360px] animate-pop-in rounded-[30px] bg-white p-6 shadow-float ring-1 ring-navy-100 focus:outline-none",
            className,
          )}
        >
          {children}
        </div>
      </div>
    </OverlayPortal>
  );
}

interface BottomSheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function BottomSheet({ open, onClose, title, subtitle, children, footer, className }: BottomSheetProps) {
  useEscape(open, onClose);
  const ref = useAutoFocus<HTMLDivElement>(open);
  if (!open) return null;
  return (
    <OverlayPortal>
      <div className="pointer-events-auto absolute inset-0 z-50 flex flex-col justify-end">
        <div className="absolute inset-0 animate-fade-in bg-navy-950/35 backdrop-blur-[2px]" onClick={onClose} />
        <div
          ref={ref}
          role="dialog"
          aria-modal="true"
          aria-label={title}
          tabIndex={-1}
          className={cn(
            "relative flex max-h-[88%] animate-sheet-up flex-col rounded-t-[30px] bg-white shadow-[0_-12px_40px_-12px_rgba(16,38,74,0.25)] focus:outline-none",
            className,
          )}
        >
          <div className="flex justify-center pb-1 pt-2.5">
            <span className="h-1.5 w-11 rounded-full bg-navy-100" aria-hidden />
          </div>
          {title && (
            <div className="flex items-start justify-between gap-3 px-5 pb-3 pt-1">
              <div className="min-w-0">
                <h2 className="text-[18px] font-extrabold tracking-tight text-ink">{title}</h2>
                {subtitle && <p className="mt-0.5 text-[13px] text-ink-muted">{subtitle}</p>}
              </div>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close"
                className="-mr-1 flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-surface text-ink-soft hover:bg-navy-50"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}
          <div className="app-scroll min-h-0 flex-1 overflow-y-auto px-5 pb-5">{children}</div>
          {footer && <div className="pb-safe border-t border-surface-line px-5 pt-3">{footer}</div>}
        </div>
      </div>
    </OverlayPortal>
  );
}

export { OverlayPortal };
