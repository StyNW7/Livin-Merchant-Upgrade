/** Shared Recharts axis and grid styling: minimal, mobile-friendly. */
export const axisProps = {
  tickLine: false,
  axisLine: false,
  tick: { fontSize: 11, fill: "#6B7788" },
} as const;

export const gridProps = {
  stroke: "#EEF1F5",
  strokeDasharray: "0",
  vertical: false,
} as const;
