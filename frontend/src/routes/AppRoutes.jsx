import React, { useState, useEffect } from 'react';
import { ROUTES } from '../constants/routes';
import { RootLayout } from '../layouts/RootLayout';
import { useAuth } from '../hooks/useAuth';

// Real Domain Pages
import { DashboardPage } from '../pages/DashboardPage';
import { LoginPage } from '../pages/LoginPage';
import { SignUpPage } from '../pages/SignUpPage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { OnboardingPage } from '../pages/OnboardingPage';
import { ProfilePage } from '../pages/ProfilePage';
import { RoomsPage } from '../pages/RoomsPage';
import { ReservationsPage } from '../pages/ReservationsPage';
import { FrontDeskPage } from '../pages/FrontDeskPage';
import { GuestsPage } from '../pages/GuestsPage';
import { HousekeepingPage } from '../pages/HousekeepingPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { FinancePage } from '../pages/FinancePage';
import { RevenuePage } from '../pages/RevenuePage';
import { DistributionPage } from '../pages/DistributionPage';
import { MarketplacePage } from '../pages/MarketplacePage';
import { ConciergePage } from '../pages/ConciergePage';
import { LoyaltyPage } from '../pages/LoyaltyPage';
import { CorporatePage } from '../pages/CorporatePage';
import { AnalyticsPage } from '../pages/AnalyticsPage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { AdminPage } from '../pages/AdminPage';

// System Pages
import { HealthStatusPage } from '../pages/HealthStatusPage';
import { SecurityProfilePage } from '../pages/SecurityProfilePage';
import { DesignSystemPage } from '../pages/DesignSystemPage';
import { UnauthorizedPage } from '../pages/UnauthorizedPage';
import { NotFoundPage } from '../pages/NotFoundPage';

export function AppRoutes() {
  const { user, loading, isAuthenticated } = useAuth();

  // Initial path determination
  const getInitialPath = () => {
    const path = window.location.pathname;
    if (path && path !== '/' && path !== '/index.html') {
      return path;
    }
    const token = localStorage.getItem('nexgile_access_token');
    return token ? ROUTES.DASHBOARD : ROUTES.LOGIN;
  };

  const [currentPath, setCurrentPath] = useState(getInitialPath);

  // Sync with browser location
  useEffect(() => {
    const handlePopState = () => {
      const path = window.location.pathname;
      if (path && path !== '/' && path !== '/index.html') {
        setCurrentPath(path);
      } else {
        const token = localStorage.getItem('nexgile_access_token');
        setCurrentPath(token ? ROUTES.DASHBOARD : ROUTES.LOGIN);
      }
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    setCurrentPath(path);
    window.history.pushState({}, '', path);
  };

  // Auth routing guard:
  // If not logged in and not on an auth route, redirect to /login
  const isAuthRoute =
    currentPath === ROUTES.LOGIN ||
    currentPath === ROUTES.SIGNUP ||
    currentPath === ROUTES.FORGOT_PASSWORD;

  useEffect(() => {
    if (!loading) {
      if (!isAuthenticated && !isAuthRoute) {
        navigate(ROUTES.LOGIN);
      } else if (isAuthenticated && isAuthRoute) {
        navigate(ROUTES.DASHBOARD);
      }
    }
  }, [isAuthenticated, loading, isAuthRoute]);

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex flex-col items-center justify-center gap-3">
        <div className="w-10 h-10 rounded-xl bg-indigo-600 flex items-center justify-center font-bold text-white text-lg animate-pulse">
          N
        </div>
        <div className="text-xs text-slate-400 font-medium tracking-wide">
          Initializing Nexgile-TravAI...
        </div>
      </div>
    );
  }

  const renderContent = () => {
    switch (currentPath) {
      case ROUTES.HOME:
      case ROUTES.DASHBOARD:
        return <DashboardPage onNavigate={navigate} />;
      case ROUTES.LOGIN:
        return <LoginPage onNavigate={navigate} />;
      case ROUTES.SIGNUP:
        return <SignUpPage onNavigate={navigate} />;
      case ROUTES.FORGOT_PASSWORD:
        return <ForgotPasswordPage onNavigate={navigate} />;
      case ROUTES.ONBOARDING:
        return <OnboardingPage onNavigate={navigate} />;
      case ROUTES.PROFILE:
        return <ProfilePage onNavigate={navigate} />;
      
      // Core PMS & Front Desk
      case ROUTES.PMS.ROOT:
      case ROUTES.PMS.ROOMS:
      case ROUTES.PMS.ROOM_TYPES:
        return <RoomsPage onNavigate={navigate} />;
      case ROUTES.RESERVATIONS.ROOT:
      case ROUTES.RESERVATIONS.NEW:
      case ROUTES.INVENTORY.ROOT:
      case ROUTES.INVENTORY.ALLOTMENTS:
        return <ReservationsPage onNavigate={navigate} />;
      case ROUTES.FRONT_DESK:
        return <FrontDeskPage onNavigate={navigate} />;
      case ROUTES.GUESTS:
        return <GuestsPage onNavigate={navigate} />;

      // Operations
      case ROUTES.HOUSEKEEPING:
        return <HousekeepingPage onNavigate={navigate} />;
      case ROUTES.MAINTENANCE:
        return <MaintenancePage onNavigate={navigate} />;

      // Commercial & Yield
      case ROUTES.FINANCE.ROOT:
      case ROUTES.FINANCE.FOLIOS:
      case ROUTES.FINANCE.INVOICES:
        return <FinancePage onNavigate={navigate} />;
      case ROUTES.REVENUE.ROOT:
      case ROUTES.REVENUE.PRICING:
      case ROUTES.REVENUE.OVERVIEW:
        return <RevenuePage onNavigate={navigate} />;
      case ROUTES.DISTRIBUTION.ROOT:
      case ROUTES.DISTRIBUTION.CHANNELS:
        return <DistributionPage onNavigate={navigate} />;
      case ROUTES.MARKETPLACE.ROOT:
      case ROUTES.MARKETPLACE.PRODUCTS:
      case ROUTES.MARKETPLACE.CHECKOUT:
        return <MarketplacePage onNavigate={navigate} />;

      // Experience & Corporate
      case ROUTES.CONCIERGE.ROOT:
      case ROUTES.CONCIERGE.CHAT:
      case ROUTES.CONCIERGE.TICKETS:
        return <ConciergePage onNavigate={navigate} />;
      case ROUTES.LOYALTY.ROOT:
      case ROUTES.LOYALTY.MEMBERS:
        return <LoyaltyPage onNavigate={navigate} />;
      case ROUTES.CORPORATE.ROOT:
      case ROUTES.CORPORATE.POLICIES:
      case ROUTES.CORPORATE.EXPENSES:
        return <CorporatePage onNavigate={navigate} />;

      // Analytics, Notifications & Administration
      case ROUTES.ANALYTICS:
        return <AnalyticsPage onNavigate={navigate} />;
      case ROUTES.NOTIFICATIONS:
        return <NotificationsPage onNavigate={navigate} />;
      case ROUTES.ADMIN:
      case ROUTES.GOVERNANCE.ROOT:
      case ROUTES.GOVERNANCE.AUDIT:
      case ROUTES.GOVERNANCE.AI_LOGS:
        return <AdminPage onNavigate={navigate} />;

      // System Pages
      case ROUTES.HEALTH:
        return <HealthStatusPage onNavigate={navigate} />;
      case ROUTES.SECURITY:
        return <SecurityProfilePage onNavigate={navigate} />;
      case ROUTES.DESIGN_SYSTEM:
        return <DesignSystemPage onNavigate={navigate} />;
      case ROUTES.UNAUTHORIZED:
        return <UnauthorizedPage onNavigate={navigate} />;
      default:
        // Handle dynamic reservation details e.g. /reservations/resv-xxx
        if (currentPath.startsWith('/reservations/')) {
          return <ReservationsPage onNavigate={navigate} />;
        }
        return <NotFoundPage onNavigate={navigate} />;
    }
  };

  // Dedicated layout for Auth & Onboarding pages
  const isDedicatedFlow =
    currentPath === ROUTES.LOGIN ||
    currentPath === ROUTES.SIGNUP ||
    currentPath === ROUTES.FORGOT_PASSWORD ||
    currentPath === ROUTES.ONBOARDING;

  if (isDedicatedFlow) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center">
        {renderContent()}
      </div>
    );
  }

  return (
    <RootLayout currentPath={currentPath} onNavigate={navigate}>
      {renderContent()}
    </RootLayout>
  );
}
