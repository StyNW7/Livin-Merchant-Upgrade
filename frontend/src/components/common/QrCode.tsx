import { useMemo } from "react";
import { qrCells } from "@/utils/qr";

/**
 * QRIS code for an outlet or a specific amount, with the Livin Merchant badge in the centre.
 */
export function QrCodeGraphic({ seed, size = 220 }: { seed: string; size?: number }) {
  const cells = useMemo(() => qrCells(seed), [seed]);

  const n = cells.length;
  return (
    <div className="relative" style={{ width: size, height: size }}>
      <svg viewBox={`0 0 ${n} ${n}`} width={size} height={size} shapeRendering="crispEdges" role="img" aria-label="QRIS code for this payment">
        <rect width={n} height={n} fill="#fff" />
        {cells.map((row, y) => row.map((on, x) => (on ? <rect key={`${x}-${y}`} x={x} y={y} width={1} height={1} fill="#0E1B2B" /> : null)))}
      </svg>
      <div className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-xl bg-white shadow">
        <img src="/Images/logo.jpg" alt="" className="h-9 w-9 rounded-lg" />
      </div>
    </div>
  );
}
