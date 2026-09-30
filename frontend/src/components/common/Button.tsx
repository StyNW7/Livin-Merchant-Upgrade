import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { cn } from "@/utils/cn";

type Variant = "primary" | "accent" | "secondary" | "ghost" | "danger" | "soft";
type Size = "sm" | "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  block?: boolean;
  loading?: boolean;
  leftIcon?: ReactNode;
  rightIcon?: ReactNode;
}

const variants: Record<Variant, string> = {
  primary:
    "bg-gradient-to-b from-navy-400 to-navy-600 text-white shadow-brand hover:from-navy-500 hover:to-navy-700 active:to-navy-800",
  accent: "bg-gold text-navy-900 shadow-glow hover:bg-gold-400 active:bg-gold-600",
  secondary: "border border-navy-100 bg-white text-navy-600 shadow-soft hover:border-navy-200 hover:bg-navy-50",
  ghost: "bg-transparent text-navy-600 hover:bg-navy-50",
  soft: "bg-navy-50 text-navy-600 hover:bg-navy-100",
  danger: "bg-danger text-white shadow-[0_8px_18px_-8px_rgba(220,61,67,0.6)] hover:bg-danger-dark",
};

const sizes: Record<Size, string> = {
  sm: "h-9 px-3.5 text-[13px] rounded-xl gap-1.5",
  md: "h-11 px-4 text-sm rounded-2xl gap-2",
  lg: "h-[52px] px-5 text-[15px] rounded-2xl gap-2",
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  { variant = "primary", size = "md", block, loading, leftIcon, rightIcon, className, children, disabled, ...props },
  ref,
) {
  return (
    <button
      ref={ref}
      type="button"
      disabled={disabled || loading}
      className={cn(
        "inline-flex select-none items-center justify-center font-bold tracking-tight transition-all duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50 disabled:shadow-none",
        variants[variant],
        sizes[size],
        block && "w-full",
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden /> : leftIcon}
      {children}
      {!loading && rightIcon}
    </button>
  );
});

interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  label: string;
  tone?: "light" | "dark" | "plain";
  badge?: boolean;
}

export function IconButton({ label, tone = "light", badge, className, children, ...props }: IconButtonProps) {
  return (
    <button
      type="button"
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl transition-all duration-150 active:scale-95",
        tone === "light" && "border border-surface-line bg-white text-navy-600 shadow-soft hover:border-navy-100 hover:bg-navy-50",
        tone === "dark" && "bg-white/20 text-white hover:bg-white/30",
        tone === "plain" && "text-navy-600 hover:bg-navy-50",
        className,
      )}
      {...props}
    >
      {children}
      {badge && (
        <span className="absolute right-2 top-2 h-2.5 w-2.5 animate-pulse rounded-full bg-danger ring-2 ring-white" aria-hidden />
      )}
    </button>
  );
}
