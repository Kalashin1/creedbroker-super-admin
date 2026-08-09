/* eslint-disable react-hooks/set-state-in-effect */
// src/components/dashboard/Sidebar.tsx
import React, { useState, useEffect } from "react";
import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  TrendingUp,
  PieChart,
  ArrowDownToLine,
  ArrowUpFromLine,
  Receipt,
  User,
  CreditCard,
  Shield,
  FileCheck,
  Settings,
  HelpCircle,
  LogOut,
  ChevronLeft,
  ChevronDown,
  X,
  Sparkles,
  Wallet,
  Bot,
} from "lucide-react";
import { Landmark } from "lucide-react";
import { useAuth } from "../../../context/AuthContext"; 
import { signOut } from "../../../services/auth.service"; 
import { useMediaQuery } from "../../../hooks/useMediaQuery";
import { toast } from "react-toastify";
import { useNavigate } from "react-router-dom";
import { SCREENS } from "../../../navigation/constants";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface NavChild {
  label: string;
  to: string;
}

interface NavItem {
  label: string;
  icon: React.ElementType;
  to?: string;
  children?: NavChild[];
  badge?: string;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  mobileOpen: boolean;
  onToggleCollapse: () => void;
  onCloseMobile: () => void;
}

// ─────────────────────────────────────────────────────────────
// Navigation structure
// ─────────────────────────────────────────────────────────────
const NAV_GROUPS: NavGroup[] = [
  {
    label: "Overview",
    items: [{ label: "Dashboard", icon: LayoutDashboard, to: SCREENS.DASHBOARD }],
  },
  {
    label: "Investments",
    items: [
      {
        label: "Invest",
        icon: TrendingUp,
        children: [
          { label: "Packages", to: SCREENS.INVESTMENTS },
          { label: "Create Package", to: SCREENS.CREATE_INVESTMENT },
          { label: "History", to: SCREENS.PREVIOUS_INVESTMENT },
        ],
      },
      { label: "Portfolio", icon: PieChart, to: SCREENS.PORTFOLIO },
      {
        label: "AI Trader",
        icon: Bot,
        to: SCREENS.AI_TRADER,
        badge: "New",
      },
    ],
  },

  {
    label: "Wallet",
    items: [
      // 🆕 Added Wallets link here
      { label: "Wallets", icon: Wallet, to: SCREENS.WALLETS },
      { label: "Deposit", icon: ArrowDownToLine, to: SCREENS.DEPOSIT },
      {
        label: "Withdraw",
        icon: ArrowUpFromLine,
        to: SCREENS.WITHDRAWALS,
        badge: "New",
      },
      { label: "Transactions", icon: Receipt, to: SCREENS.TRANSACTIONS },
    ],
  },
  // {
  //   label: "Account",
  //   items: [
  //     { label: "Profile", icon: User, to: SCREENS.PROFILE },
  //     { label: "Bank Accounts", icon: Landmark, to: SCREENS.BANK },
  //     {
  //       label: "Payment Methods",
  //       icon: CreditCard,
  //       to: SCREENS.CARDS,
  //     },
  //     { label: "Security", icon: Shield, to: SCREENS.SECURITY },
  //     { label: "KYC Verification", icon: FileCheck, to: SCREENS.KYC },
  //   ],
  // },
];

const BOTTOM_ITEMS: NavItem[] = [
  // { label: "Settings", icon: Settings, to: SCREENS.SETTINGS },
  // { label: "Help & Support", icon: HelpCircle, to: SCREENS.SUPPORT },
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

const isPathActive = (
  pathname: string,
  to?: string,
  children?: NavChild[],
): boolean => {
  if (to && pathname === to) return true;
  if (children) {
    return children.some(
      (c) => pathname === c.to || pathname.startsWith(c.to + "/"),
    );
  }
  return false;
};

// ─────────────────────────────────────────────────────────────
// Sub-components
// ─────────────────────────────────────────────────────────────
const NavItemRow: React.FC<{
  item: NavItem;
  collapsed: boolean;
  pathname: string;
  onNavigate: () => void;
}> = ({ item, collapsed, pathname, onNavigate }) => {
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    if (
      item.children &&
      item.children.some((c) => isPathActive(pathname, c.to))
    ) {
      setExpanded(true);
    }
  }, [pathname, item.children]);

  const hasChildren = !!item.children && item.children.length > 0;
  const isActive = isPathActive(pathname, item.to, item.children);

  // Collapsed mode: icon only with native title tooltip
  if (collapsed) {
    const firstChildTo = item.children?.[0]?.to || item.to || "#";
    return (
      <NavLink
        to={firstChildTo}
        onClick={onNavigate}
        title={item.label}
        className={`group relative flex h-11 w-11 items-center justify-center rounded-xl transition ${
          isActive
            ? "bg-emerald-500/15 text-emerald-400"
            : "text-slate-400 hover:bg-slate-800 hover:text-white"
        }`}
      >
        <item.icon className="h-[18px] w-[18px]" />
        {isActive && (
          <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-r bg-emerald-400" />
        )}
      </NavLink>
    );
  }

  // Expanded mode with children
  if (hasChildren) {
    return (
      <div>
        <button
          onClick={() => setExpanded((v) => !v)}
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
            isActive
              ? "bg-emerald-500/10 text-emerald-300"
              : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
          }`}
        >
          <div
            className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
              isActive
                ? "bg-emerald-500/20 text-emerald-400"
                : "bg-slate-800 text-slate-400 group-hover:text-white"
            }`}
          >
            <item.icon className="h-[18px] w-[18px]" />
          </div>
          <span className="flex-1 text-sm font-medium">{item.label}</span>
          <ChevronDown
            className={`h-4 w-4 text-slate-500 transition-transform ${
              expanded ? "rotate-180" : ""
            }`}
          />
        </button>

        <div
          className={`mt-1 ml-5 space-y-0.5 overflow-hidden border-l border-slate-800 pl-4 transition-all ${
            expanded ? "max-h-96 opacity-100" : "max-h-0 opacity-0"
          }`}
        >
          {item.children!.map((child) => {
            const childActive = isPathActive(pathname, child.to);
            return (
              <NavLink
                key={child.to}
                to={child.to}
                onClick={onNavigate}
                className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm transition ${
                  childActive
                    ? "bg-emerald-500/10 font-medium text-emerald-300"
                    : "text-slate-400 hover:bg-slate-800/50 hover:text-white"
                }`}
              >
                <span
                  className={`h-1.5 w-1.5 rounded-full transition ${
                    childActive ? "bg-emerald-400" : "bg-slate-600"
                  }`}
                />
                {child.label}
              </NavLink>
            );
          })}
        </div>
      </div>
    );
  }

  // Expanded mode: simple leaf link
  return (
    <NavLink
      to={item.to!}
      onClick={onNavigate}
      className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
        isActive
          ? "bg-emerald-500/10 text-emerald-300"
          : "text-slate-300 hover:bg-slate-800/70 hover:text-white"
      }`}
    >
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg transition ${
          isActive
            ? "bg-emerald-500/20 text-emerald-400"
            : "bg-slate-800 text-slate-400 group-hover:text-white"
        }`}
      >
        <item.icon className="h-[18px] w-[18px]" />
      </div>
      <span className="flex-1 text-sm font-medium">{item.label}</span>
      {item.badge && (
        <span className="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
          {item.badge}
        </span>
      )}
    </NavLink>
  );
};

// ─────────────────────────────────────────────────────────────
// Main Sidebar
// ─────────────────────────────────────────────────────────────
const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  mobileOpen,
  onToggleCollapse,
  onCloseMobile,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const isDesktop = useMediaQuery("(min-width: 1024px)");

  const displayName = profile?.fullName || user?.displayName || "Investor";
  const email = profile?.email || user?.email || "";

  // On mobile, always use expanded mode
  const effectiveCollapsed = isDesktop ? collapsed : false;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      navigate(SCREENS.LOGIN, { replace: true });
    } catch {
      toast.error("Failed to sign out.");
    }
  };

  const handleNavigate = () => {
    if (!isDesktop) onCloseMobile();
  };

  const widthClass = effectiveCollapsed ? "w-[88px]" : "w-[280px]";

  const content = (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-slate-800 px-4 py-4">
        {effectiveCollapsed ? (
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-cyan-500">
            <Sparkles className="h-5 w-5 text-slate-950" strokeWidth={2.5} />
          </div>
        ) : (
          <div className="flex items-center gap-3 min-w-0">
            <div className="relative shrink-0">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
                {getInitials(displayName)}
              </div>
              <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold text-white">
                {displayName.split(" ")[0]}
              </p>
              <p className="truncate text-[11px] text-slate-500">{email}</p>
            </div>
          </div>
        )}

        {!isDesktop && (
          <button
            onClick={onCloseMobile}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Close sidebar"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto custom-scroll px-3 py-4">
        <div className="space-y-6">
          {NAV_GROUPS.map((group) => (
            <div key={group.label}>
              {!effectiveCollapsed && (
                <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
                  {group.label}
                </h3>
              )}
              {effectiveCollapsed && (
                <div className="mb-2 h-px bg-slate-800/60 mx-2" />
              )}
              <div className="space-y-0.5">
                {group.items.map((item) => (
                  <NavItemRow
                    key={item.label}
                    item={item}
                    collapsed={effectiveCollapsed}
                    pathname={location.pathname}
                    onNavigate={handleNavigate}
                  />
                ))}
              </div>
            </div>
          ))}
        </div>
      </nav>

      {/* Bottom section */}
      <div className="border-t border-slate-800 px-3 py-3 space-y-0.5">
        {!effectiveCollapsed && (
          <h3 className="mb-2 px-3 text-[11px] font-semibold uppercase tracking-wider text-slate-500">
            More
          </h3>
        )}
        {BOTTOM_ITEMS.map((item) => (
          <NavItemRow
            key={item.label}
            item={item}
            collapsed={effectiveCollapsed}
            pathname={location.pathname}
            onNavigate={handleNavigate}
          />
        ))}

        <button
          onClick={handleLogout}
          title="Sign out"
          className={`group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-red-500/10 ${
            effectiveCollapsed ? "justify-center" : ""
          }`}
        >
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition group-hover:bg-red-500/20">
            <LogOut className="h-[18px] w-[18px]" />
          </div>
          {!effectiveCollapsed && (
            <span className="text-sm font-medium text-red-400 group-hover:text-red-300">
              Sign out
            </span>
          )}
        </button>
      </div>

      {isDesktop && (
        <div className="border-t border-slate-800 p-3">
          <button
            onClick={onToggleCollapse}
            className="flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 py-2 text-xs font-medium text-slate-400 transition hover:border-slate-700 hover:bg-slate-800 hover:text-white"
            aria-label={
              effectiveCollapsed ? "Expand sidebar" : "Collapse sidebar"
            }
          >
            <ChevronLeft
              className={`h-4 w-4 transition-transform ${effectiveCollapsed ? "rotate-180" : ""}`}
            />
            {!effectiveCollapsed && <span>Collapse</span>}
          </button>
        </div>
      )}
    </div>
  );

  // Mobile: overlay sidebar
  if (!isDesktop) {
    return (
      <>
        <div
          className={`fixed inset-0 z-[60] bg-black/60 backdrop-blur-sm transition-opacity lg:hidden ${
            mobileOpen ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
          onClick={onCloseMobile}
        />

        <aside
          className={`fixed inset-y-0 left-0 z-[70] w-[280px] border-r border-slate-800 bg-slate-950 transition-transform duration-300 ease-out lg:hidden ${
            mobileOpen ? "translate-x-0" : "-translate-x-full"
          }`}
        >
          {content}
        </aside>
      </>
    );
  }

  // Desktop: collapsible rail
  return (
    <aside
      className={`hidden lg:flex lg:flex-col lg:flex-shrink-0 border-r border-slate-800 bg-slate-950 transition-[width] duration-300 ease-out ${widthClass}`}
    >
      {content}
    </aside>
  );
};

export default Sidebar;
