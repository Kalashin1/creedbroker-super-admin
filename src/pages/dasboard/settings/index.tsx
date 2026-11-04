// src/pages/admin/AdminSettings.tsx
import React, { useState, useEffect } from "react";
import {
  Settings,
  Loader2,
  RefreshCw,
  Globe,
  Shield,
  DollarSign,
  UserCog,
} from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  getGlobalSettings,
  getAdminPersonalSettings,
} from "../../../services/admin.settings.service";
import { GlobalLimitsSettings } from "./components/GlobalLimitsSettings";
import { GlobalTradingAndFeesSettings } from "./components/GlobalTradingAndFeesSettings";
import { AdminPersonalSettings } from "./components/AdminPersonalSettings";
import type {
  GlobalPlatformSettings,
  AdminPersonalSettings as AdminPrefs,
} from "../../../types/settings.types";
import DashboardLayout from "../components/Layout";

const AdminSettings: React.FC = () => {
  const { user } = useAuth();
  const [globalSettings, setGlobalSettings] =
    useState<GlobalPlatformSettings | null>(null);
  const [adminSettings, setAdminSettings] = useState<AdminPrefs | null>(null);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const [global, personal] = await Promise.all([
        getGlobalSettings(),
        getAdminPersonalSettings(user.uid),
      ]);
      setGlobalSettings(global);
      setAdminSettings(personal);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load settings");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  if (loading || !globalSettings || !adminSettings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
          <p className="text-sm text-slate-400">Loading settings...</p>
        </div>
      </div>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <Settings className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Platform Settings
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Configure global rules and your personal admin preferences
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" /> Refresh
          </button>
        </div>

        {/* Section Divider: Global Settings */}
        <div className="flex items-center gap-3 pt-4">
          <Globe className="h-5 w-5 text-emerald-400" />
          <h2 className="text-xl font-bold text-white">
            Global Platform Rules
          </h2>
          <span className="rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
            Affects All Users
          </span>
        </div>

        <div className="grid grid-cols-1 gap-6">
          <GlobalLimitsSettings
            initial={globalSettings.limits}
            onSaved={loadData}
          />
          <GlobalTradingAndFeesSettings
            trading={globalSettings.trading}
            fees={globalSettings.fees}
            onSaved={loadData}
          />
        </div>

        {/* Section Divider: Personal Settings */}
        <div className="flex items-center gap-3 pt-4">
          <UserCog className="h-5 w-5 text-cyan-400" />
          <h2 className="text-xl font-bold text-white">My Admin Preferences</h2>
          <span className="rounded-full bg-cyan-500/10 border border-cyan-500/20 px-2 py-0.5 text-[10px] font-semibold text-cyan-400">
            Personal Only
          </span>
        </div>
        {user && (
          <AdminPersonalSettings
            adminId={user.uid}
            initial={adminSettings}
            onSaved={loadData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminSettings;
