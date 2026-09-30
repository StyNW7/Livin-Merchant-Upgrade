import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, KeyRound, Laptop, LogOut, ShieldCheck, Smartphone } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { Toggle } from "@/components/common/Form";
import { StatusBadge } from "@/components/common/StatusBadge";
import { PinSheet, DEFAULT_PIN } from "@/components/common/PinSheet";
import { ListGroup, ListRow } from "@/components/cards/ListRow";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { usePersistentState } from "@/hooks/usePersistentState";
import { securityActivity } from "@/data/support";

type PinStep = "current" | "new" | "confirm" | null;

export default function SecurityPage() {
  const navigate = useNavigate();
  const { isGuest, insightConsent, setInsightConsent, logout } = useSession();
  const { sessions, logoutSession } = useData();
  const { toast, confirm, requireAccount } = useUI();
  const [pin, setPin] = usePersistentState<string>("pin", DEFAULT_PIN, !isGuest);
  const [notifSecurity, setNotifSecurity] = usePersistentState<boolean>("notif-security", true, !isGuest);
  const [biometric, setBiometric] = usePersistentState<boolean>("biometric", true, !isGuest);
  const [step, setStep] = useState<PinStep>(null);
  const [newPin, setNewPin] = useState("");

  const devices = sessions;
  const active = devices.filter((d) => d.current).length;

  return (
    <>
      <TopAppBar title="Security Center" subtitle="Keep your merchant account safe" />
      <PageBody>
        <section className="flex items-center gap-3 rounded-3xl bg-success-soft p-4">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-success text-white">
            <ShieldCheck className="h-6 w-6" />
          </span>
          <div>
            <p className="text-[15px] font-bold text-ink">Your account is protected</p>
            <p className="text-[12.5px] text-ink-soft">All security features are active.</p>
          </div>
        </section>

        <ListGroup title="Protection">
          <ListRow icon={ShieldCheck} iconTone="success" title="Login Security" subtitle="Mandiri credentials with device binding" right={<StatusBadge status="Active" />} chevron={false} />
          <ListRow icon={Smartphone} title="Device Management" subtitle={`${active} Active Device`} right={<StatusBadge status={`${devices.length} device${devices.length > 1 ? "s" : ""}`} tone="neutral" hideIcon />} chevron={false} />
          <ListRow
            icon={KeyRound}
            title="Transaction PIN"
            subtitle="Required for refunds and payments"
            right={<StatusBadge status="Configured" tone="success" />}
            onClick={() => requireAccount("PIN changes") && setStep("current")}
          />
          <div className="px-4">
            <Toggle
              icon={<Bell className="h-5 w-5 text-navy-600" />}
              label="Notification Security"
              description="Alert me about logins and large refunds"
              checked={notifSecurity}
              onChange={(v) => {
                setNotifSecurity(v);
                toast(v ? "Security notifications enabled" : "Security notifications disabled", v ? "success" : "warning");
              }}
            />
          </div>
          <div className="px-4">
            <Toggle label="Biometric login" description="Use fingerprint or face to log in" checked={biometric} onChange={setBiometric} icon={<Smartphone className="h-5 w-5 text-navy-600" />} />
          </div>
        </ListGroup>

        <section>
          <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted">Devices</h2>
          <div className="card divide-y divide-surface-line">
            {devices.map((d) => (
              <div key={d.id} className="flex items-center gap-3 px-4 py-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-navy-50 text-navy-600">{d.current ? <Smartphone className="h-5 w-5" /> : <Laptop className="h-5 w-5" />}</span>
                <div className="min-w-0 flex-1">
                  <p className="text-[14px] font-semibold text-ink">
                    {d.name} {d.current && <span className="text-[11px] font-bold text-success-dark">· This device</span>}
                  </p>
                  <p className="text-[12px] text-ink-muted">
                    {d.location} · {d.lastActive}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="secondary"
                  className="text-danger"
                  onClick={() =>
                    confirm({
                      title: d.current ? "Log out this device?" : `Log out ${d.name}?`,
                      message: d.current ? "You will return to the login screen." : "That device will need to log in again.",
                      confirmLabel: "Log out",
                      tone: "danger",
                      onConfirm: () => {
                        if (d.current) {
                          logout();
                          navigate("/welcome", { replace: true });
                        } else {
                          logoutSession(d.id);
                          toast(`${d.name} logged out`);
                        }
                      },
                    })
                  }
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </section>

        <ListGroup title="Privacy">
          <div className="px-4">
            <Toggle
              label="Use transaction data for insights"
              description="Powers Growth Score, insights and Financing Readiness. Anonymized, never sold."
              checked={insightConsent}
              onChange={(v) =>
                v
                  ? (setInsightConsent(true), toast("Business insights turned on"))
                  : confirm({
                      title: "Turn off business insights?",
                      message: "Growth insights and recommendations will stop until you turn this back on.",
                      confirmLabel: "Turn off",
                      tone: "danger",
                      onConfirm: () => {
                        setInsightConsent(false);
                        toast("Business insights turned off", "warning");
                      },
                    })
              }
            />
          </div>
        </ListGroup>

        <section>
          <h2 className="mb-2 px-1 text-[12px] font-bold uppercase tracking-[0.08em] text-ink-muted">Recent Account Activity</h2>
          <div className="card divide-y divide-surface-line">
            {securityActivity.map((a) => (
              <div key={a.id} className="px-4 py-3">
                <p className="text-[13.5px] font-semibold text-ink">{a.title}</p>
                <p className="text-[12px] text-ink-muted">
                  {a.detail} · {a.time}
                </p>
              </div>
            ))}
          </div>
        </section>
      </PageBody>

      <PinSheet
        open={step === "current"}
        title="Change PIN"
        subtitle="Enter your current PIN"
        hint="Enter the PIN you use to confirm transactions"
        onClose={() => setStep(null)}
        onSubmit={(value) => {
          if (value !== pin) return false;
          setStep("new");
          return true;
        }}
      />
      <PinSheet
        open={step === "new"}
        title="New PIN"
        subtitle="Choose a new 6-digit PIN"
        hint="Must differ from your current PIN"
        onClose={() => setStep(null)}
        onSubmit={(value) => {
          if (/^(\d)\1{5}$/.test(value) || value === pin) return false;
          setNewPin(value);
          setStep("confirm");
          return true;
        }}
      />
      <PinSheet
        open={step === "confirm"}
        title="Confirm new PIN"
        subtitle="Enter the new PIN again"
        hint="Must match the PIN you just entered"
        onClose={() => setStep(null)}
        onSubmit={(value) => {
          if (value !== newPin) return false;
          setPin(value);
          setStep(null);
          toast("Transaction PIN updated");
          return true;
        }}
      />
    </>
  );
}
