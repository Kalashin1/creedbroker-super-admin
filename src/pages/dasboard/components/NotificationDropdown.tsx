// src/components/dashboard/NotificationDropdown.tsx
import React, { useRef } from "react";
import { Link } from "react-router-dom";
import {
  Bell,
  Check,
  CheckCheck,
  DollarSign,
  TrendingUp,
  ShieldCheck,
  Info,
  Sparkles,
  Settings,
} from "lucide-react";
import { useClickOutside } from "../../../hooks/useClickOutside";
import { SCREENS } from "../../../navigation/constants";
import type { Notification } from "../../../types/notification.types";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────


interface NotificationDropdownProps {
  open: boolean;
  onClose: () => void;
  notifications: Notification[];
  onMarkAsRead: (id: string) => void;
  onMarkAllRead: () => void;
}

// ─────────────────────────────────────────────────────────────
// Icon map
// ─────────────────────────────────────────────────────────────
const iconMap: Record<
  string,
  { icon: React.ElementType; bg: string; fg: string }
> = {
  transaction: {
    icon: DollarSign,
    bg: "bg-emerald-500/10 border-emerald-500/20",
    fg: "text-emerald-400",
  },
  investment: {
    icon: TrendingUp,
    bg: "bg-cyan-500/10 border-cyan-500/20",
    fg: "text-cyan-400",
  },
  security: {
    icon: ShieldCheck,
    bg: "bg-amber-500/10 border-amber-500/20",
    fg: "text-amber-400",
  },
  kyc: {
    icon: Check,
    bg: "bg-emerald-500/10 border-emerald-500/20",
    fg: "text-emerald-400",
  },
  system: {
    icon: Sparkles,
    bg: "bg-violet-500/10 border-violet-500/20",
    fg: "text-violet-400",
  },
};

const getIcon = (category: string) =>
  iconMap[category] || {
    icon: Info,
    bg: "bg-slate-500/10 border-slate-500/20",
    fg: "text-slate-400",
  };

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const NotificationDropdown: React.FC<NotificationDropdownProps> = ({
  open,
  onClose,
  notifications,
  onMarkAsRead,
  onMarkAllRead,
}) => {
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, onClose);

  if (!open) return null;

  const unreadCount = notifications.filter((n) => !n.read).length;
  
  // 🆕 Display only the 4 most recent notifications
  const recentNotifications = notifications.slice(0, 4);

  return (
    <div
      ref={ref}
      className="absolute right-0 top-full mt-2 w-[360px] max-w-[calc(100vw-2rem)] origin-top-right animate-[scaleIn_0.15s_ease-out] z-50"
    >
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/95 shadow-2xl shadow-black/40 backdrop-blur-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-semibold text-white">Notifications</h3>
            {unreadCount > 0 && (
              <span className="flex h-5 min-w-[20px] items-center justify-center rounded-full bg-emerald-500/15 px-1.5 text-[11px] font-semibold text-emerald-400">
                {unreadCount}
              </span>
            )}
          </div>
          {unreadCount > 0 && (
            <button
              onClick={onMarkAllRead}
              className="flex items-center gap-1 text-xs font-medium text-slate-400 hover:text-emerald-400 transition"
            >
              <CheckCheck className="h-3.5 w-3.5" />
              Mark all read
            </button>
          )}
        </div>

        {/* List */}
        <div className="max-h-[420px] overflow-y-auto custom-scroll">
          {recentNotifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center px-6 py-12 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-800/60">
                <Bell className="h-5 w-5 text-slate-500" />
              </div>
              <p className="mt-3 text-sm font-medium text-slate-300">
                All caught up
              </p>
              <p className="mt-1 text-xs text-slate-500">
                You have no notifications yet.
              </p>
            </div>
          ) : (
            <ul>
              {recentNotifications.map((n) => {
                const { icon: Icon, bg, fg } = getIcon(n.category);
                const Wrapper: React.ElementType = n.actionUrl ? Link : "div";
                const wrapperProps = n.actionUrl
                  ? { to: n.actionUrl, onClick: () => onMarkAsRead(n.id) }
                  : { onClick: () => onMarkAsRead(n.id) };

                return (
                  <li key={n.id}>
                    <Wrapper
                      {...wrapperProps}
                      className={`group relative flex gap-3 px-4 py-3 transition hover:bg-slate-800/50 ${
                        !n.read ? "bg-slate-800/20" : ""
                      }`}
                    >
                      {/* Unread dot */}
                      {!n.read && (
                        <span className="absolute left-1.5 top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full bg-emerald-400" />
                      )}

                      {/* Icon */}
                      <div
                        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${bg}`}
                      >
                        <Icon className={`h-4 w-4 ${fg}`} />
                      </div>

                      {/* Content */}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm leading-snug ${
                              !n.read
                                ? "font-semibold text-white"
                                : "text-slate-200"
                            }`}
                          >
                            {n.title}
                          </p>
                          <span className="shrink-0 text-[11px] text-slate-500">
                            {new Date(n.createdAt).toTimeString()}
                          </span>
                        </div>
                        <p className="mt-0.5 text-xs leading-relaxed text-slate-400 line-clamp-2">
                          {n.message}
                        </p>
                      </div>
                    </Wrapper>
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t border-slate-800 px-4 py-2.5">
            <Link
              to={SCREENS.NOTIFICATIONS}
              onClick={onClose}
              className="flex items-center justify-center gap-1.5 rounded-lg py-1.5 text-xs font-semibold text-emerald-400 hover:bg-slate-800/50 hover:text-emerald-300 transition"
            >
              <Settings className="h-3 w-3" />
              View all notifications
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default NotificationDropdown;