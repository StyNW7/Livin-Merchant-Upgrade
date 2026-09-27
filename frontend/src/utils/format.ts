const idNumber = new Intl.NumberFormat("id-ID");

/** Rp 2.850.000 */
export function formatRupiah(value: number): string {
  const sign = value < 0 ? "-" : "";
  return `${sign}Rp ${idNumber.format(Math.round(Math.abs(value)))}`;
}

/** Rp 48,75 jt style is common in Indonesia, but the brief uses "Rp 48.75M". */
export function formatCompactRupiah(value: number, digits = 2): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000_000) return `Rp ${trim((value / 1_000_000_000).toFixed(digits))}B`;
  if (abs >= 1_000_000) return `Rp ${trim((value / 1_000_000).toFixed(digits))}M`;
  if (abs >= 1_000) return `Rp ${trim((value / 1_000).toFixed(0))}K`;
  return formatRupiah(value);
}

/** Axis labels: 1.2M, 850K */
export function formatAxis(value: number): string {
  const abs = Math.abs(value);
  if (abs >= 1_000_000) return `${trim((value / 1_000_000).toFixed(1))}M`;
  if (abs >= 1_000) return `${trim((value / 1_000).toFixed(0))}K`;
  return String(value);
}

/** 1,284 - the brief uses English thousands separators for counts. */
export function formatCount(value: number): string {
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatPercent(value: number, digits = 1, withSign = false): string {
  const sign = withSign && value > 0 ? "+" : "";
  return `${sign}${value.toFixed(digits)}%`;
}

function trim(value: string): string {
  return value.replace(/\.0+$/, "").replace(/(\.\d*[1-9])0+$/, "$1");
}

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export function parseISODate(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISODate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

/** 25 Sep 2026 */
export function formatDate(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

/** 25 Sep */
export function formatShortDate(iso: string): string {
  const d = parseISODate(iso);
  return `${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

/** Fri, 25 Sep */
export function formatDayDate(iso: string): string {
  const d = parseISODate(iso);
  return `${DAYS[d.getDay()]}, ${d.getDate()} ${MONTHS[d.getMonth()]}`;
}

export function dayName(iso: string): string {
  return DAYS[parseISODate(iso).getDay()];
}

export function monthName(index: number): string {
  return MONTHS[index];
}

export function greeting(date = new Date()): string {
  const h = date.getHours();
  if (h < 11) return "Good morning";
  if (h < 15) return "Good afternoon";
  if (h < 19) return "Good evening";
  return "Good evening";
}

export function initials(name: string): string {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");
}

/** 97.5% or 86% */
export function formatProgress(value: number): string {
  return Number.isInteger(value) ? `${value}%` : `${value.toFixed(1)}%`;
}
