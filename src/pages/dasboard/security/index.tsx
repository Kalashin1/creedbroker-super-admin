// src/pages/admin/Security.tsx
import React, { useState, useEffect } from "react";
import { Shield, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import {
  getGlobalSecuritySettings,
  getSecurityAlerts,
  getPendingKYCUsers,
} from "../../../services/security.service";
import { SecurityStats } from "./components/SecurityStats";
import { GlobalSecuritySettings } from "./components/GlobalSecuritySettings";
import { PendingKYCQueue } from "./components/PendingKYCQueue";
import DashboardLayout from "../components/Layout";

const AdminSecurity: React.FC = () => {
  const [settings, setSettings] = useState<any>(null);
  const [alerts, setAlerts] = useState<any[]>([]);
  const [pendingKYC, setPendingKYC] = useState<any[]>([]);
  const [blockedCount, setBlockedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [settingsData, alertsData, kycData, blockedSnap] =
        await Promise.all([
          getGlobalSecuritySettings(),
          getSecurityAlerts(20),
          getPendingKYCUsers(20),
          getDocs(
            query(
              collection(db, "users"),
              where("accountStatus", "==", "blocked"),
            ),
          ),
        ]);

      setSettings(settingsData);
      setAlerts(alertsData.filter((a: any) => !a.reviewed));
      setPendingKYC(kycData);
      setBlockedCount(blockedSnap.size);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load security data");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  if (loading || !settings) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
          <p className="text-sm text-slate-400">
            Loading security dashboard...
          </p>
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
              <Shield className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Security Dashboard
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage platform security rules and review user compliance
              </p>
            </div>
          </div>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" /> Refresh Data
          </button>
        </div>

        {/* Stats */}
        <SecurityStats
          alertsCount={alerts.length}
          pendingKYCCount={pendingKYC.length}
          blockedUsersCount={blockedCount}
          avgSessionTime={`${settings.sessionTimeoutMinutes}m`}
        />

        {/* Global Settings */}
        <GlobalSecuritySettings
          initialSettings={settings}
          onUpdated={loadData}
        />

        {/* Pending KYC Queue */}
        <PendingKYCQueue
          users={pendingKYC}
          loading={loading}
          onReviewed={loadData}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminSecurity;
