// src/components/dashboard/DashboardLayout.tsx
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import AppBar from "./AppBar";
import Sidebar from "./Sidebar";
import Footer from "./Footer";
import { useAuth } from "../../../context/AuthContext";
import { useSettings } from "../../../context/SettingsContext"; // 🆕 Import Settings
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { useSessionTimeout } from "../../../hooks/useSessionTimeout";
import {SCREENS} from "../../../navigation/constants.ts"

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface DashboardLayoutProps {
  children: React.ReactNode;
}

const SIDEBAR_COLLAPSED_KEY = "dashboard.sidebar.collapsed";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const DashboardLayout: React.FC<DashboardLayoutProps> = ({ children }) => {
  const navigate = useNavigate();
  const location = useLocation();

  // 🆕 Enforce session timeout on every dashboard page
  useSessionTimeout();

  const { user, loading } = useAuth();
  console.log("user", user)
  const { settings } = useSettings(); // 🆕 Get settings for display name
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
  });

  // 🆕 Compute display name from settings, fallback to email
  const displayName =
    settings?.displayName || user?.email?.split("@")[0] || "User";

  // Redirect unauthenticated users
  useEffect(() => {
    if (!loading && !user) {
      navigate(SCREENS.LOGIN, { replace: true });
    }
  }, [user, loading, navigate]);

  // Persist collapsed preference
  useEffect(() => {
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(collapsed));
  }, [collapsed]);

  // Close mobile sidebar on route change
  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  // Hamburger behavior:
  // - Desktop: toggle collapsed state
  // - Mobile: toggle overlay
  const handleToggleSidebar = () => {
    if (isDesktop) {
      setCollapsed((v) => !v);
    } else {
      setMobileOpen((v) => !v);
    }
  };

  // ─── Loading state ───
  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-slate-950">
        <div className="flex flex-col items-center gap-3">
          <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-400" />
          <p className="text-sm text-slate-400">Loading your dashboard...</p>
        </div>
      </div>
    );
  }

  // ─── Unauthenticated — render nothing while redirecting ───
  if (!user) return null;

  // ─── Main layout ───
  return (
    <div className="flex h-screen overflow-x-hidden overflow-y-clip scrollbar-none bg-slate-950 text-slate-100">
      <Sidebar
        collapsed={collapsed}
        mobileOpen={mobileOpen}
        onToggleCollapse={() => setCollapsed((v) => !v)}
        onCloseMobile={() => setMobileOpen(false)}
      />

      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        {/* 🆕 Pass displayName to AppBar */}
        <AppBar
          displayName={displayName ?? ""}
          onToggleSidebar={handleToggleSidebar}
        />

        <main className="flex-1 overflow-x-hidden overflow-y-scroll scrollbar-none p-4 sm:p-6 lg:p-8">
          {children}
        </main>

        <Footer />
      </div>
    </div>
  );
};

export default DashboardLayout;
