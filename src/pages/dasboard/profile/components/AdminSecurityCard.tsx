// src/components/admin/profile/AdminSecurityCard.tsx
import React, { useState } from "react";
import { Shield, Key, Fingerprint, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "react-toastify";
import { updateDoc, doc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../../lib/firebase";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
  onUpdated: () => void;
}

export const AdminSecurityCard: React.FC<Props> = ({ profile, onUpdated }) => {
  const [isToggling, setIsToggling] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [passwords, setPasswords] = useState({
    current: "",
    new: "",
    confirm: "",
  });

  const handleToggle2FA = async () => {
    setIsToggling(true);
    try {
      const newStatus = !profile.verification?.twoFactorEnabled;
      await updateDoc(doc(db, "users", profile.uid), {
        "verification.twoFactorEnabled": newStatus,
        updatedAt: serverTimestamp(),
      });
      toast.success(`2FA ${newStatus ? "enabled" : "disabled"}`);
      onUpdated();
    } catch (err) {
      toast.error("Failed to update 2FA");
    } finally {
      setIsToggling(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (passwords.new !== passwords.confirm) {
      toast.error("Passwords do not match");
      return;
    }
    if (passwords.new.length < 8) {
      toast.error("Password must be at least 8 characters");
      return;
    }
    setIsChangingPassword(true);
    try {
      // In production, use Firebase Auth's updatePassword
      const {
        getAuth,
        updatePassword,
        EmailAuthProvider,
        reauthenticateWithCredential,
      } = await import("firebase/auth");
      const auth = getAuth();
      const user = auth.currentUser;
      if (!user || !user.email) throw new Error("No user");

      const credential = EmailAuthProvider.credential(
        user.email,
        passwords.current,
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, passwords.new);

      toast.success("Password changed successfully");
      setShowPasswordForm(false);
      setPasswords({ current: "", new: "", confirm: "" });
    } catch (err: any) {
      toast.error(err.message || "Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const twoFactorEnabled = profile.verification?.twoFactorEnabled || false;

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
          <Shield className="h-5 w-5 text-amber-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Security Settings</h3>
          <p className="text-xs text-slate-400">Manage your account security</p>
        </div>
      </div>

      <div className="space-y-4">
        {/* 2FA Toggle */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Fingerprint className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Two-Factor Authentication
              </p>
              <p className="text-[11px] text-slate-500">
                Add an extra layer of security to your account
              </p>
            </div>
          </div>
          <button
            onClick={handleToggle2FA}
            disabled={isToggling}
            className={`relative h-6 w-11 rounded-full transition ${twoFactorEnabled ? "bg-emerald-500" : "bg-slate-700"} disabled:opacity-50`}
          >
            {isToggling ? (
              <Loader2 className="absolute top-0.5 left-3 h-5 w-5 animate-spin text-white" />
            ) : (
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${twoFactorEnabled ? "left-5" : "left-0.5"}`}
              />
            )}
          </button>
        </div>

        {/* Change Password */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                <Key className="h-4 w-4 text-cyan-400" />
              </div>
              <div>
                <p className="text-sm font-semibold text-white">
                  Change Password
                </p>
                <p className="text-[11px] text-slate-500">
                  Update your account password
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowPasswordForm(!showPasswordForm)}
              className="rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-white transition"
            >
              {showPasswordForm ? "Cancel" : "Change"}
            </button>
          </div>

          {showPasswordForm && (
            <form
              onSubmit={handleChangePassword}
              className="mt-4 space-y-3 pt-4 border-t border-slate-800"
            >
              <input
                type="password"
                placeholder="Current password"
                value={passwords.current}
                onChange={(e) =>
                  setPasswords({ ...passwords, current: e.target.value })
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
                required
              />
              <input
                type="password"
                placeholder="New password"
                value={passwords.new}
                onChange={(e) =>
                  setPasswords({ ...passwords, new: e.target.value })
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
                required
              />
              <input
                type="password"
                placeholder="Confirm new password"
                value={passwords.confirm}
                onChange={(e) =>
                  setPasswords({ ...passwords, confirm: e.target.value })
                }
                className="w-full rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
                required
              />
              <button
                type="submit"
                disabled={isChangingPassword}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 py-2.5 text-sm font-bold text-white disabled:opacity-50"
              >
                {isChangingPassword ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <CheckCircle2 className="h-4 w-4" />
                )}
                Update Password
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
