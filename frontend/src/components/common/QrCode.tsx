import { useMemo } from "react";
import { createRandom } from "@/utils/random";

/**
 * Deterministic QR-style pattern for the prototype. It looks like a QRIS code but encodes nothing,
 * so it can never be mistaken for a real payment code.
 */
export function QrCodeGraphic({ seed, size = 220 }: { seed: string; size?: number }) {
  const cells = useMemo(() => {
    const n = 29;
    let hash = 0;
    for (const ch of seed) hash = (hash * 31 + ch.charCodeAt(0)) >>> 0;
    const rng = createRandom(hash || 1);
    const grid: boolean[][] = Array.from({ length: n }, () => Array.from({ length: n }, () => rng.next() > 0.52));
    const finder = (r: number, c: number) => {
      for (let i = -1; i <= 7; i++)
        for (let j = -1; j <= 7; j++) {
          const y = r + i;
          const x = c + j;
          if (y < 0 || x < 0 || y >= n || x >= n) continue;
          const ring = i === -1 || j === -1 || i === 7 || j === 7;
          const outer = i === 0 || j === 0 || i === 6 || j === 6;
          const inner = i >= 2 && i <= 4 && j >= 2 && j <= 4;
          grid[y][x] = !ring && (outer || inner);
        }
    };
    finder(0, 0);
    finder(0, n - 7);
    finder(n - 7, 0);
    // Clear the centre for the logo badge.
    for (let i = 11; i <= 17; i++) for (let j = 11; j <= 17; j++) grid[i][j] = false;
    return grid;
  }, [seed]);

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
