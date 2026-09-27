import type { LucideIcon } from "lucide-react";
import { Link } from "react-router-dom";
import { cn } from "@/utils/cn";

interface QuickActionProps {
  icon: LucideIcon;
  label: string;
  to?: string;
  onClick?: () => void;
  highlight?: boolean;
}

export function QuickAction({ icon: Icon, label, to, onClick, highlight }: QuickActionProps) {
  const inner = (
    <>
      <span
        className={cn(
          "flex h-[52px] w-[52px] items-center justify-center rounded-[18px] transition-all duration-150 group-hover:-translate-y-0.5 group-active:scale-90",
          highlight ? "bg-gold text-navy-900 shadow-glow" : "border border-surface-line bg-white text-navy shadow-card",
        )}
      >
        <Icon className="h-[22px] w-[22px]" strokeWidth={2.1} />
      </span>
      <span className="text-center text-[12px] font-semibold leading-tight text-ink-soft">{label}</span>
    </>
  );
  const className = "group flex flex-col items-center gap-1.5 rounded-2xl py-1 outline-none";
  return to ? (
    <Link to={to} className={className}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={className}>
      {inner}
    </button>
  );
}
