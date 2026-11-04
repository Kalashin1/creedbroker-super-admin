// src/pages/admin/AdminProfile.tsx
import React, { useState, useEffect } from "react";
import { User, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import { useAuth } from "../../../context/AuthContext";
import type { UserProfile } from "../../../types/user.types";
import { AdminProfileHeader } from "./components/AdminProfileHeader";
import { AdminProfileForm } from "./components/AdminProfileForm";
import { AdminSecurityCard } from "./components/AdminSecurityCard";
import { AdminAuditLog } from "./components/AdminAuditLog";
import { AdminPreferencesCard } from "./components/AdminPreferences";
import DashboardLayout from "../components/Layout";

const AdminProfile: React.FC = () => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const snap = await getDoc(doc(db, "users", user.uid));
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      }
    } catch (err) {
      console.error(err);
      toast.error("Failed to load profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, [user]);

  if (loading || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
          <p className="text-sm text-slate-400">Loading profile...</p>
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
              <User className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                My Profile
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage your admin account and preferences
              </p>
            </div>
          </div>
          <button
            onClick={loadProfile}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        {/* Profile Header */}
        <AdminProfileHeader profile={profile} />

        {/* Main Grid */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <AdminProfileForm profile={profile} onUpdated={loadProfile} />
            <AdminPreferencesCard adminId={profile.uid} />
          </div>

          {/* Right Column - Security & Audit */}
          <div className="space-y-6">
            <AdminSecurityCard profile={profile} onUpdated={loadProfile} />
          </div>
        </div>

        {/* Full-width Audit Log */}
        <AdminAuditLog adminId={profile.uid} />
      </div>
    </DashboardLayout>
  );
};

export default AdminProfile;
