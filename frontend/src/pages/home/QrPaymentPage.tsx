import { useEffect, useState } from "react";
import { Delete, Download, Loader2, QrCode, Smartphone } from "lucide-react";
import type { Transaction } from "@/types";
import { TopAppBar } from "@/components/layout/TopAppBar";
import { Button } from "@/components/common/Button";
import { Segmented } from "@/components/common/FilterChip";
import { QrCodeGraphic } from "@/components/common/QrCode";
import { SuccessView } from "@/components/cashier/SuccessView";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { formatRupiah } from "@/utils/format";
import { downloadQrPoster } from "@/utils/qr";

const MAX_AMOUNT = 10_000_000;

export default function QrPaymentPage() {
  const { outletName, merchant } = useSession();
  const { recordSale } = useData();
  const { toast } = useUI();
  const [tab, setTab] = useState<"dynamic" | "static">("dynamic");
  const [digits, setDigits] = useState("");
  const [stage, setStage] = useState<"amount" | "waiting" | "paying">("amount");
  const [seconds, setSeconds] = useState(300);
  const [done, setDone] = useState<Transaction | null>(null);
  const [saving, setSaving] = useState(false);
  const amount = Number(digits || 0);

  useEffect(() => {
    if (stage !== "waiting") return;
    const timer = window.setInterval(() => setSeconds((s) => (s <= 1 ? 0 : s - 1)), 1000);
    return () => window.clearInterval(timer);
  }, [stage]);

  useEffect(() => {
    if (stage === "waiting" && seconds === 0) {
      setStage("amount");
      toast("QR code expired. Generate a new one.", "warning");
    }
  }, [seconds, stage, toast]);

  const press = (key: string) => {
    setDigits((d) => {
      const next = key === "000" ? d + "000" : d + key;
      const clean = next.replace(/^0+/, "");
      return Number(clean) > MAX_AMOUNT ? d : clean;
    });
  };

  const simulatePayment = () => {
    setStage("paying");
    window.setTimeout(() => {
      const sale = recordSale({
        lines: [{ key: "qr", productId: "custom", name: "QR Payment", qty: 1, unitPrice: amount, basePrice: amount, addons: [], manualPrice: true }],
        payments: [{ method: "QRIS", amount }],
        channel: "Takeaway",
        orderRef: "QR Payment",
        subtotal: amount,
        discount: 0,
        tax: 0,
        service: 0,
        total: amount,
        createOrder: false,
      });
      setDone(sale);
    }, 1400);
  };

  if (done) {
    return (
      <SuccessView
        transaction={done}
        onNew={() => {
          setDone(null);
          setDigits("");
          setStage("amount");
        }}
      />
    );
  }

  const mm = String(Math.floor(seconds / 60)).padStart(2, "0");
  const ss = String(seconds % 60).padStart(2, "0");

  return (
    <>
      <TopAppBar title="QR Payment" subtitle={outletName} backTo="/home">
        <Segmented
          value={tab}
          onChange={setTab}
          options={[
            { value: "dynamic", label: "Enter amount" },
            { value: "static", label: "Outlet QR" },
          ]}
        />
      </TopAppBar>

      {tab === "static" ? (
        <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
          <div className="card flex flex-col items-center p-6">
            <p className="text-[12px] font-bold uppercase tracking-[0.2em] text-ink-muted">QRIS</p>
            <p className="mt-1 text-[16px] font-extrabold text-ink">{outletName}</p>
            <p className="mb-4 text-[12px] text-ink-muted">NMID {merchant.merchantId}</p>
            <QrCodeGraphic seed={`static-${outletName}`} size={220} />
            <p className="mt-4 max-w-[240px] text-[12.5px] text-ink-muted">Customers scan and type the amount themselves. Payments appear in Transactions.</p>
          </div>
          <Button
            className="mt-5"
            variant="secondary"
            loading={saving}
            leftIcon={<Download className="h-4 w-4" />}
            onClick={async () => {
              setSaving(true);
              try {
                await downloadQrPoster({ seed: `static-${outletName}`, outlet: outletName, merchantId: merchant.merchantId });
                toast("QR poster downloaded as PNG. Print it for your counter.");
              } catch {
                toast("Could not create the poster on this browser", "error");
              } finally {
                setSaving(false);
              }
            }}
          >
            Download QR poster
          </Button>
          <p className="mt-2 max-w-[260px] text-[11.5px] text-ink-faint">Prototype posters are marked as samples and cannot receive real payments.</p>
        </div>
      ) : stage === "amount" ? (
        <div className="flex flex-col px-5 pb-6 pt-6">
          <p className="text-center text-[13px] text-ink-muted">Amount to charge</p>
          <p className="tabular mt-1 text-center text-[36px] font-extrabold tracking-tight text-ink">{formatRupiah(amount)}</p>
          <div className="mt-3 flex justify-center gap-2">
            {[25_000, 50_000, 100_000].map((v) => (
              <button key={v} type="button" onClick={() => setDigits(String(v))} className="rounded-full bg-navy-50 px-3 py-1.5 text-[12.5px] font-semibold text-navy">
                {formatRupiah(v)}
              </button>
            ))}
          </div>
          <div className="mx-auto mt-6 grid w-full max-w-[320px] grid-cols-3 gap-2">
            {["1", "2", "3", "4", "5", "6", "7", "8", "9", "000", "0"].map((k) => (
              <button key={k} type="button" onClick={() => press(k)} className="h-14 rounded-2xl bg-white text-xl font-bold text-ink shadow-card hover:bg-navy-50 active:scale-95">
                {k}
              </button>
            ))}
            <button type="button" aria-label="Delete" onClick={() => setDigits((d) => d.slice(0, -1))} className="flex h-14 items-center justify-center rounded-2xl bg-white text-ink-soft shadow-card active:scale-95">
              <Delete className="h-5 w-5" />
            </button>
          </div>
          <Button
            size="lg"
            block
            className="mt-6"
            disabled={amount < 1000}
            leftIcon={<QrCode className="h-5 w-5" />}
            onClick={() => {
              setSeconds(300);
              setStage("waiting");
            }}
          >
            Generate QRIS
          </Button>
          {amount > 0 && amount < 1000 && <p className="mt-2 text-center text-[12px] text-ink-muted">Minimum amount is Rp 1.000</p>}
        </div>
      ) : (
        <div className="flex flex-col items-center px-6 pb-8 pt-6 text-center">
          <div className="card flex w-full flex-col items-center p-5">
            <p className="text-[12px] text-ink-muted">Scan to pay</p>
            <p className="tabular text-[26px] font-extrabold text-navy">{formatRupiah(amount)}</p>
            <div className="my-4">
              <QrCodeGraphic seed={`dyn-${amount}-${outletName}`} size={210} />
            </div>
            {stage === "paying" ? (
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-success-dark">
                <Loader2 className="h-4 w-4 animate-spin" /> Payment received, confirming...
              </p>
            ) : (
              <p className="inline-flex items-center gap-2 text-[13px] font-semibold text-ink-soft">
                <span className="h-2 w-2 animate-pulse rounded-full bg-gold" /> Waiting for payment · expires in {mm}:{ss}
              </p>
            )}
          </div>
          <Button className="mt-5" block size="lg" leftIcon={<Smartphone className="h-4 w-4" />} onClick={simulatePayment} disabled={stage === "paying"}>
            Simulate customer payment
          </Button>
          <Button className="mt-2.5" block variant="ghost" onClick={() => setStage("amount")} disabled={stage === "paying"}>
            Cancel
          </Button>
        </div>
      )}
    </>
  );
}
