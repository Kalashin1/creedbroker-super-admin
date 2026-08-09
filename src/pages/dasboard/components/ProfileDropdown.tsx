// src/components/dashboard/ProfileDropdown.tsx
import React, { useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  TrendingUp,
  LogOut,
  Settings,
  HelpCircle,
  CreditCard,
  ChevronRight,
  Shield,
} from "lucide-react";
import { useAuth } from "../../../context/AuthContext";
import { signOut } from "../../../services/auth.service";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { SCREENS } from "../../../navigation/constants";

interface ProfileDropdownProps {
  open: boolean;
  onClose: () => void;
}

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

const roleLabels: Record<string, string> = {
  client: "Investor",
  admin: "Administrator",
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const ProfileDropdown: React.FC<ProfileDropdownProps> = ({ open, onClose }) => {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  if (!open) return null;

  const handleLogout = async () => {
    try {
      await signOut();
      toast.success("Signed out successfully.");
      navigate("/login", { replace: true });
    } catch {
      toast.error("Failed to sign out. Please try again.");
    }
  };

  const displayName = profile?.fullName || user?.displayName || "Investor";
  const email = profile?.email || user?.email || "";
  const role = profile?.role || "client";

  const menuItems = [
    {
      label: "View profile",
      icon: User,
      to: SCREENS.PROFILE,
      description: "Manage your personal info",
    },
    {
      label: "Start Trading",
      icon: TrendingUp,
      to: SCREENS.TRADING,
      description: "Make a trade",
      highlight: true,
    },
    {
      label: "Payment methods",
      icon: CreditCard,
      to: SCREENS.CARDS,
      description: "Cards & bank accounts",
    },
    {
      label: "Security",
      icon: Shield,
      to: SCREENS.SECURITY,
      description: "Password & 2FA",
    },
    {
      label: "Settings",
      icon: Settings,
      to: SCREENS.SETTINGS,
      description: "Preferences",
    },
    {
      label: "Help & support",
      icon: HelpCircle,
      to: SCREENS.SUPPORT,
      description: "Get in touch",
    },
  ];

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[300px] max-w-[calc(100vw-2rem)] origin-top-right animate-[scaleIn_0.15s_ease-out]"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* User header */}
        <Link
          to="/dashboard/profile"
          onClick={onClose}
          className="flex items-center gap-3 border-b border-slate-800 px-4 py-4 transition hover:bg-slate-800/50"
        >
          {/* Avatar */}
          <div className="relative">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950 shadow-lg shadow-emerald-500/20">
              {getInitials(displayName)}
            </div>
            <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-slate-900 bg-emerald-400" />
          </div>

          {/* Info */}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-semibold text-white">
              {displayName}
            </p>
            <p className="truncate text-xs text-slate-400">{email}</p>
          </div>

          <ChevronRight className="h-4 w-4 text-slate-500" />
        </Link>

        {/* Role badge */}
        <div className="border-b border-slate-800 px-4 py-2.5">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-emerald-400">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
              {roleLabels[role] || "Investor"}
            </span>
            {profile?.kycStatus === "verified" && (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2.5 py-0.5 text-[11px] font-semibold text-cyan-400">
                <Shield className="h-3 w-3" />
                KYC Verified
              </span>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="p-1.5">
          {menuItems.map((item) => (
            <Link
              key={item.label}
              to={item.to}
              onClick={onClose}
              className={`group flex items-center gap-3 rounded-xl px-3 py-2.5 transition ${
                item.highlight
                  ? "bg-gradient-to-r from-emerald-500/10 to-cyan-500/10 border border-emerald-500/20 hover:from-emerald-500/20 hover:to-cyan-500/20"
                  : "hover:bg-slate-800/60"
              }`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${
                  item.highlight
                    ? "bg-emerald-500/20 text-emerald-400"
                    : "bg-slate-800 text-slate-400 group-hover:text-white"
                } transition`}
              >
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p
                  className={`text-sm font-medium ${
                    item.highlight ? "text-emerald-300" : "text-slate-200"
                  }`}
                >
                  {item.label}
                </p>
                <p className="text-[11px] text-slate-500">{item.description}</p>
              </div>
            </Link>
          ))}
        </div>

        {/* Logout */}
        <div className="border-t border-slate-800 p-1.5">
          <button
            onClick={handleLogout}
            className="group flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-red-500/10"
          >
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-red-500/10 text-red-400 transition group-hover:bg-red-500/20">
              <LogOut className="h-4 w-4" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-red-400 group-hover:text-red-300">
                Sign out
              </p>
              <p className="text-[11px] text-slate-500">End your session</p>
            </div>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ProfileDropdown;
