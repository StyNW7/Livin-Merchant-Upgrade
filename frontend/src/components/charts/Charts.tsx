import { useId } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { CHART_MUTED, CHART_NAVY } from "@/data/analytics";
import { formatAxis } from "@/utils/format";
import { ChartTooltip } from "./ChartKit";
import { axisProps, gridProps } from "./chartProps";

type Row = Record<string, string | number | null | undefined | boolean>;

/** Tiny area line for hero cards. No axes, no tooltip clutter. */
export function Sparkline({
  data,
  dataKey = "value",
  color = "#FFB600",
  height = 56,
  fillOpacity = 0.35,
}: {
  data: Row[];
  dataKey?: string;
  color?: string;
  height?: number;
  fillOpacity?: number;
}) {
  const id = useId().replace(/:/g, "");
  const lastIndex = data.reduce<number>((last, row, i) => (row[dataKey] != null ? i : last), -1);
  const renderDot = ({ cx, cy, index }: { cx?: number; cy?: number; index?: number }) =>
    index === lastIndex && cx != null && cy != null ? (
      <g key="now">
        <circle cx={cx} cy={cy} r={8} fill={color} opacity={0.25} className="animate-pulse" />
        <circle cx={cx} cy={cy} r={3.5} fill={color} stroke="#fff" strokeWidth={1.5} />
      </g>
    ) : (
      <g key={`dot-${index}`} />
    );
  return (
    <div style={{ height }} aria-hidden>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 10, bottom: 2, left: 2 }}>
          <defs>
            <linearGradient id={`spark-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={fillOpacity} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey={dataKey}
            stroke={color}
            strokeWidth={2}
            fill={`url(#spark-${id})`}
            connectNulls={false}
            dot={renderDot}
            activeDot={false}
            isAnimationActive
            animationDuration={1100}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Area trend with crosshair tooltip. */
export function TrendArea({
  data,
  xKey,
  yKey,
  format,
  color = CHART_NAVY,
  height = 190,
  label,
}: {
  data: Row[];
  xKey: string;
  yKey: string;
  format: (v: number) => string;
  color?: string;
  height?: number;
  label?: string;
}) {
  const id = useId().replace(/:/g, "");
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }}>
          <defs>
            <linearGradient id={`area-${id}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor={color} stopOpacity={0.22} />
              <stop offset="100%" stopColor={color} stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" minTickGap={24} />
          <YAxis {...axisProps} width={44} tickFormatter={formatAxis} />
          <Tooltip cursor={{ stroke: "#9AA4B2", strokeDasharray: "3 3" }} content={(p) => <ChartTooltip {...p} format={format} />} />
          <Area type="monotone" dataKey={yKey} stroke={color} strokeWidth={2} fill={`url(#area-${id})`} activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }} />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Single or multi-series line chart (max two series, one axis). */
export function TrendLine({
  data,
  xKey,
  series,
  format,
  height = 190,
  label,
  yDomain,
}: {
  data: Row[];
  xKey: string;
  series: { key: string; color: string; label: string; dashed?: boolean }[];
  format: (v: number) => string;
  height?: number;
  label?: string;
  yDomain?: [number | "auto" | "dataMin", number | "auto" | "dataMax"];
}) {
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 10, bottom: 0, left: -8 }}>
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} interval="preserveStartEnd" minTickGap={20} />
          <YAxis {...axisProps} width={44} tickFormatter={formatAxis} domain={yDomain} />
          <Tooltip
            cursor={{ stroke: "#9AA4B2", strokeDasharray: "3 3" }}
            content={(p) => <ChartTooltip {...p} format={format} labels={Object.fromEntries(series.map((s) => [s.key, s.label]))} />}
          />
          {series.map((s) => (
            <Line
              key={s.key}
              type="monotone"
              dataKey={s.key}
              stroke={s.color}
              strokeWidth={2}
              strokeDasharray={s.dashed ? "5 4" : undefined}
              dot={{ r: 3, fill: s.color, strokeWidth: 0 }}
              activeDot={{ r: 5, strokeWidth: 2, stroke: "#fff" }}
              connectNulls={false}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Vertical bars. Highlighted rows use the accent color, others a muted tone. */
export function SimpleBars({
  data,
  xKey,
  yKey,
  format,
  height = 180,
  color = CHART_NAVY,
  highlightKey,
  label,
  axisFormat = formatAxis,
}: {
  data: Row[];
  xKey: string;
  yKey: string;
  format: (v: number) => string;
  height?: number;
  color?: string;
  highlightKey?: string;
  label?: string;
  axisFormat?: (v: number) => string;
}) {
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barCategoryGap="22%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} interval={0} tick={{ fontSize: 10.5, fill: "#6B7788" }} />
          <YAxis {...axisProps} width={44} tickFormatter={axisFormat} />
          <Tooltip cursor={{ fill: "rgba(0,58,112,0.05)" }} content={(p) => <ChartTooltip {...p} format={format} />} />
          <Bar dataKey={yKey} radius={[4, 4, 0, 0]} maxBarSize={32}>
            {data.map((row, i) => (
              <Cell key={i} fill={highlightKey ? (row[highlightKey] ? color : CHART_MUTED) : color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Two-series grouped bars sharing one axis (e.g. this week vs last week). */
export function GroupedBars({
  data,
  xKey,
  series,
  format,
  height = 190,
  label,
}: {
  data: Row[];
  xKey: string;
  series: { key: string; color: string; label: string }[];
  format: (v: number) => string;
  height?: number;
  label?: string;
}) {
  return (
    <div style={{ height }} role="img" aria-label={label}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: -8 }} barGap={2} barCategoryGap="20%">
          <CartesianGrid {...gridProps} />
          <XAxis dataKey={xKey} {...axisProps} interval={0} />
          <YAxis {...axisProps} width={44} tickFormatter={formatAxis} />
          <Tooltip
            cursor={{ fill: "rgba(0,58,112,0.05)" }}
            content={(p) => <ChartTooltip {...p} format={format} labels={Object.fromEntries(series.map((s) => [s.key, s.label]))} />}
          />
          {series.map((s) => (
            <Bar key={s.key} dataKey={s.key} fill={s.color} radius={[4, 4, 0, 0]} maxBarSize={14} />
          ))}
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Horizontal bars for ranked lists such as top products. */
export function RankBars({
  data,
  labelKey,
  valueKey,
  format,
  color = CHART_NAVY,
  height,
}: {
  data: Row[];
  labelKey: string;
  valueKey: string;
  format: (v: number) => string;
  color?: string;
  height?: number;
}) {
  return (
    <div style={{ height: height ?? data.length * 40 + 8 }} role="img" aria-label="Ranking chart">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 0, right: 12, bottom: 0, left: 0 }} barCategoryGap="28%">
          <XAxis type="number" hide />
          <YAxis
            type="category"
            dataKey={labelKey}
            {...axisProps}
            width={112}
            tick={{ fontSize: 11.5, fill: "#3B4A5C" }}
            tickFormatter={(v: string) => (v.length > 17 ? `${v.slice(0, 16)}…` : v)}
          />
          <Tooltip cursor={{ fill: "rgba(0,58,112,0.05)" }} content={(p) => <ChartTooltip {...p} format={format} />} />
          <Bar dataKey={valueKey} fill={color} radius={[0, 4, 4, 0]} maxBarSize={18} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/** Donut with a centered total and an external legend with values (never color alone). */
export function Donut({
  data,
  format,
  centerLabel,
  centerValue,
  size = 168,
}: {
  data: { name: string; value: number; color: string; share: number }[];
  format: (v: number) => string;
  centerLabel: string;
  centerValue: string;
  size?: number;
}) {
  const visible = data.filter((d) => d.value > 0);
  return (
    <div className="flex items-center gap-4">
      <div className="relative shrink-0" style={{ width: size, height: size }}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Tooltip content={(p) => <ChartTooltip {...p} format={format} labels={{ value: "" }} />} />
            <Pie
              data={visible}
              dataKey="value"
              nameKey="name"
              innerRadius="64%"
              outerRadius="100%"
              paddingAngle={2}
              stroke="#fff"
              strokeWidth={2}
              cornerRadius={4}
              isAnimationActive={false}
            >
              {visible.map((d) => (
                <Cell key={d.name} fill={d.color} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center text-center">
          <span className="text-[11px] text-ink-muted">{centerLabel}</span>
          <span className="tabular text-[15px] font-extrabold text-ink">{centerValue}</span>
        </div>
      </div>
      <ul className="min-w-0 flex-1 space-y-2">
        {data.map((d) => (
          <li key={d.name} className="flex items-center gap-2 text-[12.5px]">
            <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: d.color }} />
            <span className="min-w-0 flex-1 truncate text-ink-soft">{d.name}</span>
            <span className="tabular font-bold text-ink">{d.share.toFixed(0)}%</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
