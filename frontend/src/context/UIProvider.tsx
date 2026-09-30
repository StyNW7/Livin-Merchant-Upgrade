import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Info, Lock, TriangleAlert, UserPlus } from "lucide-react";
import { Modal, OverlayPortal } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { PinSheet, DEFAULT_PIN } from "@/components/common/PinSheet";
import { BusinessAssistant } from "@/components/assistant/BusinessAssistant";
import { MissionCelebration, type Celebration } from "@/components/growth/MissionCelebration";
import { useData, useSession } from "@/hooks/useApp";
import { readStorage } from "@/utils/storage";
import { cn } from "@/utils/cn";
import { UIContext, type ConfirmOptions, type ToastTone, type UIState } from "./contexts";

interface ToastItem {
  id: number;
  message: string;
  tone: ToastTone;
}

const toastIcons = {
  success: CheckCircle2,
  info: Info,
  warning: TriangleAlert,
  error: AlertCircle,
};

const toastTones = {
  success: "bg-success-soft text-success",
  info: "bg-navy-50 text-navy-600",
  warning: "bg-gold-100 text-gold-700",
  error: "bg-danger-soft text-danger",
};

export function UIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { isGuest, logout } = useSession();
  const { settings } = useData();
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const [gate, setGate] = useState<string | null>(null);
  const [confirmState, setConfirmState] = useState<ConfirmOptions | null>(null);
  const [pinRequest, setPinRequest] = useState<{ title: string; onSuccess: () => void } | null>(null);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [celebration, setCelebration] = useState<Celebration | null>(null);
  const idRef = useRef(0);

  const toast = useCallback((message: string, tone: ToastTone = "success") => {
    const id = ++idRef.current;
    setToasts((prev) => [...prev.slice(-2), { id, message, tone }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((t) => t.id !== id)), 2800);
  }, []);

  const requireAccount = useCallback(
    (feature?: string) => {
      if (!isGuest) return true;
      setGate(feature ?? "this feature");
      return false;
    },
    [isGuest],
  );

  const confirm = useCallback((options: ConfirmOptions) => setConfirmState(options), []);
  const requirePin = useCallback((title: string, onSuccess: () => void) => setPinRequest({ title, onSuccess }), []);
  const openAssistant = useCallback(() => setAssistantOpen(true), []);
  const haptic = useCallback(
    (pattern: number | number[] = 12) => {
      if (!settings.haptics) return;
      try {
        navigator.vibrate?.(pattern);
      } catch {
        /* vibration is optional */
      }
    },
    [settings.haptics],
  );
  const celebrate = useCallback(
    (c: Celebration) => {
      haptic([20, 60, 30]);
      setCelebration(c);
    },
    [haptic],
  );

  const submitPin = useCallback(
    (pin: string) => {
      const saved = readStorage<string>("pin", DEFAULT_PIN);
      if (pin !== saved) return false;
      const request = pinRequest;
      setPinRequest(null);
      request?.onSuccess();
      return true;
    },
    [pinRequest],
  );

  const value = useMemo<UIState>(
    () => ({ toast, requireAccount, confirm, requirePin, openAssistant, celebrate, haptic }),
    [toast, requireAccount, confirm, requirePin, openAssistant, celebrate, haptic],
  );

  const leaveGuest = (to: string) => {
    setGate(null);
    logout();
    navigate(to);
  };

  return (
    <UIContext.Provider value={value}>
      {children}

      <OverlayPortal>
        <div className="pointer-events-none absolute inset-x-0 top-3 z-[60] flex flex-col items-center gap-2 px-4" aria-live="polite">
          {toasts.map((t) => {
            const Icon = toastIcons[t.tone];
            return (
              <div
                key={t.id}
                role="status"
                className="pointer-events-auto flex w-full max-w-[360px] animate-toast-in items-center gap-3 rounded-2xl border border-surface-line bg-white/95 py-2.5 pl-2.5 pr-4 text-[13px] font-semibold text-ink shadow-float backdrop-blur"
              >
                <span className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-xl", toastTones[t.tone])}>
                  <Icon className="h-[18px] w-[18px]" />
                </span>
                <span className="min-w-0 flex-1 leading-snug">{t.message}</span>
              </div>
            );
          })}
        </div>
      </OverlayPortal>

      <Modal open={gate !== null} onClose={() => setGate(null)} labelledBy="gate-title">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-navy-600">
          <Lock className="h-6 w-6" />
        </div>
        <h2 id="gate-title" className="text-xl font-bold text-ink">
          Ready to use this feature for your business?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          You are exploring Livin Merchant. Log in with your Mandiri account to use {gate} for your own business.
        </p>
        <div className="mt-6 space-y-2.5">
          <Button block size="lg" onClick={() => leaveGuest("/login")}>
            Login with Mandiri
          </Button>
          <Button block variant="secondary" leftIcon={<UserPlus className="h-4 w-4" />} onClick={() => leaveGuest("/create-account")}>
            Create Mandiri Account
          </Button>
          <Button block variant="ghost" onClick={() => setGate(null)}>
            Continue Exploring
          </Button>
        </div>
      </Modal>

      <Modal open={confirmState !== null} onClose={() => setConfirmState(null)} labelledBy="confirm-title">
        {confirmState && (
          <>
            <h2 id="confirm-title" className="text-lg font-bold text-ink">
              {confirmState.title}
            </h2>
            <p className="mt-2 text-sm leading-relaxed text-ink-muted">{confirmState.message}</p>
            <div className="mt-6 grid grid-cols-2 gap-2.5">
              <Button variant="secondary" onClick={() => setConfirmState(null)}>
                {confirmState.cancelLabel ?? "Cancel"}
              </Button>
              <Button
                variant={confirmState.tone === "danger" ? "danger" : "primary"}
                onClick={() => {
                  const action = confirmState.onConfirm;
                  setConfirmState(null);
                  action();
                }}
              >
                {confirmState.confirmLabel ?? "Confirm"}
              </Button>
            </div>
          </>
        )}
      </Modal>

      <PinSheet open={pinRequest !== null} title={pinRequest?.title ?? ""} onClose={() => setPinRequest(null)} onSubmit={submitPin} />

      <BusinessAssistant open={assistantOpen} onClose={() => setAssistantOpen(false)} />

      <MissionCelebration celebration={celebration} onClose={() => setCelebration(null)} />
    </UIContext.Provider>
  );
}
