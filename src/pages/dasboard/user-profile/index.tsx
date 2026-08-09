// src/pages/admin/UserProfile.tsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Loader2,
  RefreshCw,
  User as UserIcon,
  FileCheck,
  Landmark,
  Briefcase,
  Shield,
  Key,
} from "lucide-react";
import { toast } from "react-toastify";
import { fetchUserProfileDetail } from "../../../services/adminUserProfile.service";
import type { UserProfileDetail } from "../../../services/adminUserProfile.service";
import ProfileHeader from "./components/ProfileHeader";
import ProfileOverview from "./components/ProfileOverview";
import ProfileKYC from "./components/ProfileKYC";
import ProfileBankAccounts from "./components/ProfileBankAccounts";
import ProfileInvestments from "./components/ProfileInvestments";
import ProfileSecurity from "./components/ProfileSecurity";
import ProfileActions from "./components/ProfileActions";
import DashboardLayout from "../components/Layout";
import { SCREENS } from "../../../navigation/constants";
import { AdminUserToolsModal } from "./components/AdminUserToolsModal";
import { AdminAccountActionsModal } from "../components/AdminAccountActionsModal";
import { ProfileWallets } from "./components/ProfileWallets";

type TabId = "overview" | "kyc" | "banks" | "investments" | "security";

const TABS: { id: TabId; label: string; icon: React.ElementType }[] = [
  { id: "overview", label: "Overview", icon: UserIcon },
  { id: "kyc", label: "KYC Documents", icon: FileCheck },
  { id: "banks", label: "Bank Accounts", icon: Landmark },
  { id: "investments", label: "Investments", icon: Briefcase },
  { id: "security", label: "Security", icon: Shield },
];

const UserProfilePage: React.FC = () => {
  const [showToolsModal, setShowToolsModal] = useState(false);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const [data, setData] = useState<UserProfileDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [showAccountModal, setShowAccountModal] = useState(false);

  const loadData = async () => {
    if (!userId) return;
    setLoading(true);
    try {
      const result = await fetchUserProfileDetail(userId);
      if (!result) {
        toast.error("User not found");
        navigate(SCREENS.DASHBOARD);
        return;
      }
      setData(result);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load user profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [userId]);

  if (loading || !data) {
    return (
      <DashboardLayout>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="text-sm text-slate-400">Loading user profile...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const { profile, bankAccounts, investments, loginActivity, sessions } = data;


  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <button
            onClick={() => navigate(SCREENS.DASHBOARD)}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Users
          </button>
          {/* <div> */}
          <button
            onClick={() => setShowToolsModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 px-4 py-2 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20"
          >
            <Key className="h-4 w-4" />
            Admin Tools
          </button>
          <button
            onClick={() => setShowAccountModal(true)}
            className="inline-flex items-center gap-2 rounded-xl border border-violet-500/30 bg-violet-500/10 px-4 py-2 text-sm font-semibold text-violet-400 transition hover:bg-violet-500/20"
          >
            <Shield className="h-4 w-4" />
            Manage Account
          </button>
          <button
            onClick={loadData}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
          {/* </div> */}
        </div>

        {/* Profile Header */}
        <ProfileHeader profile={profile} />

        {showAccountModal && (
          <AdminAccountActionsModal
            user={profile}
            onClose={() => setShowAccountModal(false)}
            onUpdated={loadData}
          />
        )}

        {/* Main Layout */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left: Tabs + Actions */}
          <div className="lg:col-span-1 space-y-6">
            {/* Tabs */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-3">
              <div className="space-y-1">
                {TABS.map((tab) => {
                  const Icon = tab.icon;
                  const isActive = activeTab === tab.id;
                  return (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-left transition ${
                        isActive
                          ? "bg-emerald-500/10 border border-emerald-500/30"
                          : "hover:bg-slate-800/50 border border-transparent"
                      }`}
                    >
                      <Icon
                        className={`h-4 w-4 ${
                          isActive ? "text-emerald-400" : "text-slate-500"
                        }`}
                      />
                      <span
                        className={`text-sm font-semibold ${
                          isActive ? "text-white" : "text-slate-300"
                        }`}
                      >
                        {tab.label}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Admin Actions */}
            <ProfileActions profile={profile} onUpdated={loadData} />
          </div>

          {/* Right: Content */}
          <div className="lg:col-span-2 space-y-6">
            {activeTab === "overview" && (
              <>
                <ProfileOverview profile={profile} />
                <ProfileWallets profile={profile} />
                <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
                  <ProfileBankAccounts bankAccounts={bankAccounts} />
                  <ProfileInvestments investments={investments} />
                </div>
              </>
            )}

            {activeTab === "kyc" && <ProfileKYC profile={profile} />}

            {activeTab === "banks" && (
              <ProfileBankAccounts bankAccounts={bankAccounts} />
            )}

            {activeTab === "investments" && (
              <ProfileInvestments investments={investments} />
            )}

            {activeTab === "security" && (
              <ProfileSecurity
                loginActivity={loginActivity}
                sessions={sessions}
              />
            )}
          </div>
        </div>
        {showToolsModal && (
          <AdminUserToolsModal
            user={profile}
            onClose={() => setShowToolsModal(false)}
            onUpdated={loadData}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default UserProfilePage;
