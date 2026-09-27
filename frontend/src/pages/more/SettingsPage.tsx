import { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Globe, Info, Printer, Receipt, RotateCcw, Smartphone, Target, Vibrate } from "lucide-react";
import { TopAppBar, PageBody } from "@/components/layout/TopAppBar";
import { SelectField, TextField, Toggle } from "@/components/common/Form";
import { Button } from "@/components/common/Button";
import { ListGroup, ListRow } from "@/components/cards/ListRow";
import { useSession, useUI } from "@/hooks/useApp";
import { usePersistentState } from "@/hooks/usePersistentState";
import { APP_VERSION, DAILY_REVENUE_GOAL } from "@/data/merchant";
import { openDemoControls } from "@/utils/demo";
import { formatRupiah } from "@/utils/format";

interface Settings {
  language: string;
  autoPrint: boolean;
  receiptFooter: string;
  haptics: boolean;
  lowStockAlerts: boolean;
  dailySummary: boolean;
}

const DEFAULTS: Settings = {
  language: "English",
  autoPrint: false,
  receiptFooter: "Thank you for your visit",
  haptics: true,
  lowStockAlerts: true,
  dailySummary: true,
};

export default function SettingsPage() {
  const navigate = useNavigate();
  const { isGuest, resetDemo } = useSession();
  const { toast, confirm } = useUI();
  const [settings, setSettings] = usePersistentState<Settings>("app-settings", DEFAULTS, !isGuest);
  const [footerDraft, setFooterDraft] = useState(settings.receiptFooter);
  const taps = useRef(0);
  const set = <K extends keyof Settings>(key: K, value: Settings[K]) => setSettings((s) => ({ ...s, [key]: value }));

  return (
    <>
      <TopAppBar title="Settings" />
      <PageBody>
        <ListGroup title="General">
          <div className="px-4 py-3">
            <SelectField
              label="Language"
              value={settings.language}
              onChange={(e) => {
                set("language", e.target.value);
                toast(e.target.value === "English" ? "Language set to English" : "Bahasa Indonesia will be available in the next update", "info");
              }}
              options={[
                { value: "English", label: "English" },
                { value: "Bahasa Indonesia", label: "Bahasa Indonesia" },
              ]}
            />
          </div>
          <div className="px-4">
            <Toggle icon={<Vibrate className="h-5 w-5 text-navy" />} label="Haptic feedback" checked={settings.haptics} onChange={(v) => set("haptics", v)} />
          </div>
          <ListRow icon={Target} title="Daily revenue goal" subtitle={formatRupiah(DAILY_REVENUE_GOAL)} chevron={false} />
        </ListGroup>

        <ListGroup title="Cashier and receipts">
          <div className="px-4">
            <Toggle icon={<Printer className="h-5 w-5 text-navy" />} label="Print receipt automatically" checked={settings.autoPrint} onChange={(v) => set("autoPrint", v)} />
          </div>
          <div className="space-y-2 px-4 py-3">
            <TextField label="Receipt footer" value={footerDraft} onChange={(e) => setFooterDraft(e.target.value)} maxLength={40} />
            <Button
              size="sm"
              variant="soft"
              disabled={footerDraft.trim() === settings.receiptFooter}
              leftIcon={<Receipt className="h-4 w-4" />}
              onClick={() => {
                set("receiptFooter", footerDraft.trim() || DEFAULTS.receiptFooter);
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
            <Toggle label="Low stock alerts" checked={settings.lowStockAlerts} onChange={(v) => set("lowStockAlerts", v)} />
          </div>
          <div className="px-4">
            <Toggle label="Daily sales summary at 22:00" checked={settings.dailySummary} onChange={(v) => set("dailySummary", v)} />
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
          <ListRow icon={Globe} title="Terms and privacy" subtitle="How Livin Merchant handles your data" onClick={() => navigate("/help?article=h-readiness")} />
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
    </>
  );
}
