// src/components/admin/deposits/DepositDetailModal.tsx
import React from "react";
import {
  X,
  User,
  Hash,
  Calendar,
  FileText,
  CheckCircle2,
  XCircle,
  Clock,
  ExternalLink,
} from "lucide-react";
import type { DepositRequest } from "../../../../types/deposit.types";
import { DepositStatusBadge } from "./DepositStatusBadge";

interface Props {
  deposit: DepositRequest | null;
  onClose: () => void;
  onConfirm: (id: string) => void;
  onReject: (id: string) => void;
}

export const DepositDetailModal: React.FC<Props> = ({
  deposit,
  onClose,
  onConfirm,
  onReject,
}) => {
  if (!deposit) return null;

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });

  const getExplorerUrl = (network?: string, txHash?: string) => {
    if (!network || !txHash) return "#";
    const hash = network.toLowerCase().includes("btc")
      ? `https://blockchain.com/btc/tx/${txHash}`
      : network.toLowerCase().includes("eth")
        ? `https://etherscan.io/tx/${txHash}`
        : network.toLowerCase().includes("bnb")
          ? `https://bscscan.com/tx/${txHash}`
          : network.toLowerCase().includes("sol")
            ? `https://solscan.io/tx/${txHash}`
            : "#";
    return hash;
  };

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
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
              <Hash className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">Deposit Details</h2>
              <p className="text-xs text-slate-500 font-mono">
                ID: {deposit.id}
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
                {deposit.amount.toLocaleString()}{" "}
                <span className="text-lg text-slate-400">
                  {deposit.currency}
                </span>
              </p>
            </div>
            <DepositStatusBadge status={deposit.status} />
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
                <p className="font-semibold text-white">{deposit.userName}</p>
              </div>
              <div>
                <p className="text-[10px] text-slate-500 uppercase">Email</p>
                <p className="font-semibold text-white truncate">
                  {deposit.userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Deposit Details */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div className="flex items-center gap-2 mb-3">
              <FileText className="h-4 w-4 text-blue-400" />
              <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                Transaction Details
              </h4>
            </div>
            <div className="space-y-2.5">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400 w-20">Network:</span>
                <span className="text-sm font-semibold text-white uppercase">
                  {deposit.network || "N/A"}
                </span>
              </div>
              {deposit.txHash && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                  <span className="text-xs text-slate-400 w-20">Tx Hash:</span>
                  <a
                    href={getExplorerUrl(deposit.network, deposit.txHash)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-sm font-mono font-semibold text-cyan-400 hover:underline flex items-center gap-1"
                  >
                    {deposit.txHash.slice(0, 8)}...{deposit.txHash.slice(-6)}
                    <ExternalLink className="h-3 w-3" />
                  </a>
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
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <Clock className="h-4 w-4 text-amber-400" />
                <div className="flex-1">
                  <p className="text-xs text-slate-400">Requested</p>
                  <p className="text-sm font-semibold text-white">
                    {formatDate(deposit.createdAt)}
                  </p>
                </div>
              </div>
              {deposit.confirmedAt && (
                <div className="flex items-center gap-3">
                  {deposit.status === "confirmed" ? (
                    <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                  ) : (
                    <XCircle className="h-4 w-4 text-red-400" />
                  )}
                  <div className="flex-1">
                    <p className="text-xs text-slate-400">Processed</p>
                    <p className="text-sm font-semibold text-white">
                      {formatDate(deposit.confirmedAt)}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Rejection Reason */}
          {deposit.rejectionReason && (
            <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-4">
              <p className="text-[10px] text-red-400 uppercase tracking-wider mb-2">
                Rejection Reason
              </p>
              <p className="text-sm text-red-200">{deposit.rejectionReason}</p>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {deposit.status === "pending" && (
          <div className="sticky bottom-0 flex gap-3 border-t border-slate-800 bg-slate-900 px-6 py-4">
            <button
              onClick={() => onReject(deposit.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 py-2.5 text-sm font-semibold text-red-400 transition hover:bg-red-500/20"
            >
              <XCircle className="h-4 w-4" />
              Reject
            </button>
            <button
              onClick={() => onConfirm(deposit.id)}
              className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40"
            >
              <CheckCircle2 className="h-4 w-4" />
              Confirm Deposit
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
