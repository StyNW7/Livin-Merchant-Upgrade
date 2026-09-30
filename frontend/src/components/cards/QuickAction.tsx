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
          "flex h-[56px] w-[56px] items-center justify-center rounded-[20px] transition-all duration-200 group-hover:-translate-y-0.5 group-active:scale-90",
          highlight
            ? "bg-gradient-to-br from-gold-300 to-gold-500 text-navy-900 shadow-glow"
            : "border border-navy-100 bg-gradient-to-br from-white to-navy-50 text-navy-600 shadow-soft group-hover:shadow-card",
        )}
      >
        <Icon className="h-[23px] w-[23px]" strokeWidth={2.2} />
      </span>
      <span className="w-full text-center text-[12px] font-bold leading-tight tracking-tight text-ink-soft">{label}</span>
    </>
  );
  const className = "group flex min-w-0 flex-col items-center gap-1.5 rounded-2xl py-1 outline-none";
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
