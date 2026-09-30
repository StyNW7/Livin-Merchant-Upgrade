import { cn } from "@/utils/cn";

/** Official Livin Merchant app icon. */
export function AppIcon({ size = 40, className }: { size?: number; className?: string }) {
  return (
    <img
      src="/Images/logo.jpg"
      alt="Livin Merchant"
      width={size}
      height={size}
      className={cn("shrink-0 rounded-[28%] object-cover", className)}
      style={{ width: size, height: size }}
    />
  );
}

/** "livin' by mandiri" wordmark with the Merchant descriptor. */
export function LivinWordmark({ className, tone = "light" }: { className?: string; tone?: "light" | "dark" }) {
  return (
    <div className={cn("flex flex-col items-start", className)}>
      <img src="/Images/livin-logo.png" alt="livin' by mandiri" className="h-12 w-auto" />
      <span
        className={cn(
          "-mt-0.5 text-[13px] font-bold uppercase tracking-[0.32em]",
          tone === "light" ? "text-white" : "text-navy-600",
        )}
      >
        Merchant
      </span>
    </div>
  );
}

export function Avatar({
  initials,
  size = 40,
  className,
  tone = "gold",
}: {
  initials: string;
  size?: number;
  className?: string;
  tone?: "gold" | "navy" | "sky" | "soft";
}) {
  const tones = {
    gold: "bg-gold text-navy-900",
    navy: "bg-navy text-white",
    sky: "bg-sky-100 text-sky-700",
    soft: "bg-navy-50 text-navy-600",
  };
  return (
    <span
      className={cn("inline-flex shrink-0 items-center justify-center rounded-full font-bold", tones[tone], className)}
      style={{ width: size, height: size, fontSize: size * 0.36 }}
      aria-hidden
    >
      {initials}
    </span>
  );
}

export function Skeleton({ className }: { className?: string }) {
  return <div className={cn("skeleton", className)} aria-hidden />;
}
