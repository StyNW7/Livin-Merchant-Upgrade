import { NavLink } from "react-router-dom";
import { Grid2x2, House, ReceiptText, ScanLine, TrendingUp, type LucideIcon } from "lucide-react";
import { cn } from "@/utils/cn";

const ITEMS: { to: string; label: string; icon: LucideIcon; hero?: boolean }[] = [
  { to: "/home", label: "Home", icon: House },
  { to: "/cashier", label: "Cashier", icon: ScanLine },
  { to: "/growth", label: "Growth", icon: TrendingUp, hero: true },
  { to: "/transactions", label: "Transactions", icon: ReceiptText },
  { to: "/more", label: "More", icon: Grid2x2 },
];

export function BottomNavigation() {
  return (
    <nav
      aria-label="Primary"
      className="pb-safe relative z-30 shrink-0 border-t border-surface-line bg-white/95 px-2 pt-1.5 shadow-nav backdrop-blur"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, hero }) => (
          <li key={to} className="flex justify-center">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "group flex min-h-[52px] w-full flex-col items-center justify-end gap-1 rounded-2xl pb-1 text-[11px] font-semibold transition-colors",
                  isActive ? "text-navy" : "text-ink-faint hover:text-ink-soft",
                )
              }
            >
              {({ isActive }) =>
                hero ? (
                  <>
                    <span
                      className={cn(
                        "-mt-6 flex h-[52px] w-[52px] items-center justify-center rounded-[18px] border-4 border-white shadow-float transition-all duration-200 group-active:scale-90",
                        isActive ? "bg-navy text-gold" : "bg-gold text-navy-900",
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.4} />
                    </span>
                    <span className={cn(isActive ? "text-navy" : "text-ink-soft")}>{label}</span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "relative flex h-8 w-12 items-center justify-center rounded-full transition-all duration-200 group-active:scale-90",
                        isActive && "bg-gold-100",
                      )}
                    >
                      <Icon className="h-[21px] w-[21px]" strokeWidth={isActive ? 2.4 : 2} />
                    </span>
                    <span>{label}</span>
                  </>
                )
              }
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
