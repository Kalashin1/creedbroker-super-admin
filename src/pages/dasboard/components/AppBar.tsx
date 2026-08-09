// src/components/dashboard/AppBar.tsx
import React, { useState } from "react";
import { Menu, Bell, Search, TrendingUp } from "lucide-react";
import NotificationDropdown from "./NotificationDropdown";
import ProfileDropdown from "./ProfileDropdown";
import { useAuth } from "../../../context/AuthContext";
import { useNotifications } from "../../../context/NotificationContext";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface AppBarProps {
  onToggleSidebar: () => void;
  displayName: string;
}

// ─────────────────────────────────────────────────────────────
// Mock data (replace with Firestore subscription later)
// ─────────────────────────────────────────────────────────────
const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    type: "success" as const,
    category: "transaction",
    title: "Deposit received",
    message: "Your deposit of $5,000.00 USDT has been credited to your wallet.",
    read: false,
    time: "2m ago",
    actionUrl: "/dashboard/transactions",
  },
  {
    id: "2",
    type: "success" as const,
    category: "investment",
    title: "Investment matured",
    message:
      "Your Gold Package investment has matured. $1,240 profit available.",
    read: false,
    time: "1h ago",
    actionUrl: "/dashboard/investments",
  },
  {
    id: "3",
    type: "success" as const,
    category: "kyc",
    title: "KYC verification approved",
    message:
      "Your identity has been verified. You now have full withdrawal access.",
    read: false,
    time: "1d ago",
    actionUrl: "/dashboard/profile",
  },
  {
    id: "4",
    type: "info" as const,
    category: "system",
    title: "New investment package available",
    message: "Check out our Platinum Package — up to 18% monthly returns.",
    read: true,
    time: "2d ago",
    actionUrl: "/dashboard/invest",
  },
  {
    id: "5",
    type: "warning" as const,
    category: "security",
    title: "New sign-in detected",
    message: "A new sign-in from Chrome on macOS in Lagos, Nigeria.",
    read: true,
    time: "3d ago",
    actionUrl: "/dashboard/security",
  },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const getInitials = (name: string): string =>
  name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((n) => n[0].toUpperCase())
    .join("") || "?";

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const AppBar: React.FC<AppBarProps> = ({ onToggleSidebar, displayName }) => {
  const { profile } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const { notifications, unreadCount, markAsRead, markAllAsRead } =
    useNotifications();

  const toggleNotif = () => {
    setNotifOpen((v) => !v);
    if (!notifOpen) setProfileOpen(false);
  };

  const toggleProfile = () => {
    setProfileOpen((v) => !v);
    if (!profileOpen) setNotifOpen(false);
  };

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl">
      <div className="flex h-16 items-center gap-3 px-4 sm:px-6">
        {/* Left: Sidebar toggle + Logo (mobile) */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-800 bg-slate-900/50 text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle sidebar"
          >
            <Menu className="h-5 w-5" />
          </button>

          {/* Mobile logo */}
          <div className="flex items-center gap-2 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-cyan-500">
              <TrendingUp
                className="h-4 w-4 text-slate-950"
                strokeWidth={2.5}
              />
            </div>
            <span className="text-sm font-bold text-white">
              Vertex<span className="text-emerald-400">Capital</span>
            </span>
          </div>
        </div>

        {/* Center: Search (desktop only) */}
        <div className="hidden flex-1 max-w-md mx-auto md:block">
          <div className="group relative">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500 transition group-focus-within:text-emerald-400" />
            <input
              type="text"
              placeholder="Search transactions, investments..."
              className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20"
            />
            <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-slate-700 bg-slate-800 px-1.5 py-0.5 text-[10px] font-medium text-slate-400 lg:inline">
              ⌘K
            </kbd>
          </div>
        </div>

        {/* Spacer (mobile) */}
        <div className="flex-1 md:hidden" />

        {/* Right: Actions */}
        <div className="flex items-center gap-2">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={toggleNotif}
              className={`relative flex h-10 w-10 items-center justify-center rounded-xl border transition ${
                notifOpen
                  ? "border-emerald-500/50 bg-emerald-500/10 text-emerald-400"
                  : "border-slate-800 bg-slate-900/50 text-slate-400 hover:border-slate-700 hover:bg-slate-800 hover:text-white"
              }`}
              aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
              aria-expanded={notifOpen}
            >
              <Bell className="h-5 w-5" />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 min-w-[20px] items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-bold text-white ring-2 ring-slate-950">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>

            <NotificationDropdown
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              onMarkAsRead={markAsRead}
              onMarkAllRead={markAllAsRead}
            />
          </div>

          {/* Divider */}
          <div className="hidden h-8 w-px bg-slate-800 sm:block" />

          {/* Profile */}
          <div className="relative">
            <button
              onClick={toggleProfile}
              className={`flex items-center gap-2.5 rounded-xl border py-1.5 pl-1.5 pr-3 transition ${
                profileOpen
                  ? "border-emerald-500/50 bg-emerald-500/10"
                  : "border-slate-800 bg-slate-900/50 hover:border-slate-700 hover:bg-slate-800"
              }`}
              aria-label="Open profile menu"
              aria-expanded={profileOpen}
            >
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-[11px] font-bold text-slate-950">
                {getInitials(displayName)}
              </div>
              <div className="hidden text-left sm:block">
                <p className="text-xs font-semibold leading-tight text-white">
                  {displayName.split(" ")[0]}
                </p>
                <p className="text-[10px] leading-tight text-slate-500">
                  {profile?.role === "admin" ? "Admin" : "Investor"}
                </p>
              </div>
            </button>

            <ProfileDropdown
              open={profileOpen}
              onClose={() => setProfileOpen(false)}
            />
          </div>
        </div>
      </div>

      {/* Animation keyframes */}
      <style>{`
        @keyframes scaleIn {
          from { opacity: 0; transform: scale(0.96) translateY(-4px); }
          to { opacity: 1; transform: scale(1) translateY(0); }
        }
      `}</style>
    </header>
  );
};

export default AppBar;
