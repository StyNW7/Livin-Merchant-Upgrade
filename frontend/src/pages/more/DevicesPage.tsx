import { useEffect, useState } from "react";
import { CheckCircle2, Circle, Loader2, Monitor, Printer, QrCode, Vault, Wrench, type LucideIcon } from "lucide-react";
import type { Device } from "@/types";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { BottomSheet } from "@/components/common/Overlay";
import { Toggle } from "@/components/common/Form";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useData, useUI } from "@/hooks/useApp";
import { troubleshootingSteps } from "@/data/operations";
import { cn } from "@/utils/cn";

const ICONS: Record<Device["type"], LucideIcon> = { printer: Printer, drawer: Vault, qr: QrCode, pos: Monitor };
const ONLINE: Record<Device["type"], Device["status"]> = { printer: "Connected", drawer: "Connected", qr: "Active", pos: "Online" };

export default function DevicesPage() {
  const { devices, updateDevice } = useData();
  const { toast } = useUI();
  const [openId, setOpenId] = useState<string | null>(null);
  const [step, setStep] = useState(-1);
  const open = devices.find((d) => d.id === openId) ?? null;
  const steps = open ? troubleshootingSteps[open.type] : [];

  useEffect(() => {
    if (step < 0 || !open) return;
    if (step >= steps.length) {
      updateDevice({ ...open, status: ONLINE[open.type], lastSeen: "Just now" });
      toast(`${open.name} is working normally`);
      return;
    }
    const timer = window.setTimeout(() => setStep((s) => s + 1), 800);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [step]);

  const online = devices.filter((d) => d.status !== "Disconnected").length;

  return (
    <>
      <TopAppBar title="Devices & Operations" subtitle={`${online} of ${devices.length} devices ready`} />
      <PageBody>
        <div className="grid grid-cols-2 gap-3">
          {devices.map((d) => {
            const Icon = ICONS[d.type];
            const ok = d.status !== "Disconnected";
            return (
              <button
                key={d.id}
                type="button"
                onClick={() => {
                  setOpenId(d.id);
                  setStep(-1);
                }}
                className="card p-4 text-left transition hover:shadow-float"
              >
                <span className={cn("flex h-11 w-11 items-center justify-center rounded-2xl", ok ? "bg-navy-50 text-navy" : "bg-danger-soft text-danger-dark")}>
                  <Icon className="h-5 w-5" />
                </span>
                <p className="mt-3 text-[14px] font-bold text-ink">{d.name}</p>
                <StatusBadge status={d.status} tone={ok ? "success" : "danger"} className="mt-1" />
                <p className="mt-1.5 text-[11.5px] text-ink-muted">{d.lastSeen}</p>
              </button>
            );
          })}
        </div>
        <p className="text-[12.5px] leading-relaxed text-ink-muted">Tap a device to see details, run troubleshooting or simulate a disconnection.</p>
      </PageBody>

      <BottomSheet open={!!open} onClose={() => setOpenId(null)} title={open?.name ?? ""} subtitle={open?.detail}>
        {open && (
          <div className="space-y-4">
            <div className="rounded-2xl bg-surface px-3">
              <Toggle
                label={open.status === "Disconnected" ? "Disconnected" : "Connected"}
                description="Simulate a connection issue"
                checked={open.status !== "Disconnected"}
                onChange={(v) => {
                  updateDevice({ ...open, status: v ? ONLINE[open.type] : "Disconnected", lastSeen: v ? "Just now" : "Lost connection just now" });
                  setStep(-1);
                }}
              />
            </div>
            <section>
              <p className="mb-2 flex items-center gap-1.5 text-[13px] font-bold text-ink">
                <Wrench className="h-4 w-4 text-navy" /> Troubleshooting
              </p>
              <ol className="space-y-2.5">
                {steps.map((s, i) => {
                  const done = step > i;
                  const running = step === i;
                  return (
                    <li key={s} className="flex items-center gap-3 text-[13.5px]">
                      {done ? <CheckCircle2 className="h-5 w-5 text-success" /> : running ? <Loader2 className="h-5 w-5 animate-spin text-navy" /> : <Circle className="h-5 w-5 text-ink-faint" />}
                      <span className={done ? "text-ink" : "text-ink-soft"}>{s}</span>
                    </li>
                  );
                })}
              </ol>
            </section>
            {step >= steps.length ? (
              <p className="rounded-2xl bg-success-soft px-4 py-3 text-[13px] font-semibold text-success-dark">All checks passed. The device is ready.</p>
            ) : (
              <Button block size="lg" loading={step >= 0} onClick={() => setStep(0)}>
                {step >= 0 ? "Running checks" : open.type === "printer" ? "Run checks and test print" : "Run troubleshooting"}
              </Button>
            )}
          </div>
        )}
      </BottomSheet>
    </>
  );
}
