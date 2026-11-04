// src/components/admin/profile/AdminAuditLog.tsx
import React, { useState, useEffect } from "react";
import {
  Activity,
  Loader2,
  Shield,
  UserCheck,
  Ban,
  DollarSign,
  Key,
  FileCheck,
  ArrowUpFromLine,
  ArrowDownToLine,
  Lock,
} from "lucide-react";
import { fetchAdminAuditLog } from "../../../../services/profile.service";
import type { AdminAuditLog, AdminAction } from "../../../../types/profile.types";

interface Props {
  adminId: string;
}

const actionConfig: Record<
  AdminAction,
  { label: string; icon: React.ElementType; color: string }
> = {
  kyc_approved: {
    label: "KYC Approved",
    icon: UserCheck,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  kyc_rejected: {
    label: "KYC Rejected",
    icon: UserCheck,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  kyc_revoked: {
    label: "KYC Revoked",
    icon: UserCheck,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  user_blocked: {
    label: "User Blocked",
    icon: Ban,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  user_unblocked: {
    label: "User Unblocked",
    icon: Shield,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  user_restricted: {
    label: "User Restricted",
    icon: Shield,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  user_unrestricted: {
    label: "User Unrestricted",
    icon: Shield,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  balance_adjusted: {
    label: "Balance Adjusted",
    icon: DollarSign,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  withdrawal_approved: {
    label: "Withdrawal Approved",
    icon: ArrowUpFromLine,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  withdrawal_rejected: {
    label: "Withdrawal Rejected",
    icon: ArrowUpFromLine,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  deposit_confirmed: {
    label: "Deposit Confirmed",
    icon: ArrowDownToLine,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  deposit_rejected: {
    label: "Deposit Rejected",
    icon: ArrowDownToLine,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  recovery_phrase_viewed: {
    label: "Recovery Phrase Viewed",
    icon: Key,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  recovery_phrase_sent: {
    label: "Recovery Phrase Sent",
    icon: Key,
    color: "text-red-400 bg-red-500/10 border-red-500/20",
  },
  wallet_frozen: {
    label: "Wallet Frozen",
    icon: Lock,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  wallet_unfrozen: {
    label: "Wallet Unfrozen",
    icon: Lock,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  wallet_generated: {
    label: "Wallet Generated",
    icon: Key,
    color: "text-cyan-400 bg-cyan-500/10 border-cyan-500/20",
  },
  email_sent: {
    label: "Email Sent",
    icon: FileCheck,
    color: "text-violet-400 bg-violet-500/10 border-violet-500/20",
  },
};

export const AdminAuditLog: React.FC<Props> = ({ adminId }) => {
  const [logs, setLogs] = useState<AdminAuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      const data = await fetchAdminAuditLog(adminId, 50);
      setLogs(data);
      setLoading(false);
    };
    load();
  }, [adminId]);

  const formatDateTime = (date: Date) => {
    return date.toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-violet-400" />
          <h3 className="text-lg font-bold text-white">Your Activity Log</h3>
        </div>
        <span className="text-xs text-slate-500">
          {logs.length} recent actions
        </span>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      ) : logs.length === 0 ? (
        <div className="p-10 text-center">
          <Activity className="h-10 w-10 text-slate-600 mx-auto mb-3" />
          <p className="text-slate-400 text-sm">No activity recorded yet</p>
          <p className="text-slate-600 text-xs mt-1">
            Your admin actions will appear here
          </p>
        </div>
      ) : (
        <div className="divide-y divide-slate-800 max-h-[500px] overflow-y-auto custom-scroll">
          {logs.map((log) => {
            const config = actionConfig[log.action] || {
              label: log.action,
              icon: Activity,
              color: "text-slate-400 bg-slate-500/10 border-slate-500/20",
            };
            const Icon = config.icon;
            return (
              <div
                key={log.id}
                className="flex items-start gap-3 p-4 hover:bg-slate-800/30 transition"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border ${config.color}`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-white">
                        {config.label}
                      </p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {log.details}
                      </p>
                      {log.targetUserName && (
                        <p className="text-[11px] text-slate-500 mt-1">
                          Target:{" "}
                          <span className="text-slate-300">
                            {log.targetUserName}
                          </span>
                        </p>
                      )}
                    </div>
                    <span className="text-[11px] text-slate-500 whitespace-nowrap tabular-nums">
                      {formatDateTime(log.createdAt)}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
