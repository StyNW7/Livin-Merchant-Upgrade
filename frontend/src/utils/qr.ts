import { createRandom } from "./random";
import { downloadBlob } from "./download";

export const QR_SIZE = 29;

/**
 * Deterministic QR module pattern for an outlet or amount. The centre is left empty for the logo.
 */
export function qrCells(seed: string): boolean[][] {
  const n = QR_SIZE;
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
  for (let i = 11; i <= 17; i++) for (let j = 11; j <= 17; j++) grid[i][j] = false;
  return grid;
}

function loadImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

/** Draws a printable counter poster (PNG) for the outlet QR and downloads it. */
export async function downloadQrPoster({ seed, outlet, merchantId }: { seed: string; outlet: string; merchantId: string }) {
  const W = 1080;
  const H = 1500;
  const canvas = document.createElement("canvas");
  canvas.width = W;
  canvas.height = H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas not supported");
  const font = '"Plus Jakarta Sans", system-ui, sans-serif';

  ctx.fillStyle = "#5192F6";
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = "#FFB600";
  ctx.fillRect(0, H - 24, W, 24);

  ctx.textAlign = "center";
  ctx.fillStyle = "#FFFFFF";
  ctx.font = `800 64px ${font}`;
  ctx.fillText("Scan to pay", W / 2, 150);
  ctx.fillStyle = "rgba(255,255,255,0.75)";
  ctx.font = `500 34px ${font}`;
  ctx.fillText("All QRIS-enabled apps accepted", W / 2, 205);

  const cardX = 110;
  const cardY = 270;
  const cardW = W - 220;
  const cardH = 1000;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, cardX, cardY, cardW, cardH, 48);
  ctx.fill();

  ctx.fillStyle = "#5192F6";
  ctx.font = `800 44px ${font}`;
  ctx.fillText("QRIS", W / 2, cardY + 90);

  const cells = qrCells(seed);
  const qrSize = 640;
  const cell = qrSize / cells.length;
  const qx = (W - qrSize) / 2;
  const qy = cardY + 130;
  ctx.fillStyle = "#0E1B2B";
  cells.forEach((row, y) => row.forEach((on, x) => on && ctx.fillRect(qx + x * cell, qy + y * cell, Math.ceil(cell), Math.ceil(cell))));

  const logo = await loadImage("/Images/logo.jpg");
  const badge = 120;
  ctx.fillStyle = "#FFFFFF";
  roundRect(ctx, W / 2 - badge / 2, qy + qrSize / 2 - badge / 2, badge, badge, 24);
  ctx.fill();
  if (logo) ctx.drawImage(logo, W / 2 - 46, qy + qrSize / 2 - 46, 92, 92);

  ctx.fillStyle = "#0E1B2B";
  ctx.font = `800 40px ${font}`;
  ctx.fillText(outlet, W / 2, qy + qrSize + 90, cardW - 80);
  ctx.fillStyle = "#6B7788";
  ctx.font = `500 30px ${font}`;
  ctx.fillText(`NMID ${merchantId}`, W / 2, qy + qrSize + 140);

  ctx.fillStyle = "#FFFFFF";
  ctx.font = `700 34px ${font}`;
  ctx.fillText("Livin Merchant by Mandiri", W / 2, H - 120);
  ctx.fillStyle = "rgba(255,255,255,0.7)";
  ctx.font = `500 24px ${font}`;
  ctx.fillText("Payments are credited to the merchant's Mandiri account", W / 2, H - 70);

  const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png"));
  if (!blob) throw new Error("Could not create image");
  downloadBlob(`qris-poster-${outlet.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "")}.png`, blob);
}
