import { useCallback, useMemo, useRef, useState, type ReactNode } from "react";
import { useNavigate } from "react-router-dom";
import { AlertCircle, CheckCircle2, Info, Lock, TriangleAlert, UserPlus } from "lucide-react";
import { Modal, OverlayPortal } from "@/components/common/Overlay";
import { Button } from "@/components/common/Button";
import { PinSheet, DEFAULT_PIN } from "@/components/common/PinSheet";
import { BusinessAssistant } from "@/components/assistant/BusinessAssistant";
import { MissionCelebration, type Celebration } from "@/components/growth/MissionCelebration";
import { useSession } from "@/hooks/useApp";
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
  success: "text-success",
  info: "text-sky-400",
  warning: "text-gold",
  error: "text-danger",
};

export function UIProvider({ children }: { children: ReactNode }) {
  const navigate = useNavigate();
  const { isGuest, logout } = useSession();
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
  const celebrate = useCallback((c: Celebration) => setCelebration(c), []);

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
    () => ({ toast, requireAccount, confirm, requirePin, openAssistant, celebrate }),
    [toast, requireAccount, confirm, requirePin, openAssistant, celebrate],
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
                className="pointer-events-auto flex w-full max-w-[360px] animate-toast-in items-center gap-2.5 rounded-2xl bg-navy-950/95 px-4 py-3 text-[13px] font-medium text-white shadow-float backdrop-blur"
              >
                <Icon className={cn("h-[18px] w-[18px] shrink-0", toastTones[t.tone])} />
                <span className="min-w-0 flex-1">{t.message}</span>
              </div>
            );
          })}
        </div>
      </OverlayPortal>

      <Modal open={gate !== null} onClose={() => setGate(null)} labelledBy="gate-title">
        <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gold-50 text-navy">
          <Lock className="h-6 w-6" />
        </div>
        <h2 id="gate-title" className="text-xl font-bold text-ink">
          Ready to use this feature for your business?
        </h2>
        <p className="mt-2 text-sm leading-relaxed text-ink-muted">
          You are in Explore Mode with sample data. Log in with your Mandiri account to use {gate} with your own business.
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
