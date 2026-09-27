import { Suspense, lazy, type ComponentType, type LazyExoticComponent, type ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { SessionProvider } from "@/context/SessionProvider";
import { DataProvider } from "@/context/DataProvider";
import { CartProvider } from "@/context/CartProvider";
import { UIProvider } from "@/context/UIProvider";
import { MobileShell } from "@/components/layout/MobileShell";
import { AppLayout } from "@/components/layout/AppLayout";
import { DemoControls } from "@/components/layout/DemoControls";
import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { UpdatePrompt } from "@/components/pwa/UpdatePrompt";
import { PageSkeleton } from "@/components/common/PageSkeleton";
import { useSession } from "@/hooks/useApp";

import SplashPage from "@/pages/onboarding/SplashPage";
import OnboardingPage from "@/pages/onboarding/OnboardingPage";
import LoginPage from "@/pages/auth/LoginPage";
import HomePage from "@/pages/home/HomePage";
import CashierPage from "@/pages/cashier/CashierPage";
import GrowthPage from "@/pages/growth/GrowthPage";
import TransactionsPage from "@/pages/transactions/TransactionsPage";
import MorePage from "@/pages/more/MorePage";

const CreateAccountPage = lazy(() => import("@/pages/auth/CreateAccountPage"));
const WhyLivinPage = lazy(() => import("@/pages/onboarding/WhyLivinPage"));
const NotificationsPage = lazy(() => import("@/pages/home/NotificationsPage"));
const SearchPage = lazy(() => import("@/pages/home/SearchPage"));
const QrPaymentPage = lazy(() => import("@/pages/home/QrPaymentPage"));
const ScorePage = lazy(() => import("@/pages/growth/ScorePage"));
const MissionsPage = lazy(() => import("@/pages/growth/MissionsPage"));
const InsightsPage = lazy(() => import("@/pages/growth/InsightsPage"));
const ReadinessPage = lazy(() => import("@/pages/growth/ReadinessPage"));
const OutlookPage = lazy(() => import("@/pages/growth/OutlookPage"));
const FinancingPage = lazy(() => import("@/pages/growth/FinancingPage"));
const FinancingDetailPage = lazy(() => import("@/pages/growth/FinancingDetailPage"));
const TransactionDetailPage = lazy(() => import("@/pages/transactions/TransactionDetailPage"));
const OrdersPage = lazy(() => import("@/pages/more/OrdersPage"));
const ProductsPage = lazy(() => import("@/pages/more/ProductsPage"));
const InventoryPage = lazy(() => import("@/pages/more/InventoryPage"));
const SuppliersPage = lazy(() => import("@/pages/more/SuppliersPage"));
const SupplierDetailPage = lazy(() => import("@/pages/more/SupplierDetailPage"));
const EmployeesPage = lazy(() => import("@/pages/more/EmployeesPage"));
const OutletsPage = lazy(() => import("@/pages/more/OutletsPage"));
const SettlementPage = lazy(() => import("@/pages/more/SettlementPage"));
const SettlementDetailPage = lazy(() => import("@/pages/more/SettlementDetailPage"));
const ExpensesPage = lazy(() => import("@/pages/more/ExpensesPage"));
const FinancePage = lazy(() => import("@/pages/more/FinancePage"));
const ReportsPage = lazy(() => import("@/pages/more/ReportsPage"));
const PromotionsPage = lazy(() => import("@/pages/more/PromotionsPage"));
const PromotionDetailPage = lazy(() => import("@/pages/more/PromotionDetailPage"));
const CustomersPage = lazy(() => import("@/pages/more/CustomersPage"));
const LoyaltyPage = lazy(() => import("@/pages/more/LoyaltyPage"));
const LearnPage = lazy(() => import("@/pages/more/LearnPage"));
const LessonPage = lazy(() => import("@/pages/more/LessonPage"));
const EcosystemPage = lazy(() => import("@/pages/more/EcosystemPage"));
const ProgramsPage = lazy(() => import("@/pages/more/ProgramsPage"));
const ProfilePage = lazy(() => import("@/pages/more/ProfilePage"));
const SecurityPage = lazy(() => import("@/pages/more/SecurityPage"));
const SettingsPage = lazy(() => import("@/pages/more/SettingsPage"));
const HelpPage = lazy(() => import("@/pages/more/HelpPage"));
const SupportChatPage = lazy(() => import("@/pages/more/SupportChatPage"));
const CalendarPage = lazy(() => import("@/pages/more/CalendarPage"));
const DevicesPage = lazy(() => import("@/pages/more/DevicesPage"));
const NotFoundPage = lazy(() => import("@/pages/NotFoundPage"));

function Lazy({ children }: { children: ReactNode }) {
  return <Suspense fallback={<PageSkeleton />}>{children}</Suspense>;
}

/** Business data is keyed by mode and scenario so Explore Mode never touches saved merchant data. */
function DataScope({ children }: { children: ReactNode }) {
  const { mode, scenario, isGuest } = useSession();
  return (
    <DataProvider key={`${mode}-${scenario}`} persist={!isGuest}>
      <CartProvider key={`cart-${mode}`} persist={!isGuest}>
        <UIProvider>{children}</UIProvider>
      </CartProvider>
    </DataProvider>
  );
}

const lazyRoutes: [string, LazyExoticComponent<ComponentType>][] = [
  ["/why", WhyLivinPage],
  ["/notifications", NotificationsPage],
  ["/search", SearchPage],
  ["/qr-payment", QrPaymentPage],
  ["/growth/score", ScorePage],
  ["/growth/missions", MissionsPage],
  ["/growth/insights", InsightsPage],
  ["/growth/readiness", ReadinessPage],
  ["/growth/outlook", OutlookPage],
  ["/financing", FinancingPage],
  ["/financing/:id", FinancingDetailPage],
  ["/transactions/:id", TransactionDetailPage],
  ["/orders", OrdersPage],
  ["/products", ProductsPage],
  ["/inventory", InventoryPage],
  ["/suppliers", SuppliersPage],
  ["/suppliers/:id", SupplierDetailPage],
  ["/employees", EmployeesPage],
  ["/outlets", OutletsPage],
  ["/settlement", SettlementPage],
  ["/settlement/:id", SettlementDetailPage],
  ["/expenses", ExpensesPage],
  ["/finance", FinancePage],
  ["/reports", ReportsPage],
  ["/promotions", PromotionsPage],
  ["/promotions/:id", PromotionDetailPage],
  ["/customers", CustomersPage],
  ["/loyalty", LoyaltyPage],
  ["/learn", LearnPage],
  ["/learn/:id", LessonPage],
  ["/ecosystem", EcosystemPage],
  ["/programs", ProgramsPage],
  ["/profile", ProfilePage],
  ["/security", SecurityPage],
  ["/settings", SettingsPage],
  ["/help", HelpPage],
  ["/support-chat", SupportChatPage],
  ["/calendar", CalendarPage],
  ["/devices", DevicesPage],
];

export default function App() {
  return (
    <BrowserRouter>
      <SessionProvider>
        <MobileShell>
          <DataScope>
            <Routes>
              <Route path="/" element={<SplashPage />} />
              <Route path="/welcome" element={<OnboardingPage />} />
              <Route path="/login" element={<LoginPage />} />
              <Route path="/create-account" element={<Lazy><CreateAccountPage /></Lazy>} />
              <Route element={<AppLayout />}>
                <Route path="/home" element={<HomePage />} />
                <Route path="/cashier" element={<CashierPage />} />
                <Route path="/growth" element={<GrowthPage />} />
                <Route path="/transactions" element={<TransactionsPage />} />
                <Route path="/more" element={<MorePage />} />
                {lazyRoutes.map(([path, Page]) => (
                  <Route key={path} path={path} element={<Lazy><Page /></Lazy>} />
                ))}
                <Route path="/categories" element={<Navigate to="/products?view=categories" replace />} />
                <Route path="/livinpoin" element={<Navigate to="/ecosystem#livinpoin" replace />} />
              </Route>
              <Route path="*" element={<Lazy><NotFoundPage /></Lazy>} />
            </Routes>
            <DemoControls />
            <InstallPrompt />
            <UpdatePrompt />
          </DataScope>
        </MobileShell>
      </SessionProvider>
    </BrowserRouter>
  );
}
