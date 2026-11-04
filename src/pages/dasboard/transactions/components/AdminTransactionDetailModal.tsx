// src/components/admin/transactions/AdminTransactionDetailModal.tsx
import React, { useState } from "react";
import {
  X,
  User,
  Calendar,
  FileText,
  ExternalLink,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import { toast } from "react-toastify";
// 🆕 Import specific update functions instead of the generic one
import { updateDepositStatus } from "../../../../services/deposit.service";
import { updateWithdrawalStatus } from "../../../../services/withdrawal.service";
import type {
  TransactionRecord,
  TransactionStatus,
} from "../../../../types/transaction.types";

interface Props {
  transaction: TransactionRecord | null;
  onClose: () => void;
  onUpdated: () => void;
}

const statusConfig: Record<
  TransactionStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  pending: {
    label: "Pending",
    icon: <Clock className="h-4 w-4" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  processing: {
    label: "Processing",
    icon: <Clock className="h-4 w-4 animate-pulse" />,
    classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  failed: {
    label: "Failed",
    icon: <XCircle className="h-4 w-4" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-4 w-4" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

export const AdminTransactionDetailModal: React.FC<Props> = ({
  transaction,
  onClose,
  onUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);

  if (!transaction) return null;
  const config = statusConfig[transaction.status];

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  // 🆕 Route update to the correct collection based on transaction type
  const handleStatusUpdate = async (newStatus: TransactionStatus) => {
    if (!window.confirm(`Mark this ${transaction.type} as ${newStatus}?`))
      return;

    let rejectionReason = "";
    if (newStatus === "failed") {
      rejectionReason =
        prompt("Please provide a reason for rejection (shown to user):") ||
        "Rejected by admin";
    }

    setIsUpdating(true);
    try {
      if (transaction.type === "deposit") {
        // Map unified status to deposit-specific status
        const depositStatus =
          newStatus === "completed" ? "confirmed" : "rejected";
        await updateDepositStatus(transaction.id, depositStatus, {
          rejectionReason,
        });
      } else if (transaction.type === "withdrawal") {
        // Map unified status to withdrawal-specific status
        const withdrawalStatus =
          newStatus === "completed" ? "approved" : "rejected";
        await updateWithdrawalStatus(transaction.id, withdrawalStatus, {
          rejectionReason,
        });
      }

      toast.success(`Transaction marked as ${newStatus}`);
      onUpdated();
      onClose();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 items-center justify-center rounded-xl border ${config.classes}`}
            >
              {config.icon}
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Transaction Details
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                ID: {transaction.id}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Amount & Status */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Amount
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">
                {transaction.amount.toLocaleString()}{" "}
                <span className="text-lg text-slate-400">
                  {transaction.currency}
                </span>
              </p>
              {transaction.usdValue &&
                transaction.usdValue !== transaction.amount && (
                  <p className="text-xs text-slate-500 mt-1">
                    ≈ ${transaction.usdValue.toLocaleString()} USD
                  </p>
                )}
            </div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1.5 text-sm font-semibold ${config.classes}`}
            >
              {config.icon}
              {config.label}
            </span>
          </div>

          {/* User Info */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <User className="h-4 w-4 text-cyan-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                User Information
              </h4>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Name</p>
                <p className="font-semibold text-white">
                  {transaction.userName}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Email</p>
                <p className="font-semibold text-white truncate">
                  {transaction.userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Transaction Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Details
              </h4>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400 w-24">Type:</span>
                <span className="text-sm font-semibold text-white capitalize">
                  {transaction.type}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400 w-24">
                  Description:
                </span>
                <span className="text-sm text-white">
                  {transaction.description}
                </span>
              </div>
              {transaction.txHash && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                  <span className="text-xs text-slate-400 w-24">Tx Hash:</span>
                  <a
                    href={`https://blockchain.com/tx/${transaction.txHash}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {transaction.txHash.slice(0, 8)}...
                    {transaction.txHash.slice(-6)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              )}
              {transaction.fee !== undefined && transaction.fee > 0 && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                  <span className="text-xs text-slate-400 w-24">Fee:</span>
                  <span className="text-sm font-semibold text-white">
                    ${transaction.fee.toFixed(2)}
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Timeline */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Calendar className="h-4 w-4 text-violet-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Timeline
              </h4>
            </div>
            <div className="flex items-center gap-3">
              <Clock className="h-4 w-4 text-amber-400" />
              <div className="flex-1">
                <p className="text-xs text-slate-400">Created</p>
                <p className="text-sm font-semibold text-white">
                  {formatDate(transaction.createdAt)}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Footer Actions (Only for pending/processing) */}
        {(transaction.status === "pending" ||
          transaction.status === "processing") && (
          <div className="sticky bottom-0 flex gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4">
            <button
              onClick={() => handleStatusUpdate("failed")}
              disabled={isUpdating}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
            >
              <XCircle className="h-4 w-4" />
              Mark Failed
            </button>
            <button
              onClick={() => handleStatusUpdate("completed")}
              disabled={isUpdating}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50"
            >
              {isUpdating ? (
                <Clock className="h-4 w-4 animate-spin" />
              ) : (
                <CheckCircle2 className="h-4 w-4" />
              )}
              Mark Completed
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
