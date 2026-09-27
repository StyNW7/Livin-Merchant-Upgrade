import { useEffect, useRef } from "react";
import { Navigate, Outlet, useLocation } from "react-router-dom";
import { BottomNavigation } from "./BottomNavigation";
import { GuestBanner, OfflineBanner } from "./Banners";
import { useSession } from "@/hooks/useApp";

const TAB_ROUTES = ["/home", "/cashier", "/growth", "/transactions", "/more"];

/** Authenticated / Explore Mode frame: banners, the single scroll area and the bottom navigation. */
export function AppLayout() {
  const { mode } = useSession();
  const location = useLocation();
  const scrollRef = useRef<HTMLElement>(null);
  const isTab = TAB_ROUTES.includes(location.pathname);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0 });
  }, [location.pathname]);

  if (mode === "none") return <Navigate to="/welcome" replace />;

  return (
    <>
      <GuestBanner />
      <OfflineBanner />
      <main ref={scrollRef} id="app-scroll" className="app-scroll relative min-h-0 flex-1 overflow-y-auto overflow-x-hidden">
        <div key={location.pathname} className="min-h-full animate-screen-in">
          <Outlet />
        </div>
      </main>
      {isTab && <BottomNavigation />}
    </>
  );
}
