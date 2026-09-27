import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Info, Printer, Receipt, RotateCcw, Smartphone, Target, Vibrate } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { TextField, Toggle } from "@/components/common/Form";
import { Button } from "@/components/common/Button";
import { ListGroup, ListRow } from "@/components/cards/ListRow";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { APP_VERSION } from "@/data/merchant";
import { BottomSheet } from "@/components/common/Overlay";
import { DEFAULT_SETTINGS } from "@/data/settings";
import { openDemoControls } from "@/utils/demo";
import { formatRupiah } from "@/utils/format";

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isGuest, resetDemo } = useSession();
  const { toast, confirm } = useUI();
  const { settings, updateSettings } = useData();
  const [footerDraft, setFooterDraft] = useState(settings.receiptFooter);
  const [goalDraft, setGoalDraft] = useState<string | null>(null);
  const taps = useRef(0);

  return (
    <>
      <TopAppBar title="Settings" />
      <PageBody>
        <ListGroup title="General">
          <ListRow icon={Globe} title="Language" subtitle="English" chevron={false} />
          <div className="px-4">
            <Toggle
              icon={<Vibrate className="h-5 w-5 text-navy" />}
              label="Haptic feedback"
              description="Vibrate when adding items and completing payments"
              checked={settings.haptics}
              onChange={(v) => updateSettings({ haptics: v })}
            />
          </div>
          <ListRow icon={Target} title="Daily revenue goal" subtitle={formatRupiah(settings.dailyGoal)} onClick={() => setGoalDraft(String(settings.dailyGoal))} />
        </ListGroup>

        <ListGroup title="Cashier and receipts">
          <div className="px-4">
            <Toggle
              icon={<Printer className="h-5 w-5 text-navy" />}
              label="Print receipt automatically"
              description="Sends the receipt to the outlet printer after every payment"
              checked={settings.autoPrint}
              onChange={(v) => updateSettings({ autoPrint: v })}
            />
          </div>
          <div className="space-y-2 px-4 py-3">
            <TextField label="Receipt footer" hint="Printed at the bottom of every receipt" value={footerDraft} onChange={(e) => setFooterDraft(e.target.value)} maxLength={40} />
            <Button
              size="sm"
              variant="soft"
              disabled={footerDraft.trim() === settings.receiptFooter}
              leftIcon={<Receipt className="h-4 w-4" />}
              onClick={() => {
                const footer = footerDraft.trim() || DEFAULT_SETTINGS.receiptFooter;
                updateSettings({ receiptFooter: footer });
                setFooterDraft(footer);
                toast("Receipt footer saved");
              }}
            >
              Save footer
            </Button>
          </div>
          <ListRow icon={Smartphone} title="Devices" subtitle="Printer, cash drawer and QR display" to="/devices" />
        </ListGroup>

        <ListGroup title="Notifications">
          <div className="px-4">
            <Toggle
              label="Low stock alerts"
              description="Show stock warnings in Notifications"
              checked={settings.lowStockAlerts}
              onChange={(v) => updateSettings({ lowStockAlerts: v })}
            />
          </div>
          <div className="px-4">
            <Toggle
              label="Daily sales summary at 22:00"
              description="A recap of each day's sales in Notifications"
              checked={settings.dailySummary}
              onChange={(v) => updateSettings({ dailySummary: v })}
            />
          </div>
        </ListGroup>

        <ListGroup title="About">
          <ListRow
            icon={Info}
            title="App version"
            subtitle={`Livin Merchant ${APP_VERSION}`}
            onClick={() => {
              taps.current += 1;
              if (taps.current >= 5) {
                taps.current = 0;
                openDemoControls();
                toast("Presenter controls unlocked", "info");
              }
            }}
            chevron={false}
          />
          <ListRow icon={Globe} title="Terms and privacy" subtitle="How Livin Merchant handles your data" onClick={() => navigate("/help?article=h-privacy")} />
          {!isGuest && (
            <ListRow
              icon={RotateCcw}
              iconTone="danger"
              title="Reset demo data"
              subtitle="Restore all sample data and sign out"
              onClick={() =>
                confirm({
                  title: "Reset all demo data?",
                  message: "Sales, products, expenses and settings you changed will return to the original sample data.",
                  confirmLabel: "Reset",
                  tone: "danger",
                  onConfirm: resetDemo,
                })
              }
            />
          )}
        </ListGroup>
      </PageBody>

      <BottomSheet
        open={goalDraft !== null}
        onClose={() => setGoalDraft(null)}
        title="Daily revenue goal"
        subtitle="Used on Home and after every payment"
        footer={
          <Button
            block
            size="lg"
            disabled={Number(goalDraft || 0) < 100_000}
            onClick={() => {
              updateSettings({ dailyGoal: Number(goalDraft) });
              toast(`Daily goal set to ${formatRupiah(Number(goalDraft))}`);
              setGoalDraft(null);
            }}
          >
            Save goal
          </Button>
        }
      >
        <TextField
          label="Goal per day"
          prefix="Rp"
          inputMode="numeric"
          value={goalDraft ?? ""}
          onChange={(e) => setGoalDraft(e.target.value.replace(/\D/g, "").slice(0, 10))}
          hint="Minimum Rp 100.000. Your average day over the last 30 days is a good starting point."
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {[2_500_000, 3_000_000, 3_500_000, 4_000_000].map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setGoalDraft(String(v))}
              className="h-9 rounded-full border border-surface-line px-3.5 text-[13px] font-semibold text-ink-soft hover:border-navy-200"
            >
              {formatRupiah(v)}
            </button>
          ))}
        </div>
      </BottomSheet>
    </>
  );
}
