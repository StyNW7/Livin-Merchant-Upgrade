import { useCallback, useEffect, useRef, useState } from "react";
import { useData, useSession, useUI } from "./useApp";
import type { Transaction } from "@/types";
import { outletArea } from "@/data/outlets";
import { METHOD_LABEL } from "@/data/analytics";
import { formatRupiah } from "@/utils/format";

/**
 * Receipt actions shared by the payment success screen and transaction details.
 * Printing uses the outlet's receipt printer from Devices and fails with a clear message when the
 * outlet has no printer or it is disconnected. Sharing uses the system share sheet or the clipboard.
 */
export function useReceiptActions() {
  const { devices } = useData();
  const { outletId } = useSession();
  const { toast } = useUI();
  const [printing, setPrinting] = useState(false);
  // Tracks mounting instead of cancelling the timer, so a print started right as the screen
  // opens (auto-print) still completes when React re-runs effects.
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  const print = useCallback(
    (receiptId: string, outlet: string = outletId) => {
      const printer = devices.find((d) => d.type === "printer" && d.outletId === outlet);
      if (!printer) {
        toast(`No receipt printer is set up for ${outletArea(outlet)}. Share the receipt instead.`, "warning");
        return;
      }
      if (printer.status === "Disconnected") {
        toast(`${printer.name} is disconnected. Reconnect it in Devices.`, "error");
        return;
      }
      setPrinting(true);
      window.setTimeout(() => {
        if (mounted.current) setPrinting(false);
        toast(`${receiptId} printed on ${printer.name}`);
      }, 1200);
    },
    [devices, outletId, toast],
  );

  const share = useCallback(
    async (t: Transaction) => {
      const text = `Receipt ${t.id} - ${formatRupiah(t.amount)} paid by ${METHOD_LABEL[t.method]}. Thank you!`;
      if (navigator.share) {
        try {
          await navigator.share({ title: `Receipt ${t.id}`, text });
        } catch (error) {
          if ((error as DOMException)?.name !== "AbortError") toast("Sharing is not available right now", "error");
        }
        return;
      }
      try {
        await navigator.clipboard.writeText(text);
        toast("Receipt details copied. Paste them into WhatsApp or email.");
      } catch {
        toast("Copying is blocked by this browser. Open Receipt to show it to the customer.", "warning");
      }
    },
    [toast],
  );

  return { print, printing, share };
}
