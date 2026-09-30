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
      className="pb-safe relative z-30 shrink-0 rounded-t-[26px] border-t border-surface-line/80 bg-white/95 px-2 pt-2 shadow-nav backdrop-blur-xl"
    >
      <ul className="grid grid-cols-5">
        {ITEMS.map(({ to, label, icon: Icon, hero }) => (
          <li key={to} className="flex justify-center">
            <NavLink
              to={to}
              className={({ isActive }) =>
                cn(
                  "group relative flex min-h-[54px] w-full flex-col items-center justify-end gap-1 rounded-2xl pb-1 text-[11px] font-semibold tracking-tight transition-colors",
                  isActive ? "text-navy-600" : "text-ink-faint hover:text-ink-soft",
                )
              }
            >
              {({ isActive }) =>
                hero ? (
                  <>
                    <span
                      className={cn(
                        "-mt-7 flex h-[56px] w-[56px] items-center justify-center rounded-full border-[5px] border-white transition-all duration-200 group-active:scale-90",
                        isActive
                          ? "bg-gradient-to-br from-navy-400 to-navy-600 text-white shadow-brand"
                          : "bg-gradient-to-br from-gold-300 to-gold-500 text-navy-900 shadow-glow",
                      )}
                    >
                      <Icon className="h-6 w-6" strokeWidth={2.5} />
                    </span>
                    <span className={cn("font-bold", isActive ? "text-navy-600" : "text-ink-soft")}>{label}</span>
                  </>
                ) : (
                  <>
                    <span
                      className={cn(
                        "relative flex h-8 w-14 items-center justify-center rounded-full transition-all duration-200 group-active:scale-90",
                        isActive ? "bg-navy-50" : "group-hover:bg-surface",
                      )}
                    >
                      <Icon className="h-[21px] w-[21px]" strokeWidth={isActive ? 2.4 : 2} />
                      {isActive && <span className="absolute -top-2 h-1 w-6 rounded-full bg-gold" aria-hidden />}
                    </span>
                    <span className={cn(isActive && "font-bold")}>{label}</span>
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
