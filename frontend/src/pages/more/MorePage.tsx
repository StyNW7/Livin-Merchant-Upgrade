import { Link, useNavigate } from "react-router-dom";
import {
  BadgeCheck,
  BarChart3,
  BookOpen,
  Boxes,
  CalendarDays,
  ChevronRight,
  CircleHelp,
  ClipboardList,
  Coins,
  Download,
  Gift,
  Landmark,
  LogOut,
  Megaphone,
  MonitorSmartphone,
  Package,
  PiggyBank,
  ReceiptText,
  Search,
  Settings,
  ShieldCheck,
  Sparkles,
  Store,
  Truck,
  UserRoundCog,
  Users,
  Wallet,
  Waypoints,
  type LucideIcon,
} from "lucide-react";
import { TabHeader } from "@/components/layout/TopAppBar";
import { AppIcon, Avatar } from "@/components/common/Brand";
import { ProgressBar } from "@/components/common/ProgressBar";
import { StatusBadge } from "@/components/common/StatusBadge";
import { useData, useSession, useUI } from "@/hooks/useApp";
import { useInventoryAlerts, useProfileStrength } from "@/hooks/useBusiness";
import { APP_VERSION } from "@/data/merchant";
import { useInstallApp } from "@/hooks/useInstallApp";
import { openInstallSheet } from "@/pwa/events";

interface Item {
  label: string;
  icon: LucideIcon;
  to: string;
  badge?: number;
}

export default function MorePage() {
  const navigate = useNavigate();
  const { merchant, isGuest, logout } = useSession();
  const { orders, heldOrders } = useData();
  const { confirm, openAssistant } = useUI();
  const profile = useProfileStrength();
  const app = useInstallApp();
  const inventory = useInventoryAlerts();
  const openOrders = orders.filter((o) => o.status === "New" || o.status === "Preparing" || o.status === "Ready").length;

  const groups: { title: string; items: Item[] }[] = [
    {
      title: "Operate",
      items: [
        { label: "Orders", icon: ClipboardList, to: "/orders", badge: openOrders + heldOrders.length },
        { label: "Products", icon: Package, to: "/products" },
        { label: "Inventory", icon: Boxes, to: "/inventory", badge: inventory.low.length },
        { label: "Suppliers", icon: Truck, to: "/suppliers" },
        { label: "Staff", icon: UserRoundCog, to: "/employees" },
        { label: "Outlets", icon: Store, to: "/outlets" },
        { label: "Calendar", icon: CalendarDays, to: "/calendar" },
        { label: "Devices", icon: MonitorSmartphone, to: "/devices" },
      ],
    },
    {
      title: "Finance",
      items: [
        { label: "Settlements", icon: ReceiptText, to: "/settlement" },
        { label: "Expenses", icon: Wallet, to: "/expenses" },
        { label: "Reports", icon: PiggyBank, to: "/finance" },
        { label: "Financing", icon: Landmark, to: "/financing" },
      ],
    },
    {
      title: "Grow",
      items: [
        { label: "Analytics", icon: BarChart3, to: "/reports" },
        { label: "Promotions", icon: Megaphone, to: "/promotions" },
        { label: "Customers", icon: Users, to: "/customers" },
        { label: "Loyalty", icon: Gift, to: "/loyalty" },
        { label: "Learn", icon: BookOpen, to: "/learn" },
      ],
    },
    {
      title: "Mandiri",
      items: [
        { label: "Livin’ Ecosystem", icon: Waypoints, to: "/ecosystem" },
        { label: "Programs", icon: BadgeCheck, to: "/programs" },
        { label: "Livin’poin", icon: Coins, to: "/ecosystem#livinpoin" },
      ],
    },
    {
      title: "Account",
      items: [
        { label: "Business Profile", icon: Store, to: "/profile" },
        { label: "Security", icon: ShieldCheck, to: "/security" },
        { label: "Settings", icon: Settings, to: "/settings" },
        { label: "Help", icon: CircleHelp, to: "/help" },
      ],
    },
  ];

  return (
    <div className="pb-8">
      <TabHeader title="More" subtitle="Everything to run and grow your business" />
      <div className="space-y-6 px-5 pt-1">
        <Link to="/profile" className="card flex items-center gap-3 p-4 transition hover:shadow-float">
          <Avatar initials={merchant.initials} size={52} tone="navy" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <p className="truncate text-[16px] font-extrabold text-ink">{merchant.name}</p>
              <StatusBadge status="Verified" />
            </div>
            <p className="truncate text-[12.5px] text-ink-muted">
              {merchant.owner} · {merchant.businessType}
            </p>
            <div className="mt-2 flex items-center gap-2">
              <ProgressBar value={profile.strength} tone="gold" size="xs" />
              <span className="shrink-0 text-[11.5px] font-bold text-ink-soft">Profile {profile.strength}%</span>
            </div>
          </div>
          <ChevronRight className="h-5 w-5 text-ink-faint" />
        </Link>

        <div className="grid grid-cols-[1fr_auto] gap-2">
          <button type="button" onClick={() => navigate("/search")} className="flex h-12 items-center gap-2 rounded-2xl border border-surface-line bg-white px-4 text-left text-[13.5px] text-ink-faint shadow-card">
            <Search className="h-[18px] w-[18px]" /> Search features, products, help...
          </button>
          <button type="button" onClick={openAssistant} className="flex h-12 items-center gap-1.5 rounded-2xl bg-navy px-3.5 text-[13px] font-semibold text-white shadow-float" aria-label="Business Assistant">
            <Sparkles className="h-4 w-4 text-gold" /> Assistant
          </button>
        </div>

        {!app.standalone && !app.justInstalled && (
          <button
            type="button"
            onClick={openInstallSheet}
            className="hero-navy flex w-full items-center gap-3 rounded-3xl p-4 text-left text-white shadow-float transition active:scale-[0.99]"
          >
            <AppIcon size={48} className="ring-2 ring-white/20" />
            <span className="min-w-0 flex-1">
              <span className="block text-[15px] font-bold">Get the Livin Merchant app</span>
              <span className="block text-[12.5px] text-white/75">Faster access from your home screen, even offline</span>
            </span>
            <span className="inline-flex h-9 shrink-0 items-center gap-1.5 rounded-xl bg-gold px-3 text-[13px] font-bold text-navy-900">
              <Download className="h-4 w-4" /> Install
            </span>
          </button>
        )}

        {groups.map((g) => (
          <section key={g.title}>
            <h2 className="mb-2.5 px-1 text-[12px] font-bold uppercase tracking-[0.1em] text-ink-muted">{g.title}</h2>
            <div className="card grid grid-cols-4 gap-y-4 px-2 py-4">
              {g.items.map((item) => (
                <Link key={item.label} to={item.to} className="group flex flex-col items-center gap-1.5 rounded-2xl px-1 text-center">
                  <span className="relative flex h-12 w-12 items-center justify-center rounded-2xl bg-navy-50 text-navy transition group-hover:bg-navy group-hover:text-gold group-active:scale-90">
                    <item.icon className="h-[22px] w-[22px]" />
                    {!!item.badge && (
                      <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-danger px-1 text-[10.5px] font-bold text-white ring-2 ring-white">
                        {item.badge}
                      </span>
                    )}
                  </span>
                  <span className="text-[11.5px] font-semibold leading-tight text-ink-soft">{item.label}</span>
                </Link>
              ))}
            </div>
          </section>
        ))}

        <button
          type="button"
          onClick={() =>
            confirm({
              title: isGuest ? "Leave Explore Mode?" : "Log out of Livin Merchant?",
              message: isGuest
                ? "Changes you made while exploring will not be kept. Log in anytime to use Livin Merchant for your business."
                : "You will need your Mandiri credentials to log in again. Your data stays safe.",
              confirmLabel: isGuest ? "Leave" : "Log out",
              tone: "danger",
              onConfirm: () => {
                logout();
                navigate("/welcome", { replace: true });
              },
            })
          }
          className="card flex w-full items-center justify-center gap-2 py-3.5 text-[14px] font-semibold text-danger hover:bg-danger-soft/40"
        >
          <LogOut className="h-[18px] w-[18px]" /> {isGuest ? "Exit Explore Mode" : "Logout"}
        </button>
        <p className="text-center text-[11.5px] text-ink-faint">Livin Merchant v{APP_VERSION} · PT Bank Mandiri (Persero) Tbk</p>
      </div>
    </div>
  );
}
