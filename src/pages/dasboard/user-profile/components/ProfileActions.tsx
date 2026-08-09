// src/components/admin/profile/ProfileActions.tsx
import React, { useState } from "react";
import {
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Ban,
  Unlock,
  Bell,
  DollarSign,
  Trash2,
  Shield,
  Loader2,
} from "lucide-react";
import { toast } from "react-toastify";
import { createNotification } from "../../../../services/notification.service";
import { updateUserStatus, updateUserKYC } from "../../../../services/admin.service";
import { adminAdjustBalance } from "../../../../services/adminUserProfile.service";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
  onUpdated: () => void;
}

const ProfileActions: React.FC<Props> = ({ profile, onUpdated }) => {
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  const handleVerifyKYC = async () => {
    if (!window.confirm(`Verify KYC for ${profile.fullName}?`)) return;
    setIsProcessing("verify_kyc");
    try {
      await updateUserKYC(profile.uid, "verified");
      await createNotification(profile.uid, {
        title: "KYC Verification Approved",
        message: "Your identity has been successfully verified.",
        category: "account",
        type: "success",
        priority: "high",
        actionUrl: "/dashboard/profile",
        sendEmail: true,
      });
      toast.success("KYC verified");
      onUpdated();
    } catch (err) {
      toast.error("Failed to verify KYC");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRejectKYC = async () => {
    if (!window.confirm(`Reject KYC for ${profile.fullName}?`)) return;
    setIsProcessing("reject_kyc");
    try {
      await updateUserKYC(profile.uid, "rejected");
      await createNotification(profile.uid, {
        title: "KYC Rejected",
        message:
          "Your KYC was rejected. Please resubmit with correct documents.",
        category: "account",
        type: "error",
        priority: "high",
        actionUrl: "/dashboard/kyc",
        sendEmail: true,
      });
      toast.success("KYC rejected");
      onUpdated();
    } catch (err) {
      toast.error("Failed to reject KYC");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleRestrict = async () => {
    if (!window.confirm(`Restrict ${profile.fullName}'s account?`)) return;
    setIsProcessing("restrict");
    try {
      await updateUserStatus(profile.uid, "restricted");
      await createNotification(profile.uid, {
        title: "Account Restricted",
        message: "Your account has been temporarily restricted.",
        category: "security",
        type: "warning",
        priority: "high",
        sendEmail: true,
      });
      toast.success("Account restricted");
      onUpdated();
    } catch (err) {
      toast.error("Failed to restrict account");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleBlock = async () => {
    if (!window.confirm(`Block ${profile.fullName}'s account?`)) return;
    setIsProcessing("block");
    try {
      await updateUserStatus(profile.uid, "blocked");
      await createNotification(profile.uid, {
        title: "Account Blocked",
        message: "Your account has been blocked.",
        category: "security",
        type: "error",
        priority: "urgent",
        sendEmail: true,
      });
      toast.success("Account blocked");
      onUpdated();
    } catch (err) {
      toast.error("Failed to block account");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleUnblock = async () => {
    if (!window.confirm(`Unblock ${profile.fullName}'s account?`)) return;
    setIsProcessing("unblock");
    try {
      await updateUserStatus(profile.uid, "active");
      await createNotification(profile.uid, {
        title: "Account Unblocked",
        message: "Your account has been unblocked.",
        category: "account",
        type: "success",
        priority: "high",
        sendEmail: true,
      });
      toast.success("Account unblocked");
      onUpdated();
    } catch (err) {
      toast.error("Failed to unblock account");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleAdjustBalance = async () => {
    const amount = prompt(
      `Adjust USD balance for ${profile.fullName} (current: $${profile.balance?.usd || 0}):`,
      (profile.balance?.usd || 0).toString(),
    );
    if (amount === null) return;
    const numAmount = Number(amount);
    if (isNaN(numAmount) || numAmount < 0) {
      toast.error("Invalid amount");
      return;
    }
    setIsProcessing("balance");
    try {
      await adminAdjustBalance(profile.uid, { usd: numAmount });
      await createNotification(profile.uid, {
        title: "Balance Updated",
        message: `Your USD balance has been updated to $${numAmount.toLocaleString()}.`,
        category: "transaction",
        type: "info",
        priority: "normal",
        sendEmail: true,
      });
      toast.success("Balance updated");
      onUpdated();
    } catch (err) {
      toast.error("Failed to adjust balance");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSendNotification = async () => {
    const message = prompt(`Send notification to ${profile.fullName}:`);
    if (!message) return;
    setIsProcessing("notify");
    try {
      await createNotification(profile.uid, {
        title: "Message from CreedMarket",
        message,
        category: "system",
        type: "info",
        priority: "normal",
        sendEmail: true,
      });
      toast.success("Notification sent");
    } catch (err) {
      toast.error("Failed to send notification");
    } finally {
      setIsProcessing(null);
    }
  };

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    color,
    loadingKey,
  }: {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    color: string;
    loadingKey: string;
  }) => {
    const isLoading = isProcessing === loadingKey;
    const colorClasses: Record<string, string> = {
      emerald:
        "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
      red: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20",
      amber:
        "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
      cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20",
      violet:
        "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20",
      slate:
        "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white",
    };

    return (
      <button
        onClick={onClick}
        disabled={isLoading}
        className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
          colorClasses[color]
        }`}
      >
        {isLoading ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
        ) : (
          <Icon className="h-3.5 w-3.5" />
        )}
        {label}
      </button>
    );
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Shield className="h-5 w-5 text-violet-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Admin Actions
        </h3>
      </div>

      <div className="space-y-4">
        {/* KYC Actions */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            KYC Management
          </p>
          <div className="grid grid-cols-2 gap-2">
            <ActionButton
              onClick={handleVerifyKYC}
              icon={CheckCircle2}
              label="Verify KYC"
              color="emerald"
              loadingKey="verify_kyc"
            />
            <ActionButton
              onClick={handleRejectKYC}
              icon={XCircle}
              label="Reject KYC"
              color="red"
              loadingKey="reject_kyc"
            />
          </div>
        </div>

        {/* Account Status */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Account Status
          </p>
          <div className="grid grid-cols-2 gap-2">
            {profile.accountStatus !== "restricted" && (
              <ActionButton
                onClick={handleRestrict}
                icon={AlertTriangle}
                label="Restrict"
                color="amber"
                loadingKey="restrict"
              />
            )}
            {profile.accountStatus === "restricted" && (
              <ActionButton
                onClick={handleUnblock}
                icon={Unlock}
                label="Unrestrict"
                color="emerald"
                loadingKey="unblock"
              />
            )}
            {profile.accountStatus !== "blocked" && (
              <ActionButton
                onClick={handleBlock}
                icon={Ban}
                label="Block"
                color="red"
                loadingKey="block"
              />
            )}
            {profile.accountStatus === "blocked" && (
              <ActionButton
                onClick={handleUnblock}
                icon={Unlock}
                label="Unblock"
                color="emerald"
                loadingKey="unblock"
              />
            )}
          </div>
        </div>

        {/* Financial Actions */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Financial
          </p>
          <ActionButton
            onClick={handleAdjustBalance}
            icon={DollarSign}
            label="Adjust Balance"
            color="cyan"
            loadingKey="balance"
          />
        </div>

        {/* Communication */}
        <div>
          <p className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
            Communication
          </p>
          <ActionButton
            onClick={handleSendNotification}
            icon={Bell}
            label="Send Notification"
            color="violet"
            loadingKey="notify"
          />
        </div>
      </div>
    </div>
  );
};

export default ProfileActions;
