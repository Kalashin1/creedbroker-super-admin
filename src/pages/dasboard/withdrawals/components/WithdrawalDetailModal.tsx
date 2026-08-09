// src/components/admin/withdrawals/WithdrawalDetailModal.tsx
import React from "react";
import {
  X,
  User,
  Building2,
  Hash,
  Route,
  DollarSign,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import type { WithdrawalRequest } from "../../../../types/transaction.types";
import WithdrawalStatusBadge from "./WithdrawalStatusBadge";

interface Props {
  withdrawal: WithdrawalRequest | null;
  onClose: () => void;
  onApprove: (id: string) => void;
  onReject: (id: string) => void;
}

const WithdrawalDetailModal: React.FC<Props> = ({
  withdrawal,
  onClose,
  onApprove,
  onReject,
}) => {
  if (!withdrawal) return null;

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const maskAccount = (num: string) =>
    num.length <= 4 ? num : `••••${num.slice(-4)}`;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 z-10">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <DollarSign className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Withdrawal Details
              </h2>
              <p className="text-xs text-slate-500 font-mono">
                ID: {withdrawal.id}
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
          {/* Status + Amount */}
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                Amount
              </p>
              <p className="text-3xl font-bold text-white tabular-nums">
                ${withdrawal.amount.toLocaleString()}
              </p>
              <p className="text-xs text-slate-500 mt-1">
                Fee: ${withdrawal.fee.toFixed(2)} • Net:{" "}
                <span className="text-emerald-400 font-semibold">
                  ${withdrawal.netAmount.toFixed(2)}
                </span>
              </p>
            </div>
            <WithdrawalStatusBadge status={withdrawal.status} />
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
                  {withdrawal.userName || "—"}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Email</p>
                <p className="font-semibold text-white truncate">
                  {withdrawal.userEmail || "—"}
                </p>
              </div>
            </div>
          </div>

          {/* Bank Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <Building2 className="h-4 w-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Bank Details
              </h4>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <Building2 className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">Bank:</span>
                <span className="text-sm font-semibold text-white">
                  {withdrawal.bankName}
                </span>
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <User className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">Holder:</span>
                <span className="text-sm font-semibold text-white">
                  {withdrawal.holderName}
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                  <Hash className="h-3.5 w-3.5 text-slate-500" />
                  <span className="text-xs text-slate-400">Account:</span>
                  <span className="text-sm font-mono font-semibold text-white">
                    {maskAccount(withdrawal.accountNumber)}
                  </span>
                </div>
                {withdrawal.routingNumber && (
                  <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                    <Route className="h-3.5 w-3.5 text-slate-500" />
                    <span className="text-xs text-slate-400">Routing:</span>
                    <span className="text-sm font-mono font-semibold text-white truncate">
                      {withdrawal.routingNumber}
                    </span>
                  </div>
                )}
              </div>
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <FileText className="h-3.5 w-3.5 text-slate-500" />
                <span className="text-xs text-slate-400">Method:</span>
                <span className="text-sm font-semibold text-white uppercase">
                  {withdrawal.method}
                </span>
              </div>
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
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Requested</p>
                  <p className="text-sm font-semibold text-white">
                    {formatDate(new Date(withdrawal.createdAt))}
                  </p>
                </div>
              </div>
              {withdrawal.processedAt && (
                <div className="flex items-center gap-3">
                  {withdrawal.status === "approved" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Processed</p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(new Date(withdrawal.processedAt))}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Notes */}
          {withdrawal.notes && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
              <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                User Notes
              </p>
              <p className="text-sm text-slate-300 italic">
                "{withdrawal.notes}"
              </p>
            </div>
          )}

          {/* Rejection Reason */}
          {withdrawal.rejectionReason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2">
                Rejection Reason
              </p>
              <p className="text-sm text-red-200">
                {withdrawal.rejectionReason}
              </p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {withdrawal.status === "pending" && (
          <div className="sticky bottom-0 flex gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4">
            <button
              onClick={() => onReject(withdrawal.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={() => onApprove(withdrawal.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40"
            >
              <CheckCircle2 className="h-4 w-4" />
              Approve
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default WithdrawalDetailModal;
