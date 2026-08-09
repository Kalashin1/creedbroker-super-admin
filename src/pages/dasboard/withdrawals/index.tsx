// src/pages/admin/Withdrawals.tsx
import React, { useState, useEffect } from "react";
import { ArrowUpFromLine, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAllWithdrawals,
  updateWithdrawalStatus,
} from "../../../services/withdrawal.service";
import { createNotification } from "../../../services/notification.service";
import { adminAdjustBalance } from "../../../services/adminUserProfile.service";
import WithdrawalStats from "./components/WithdrawalStats";
import WithdrawalTable from "./components/WithdrawalTable";
import WithdrawalDetailModal from "./components/WithdrawalDetailModal";
import type {
  WithdrawalRequest,
  WithdrawalFilters,
} from "../../../types/transaction.types";
import DashboardLayout from "../components/Layout";

const Withdrawals: React.FC = () => {
  const { user } = useAuth();
  const [withdrawals, setWithdrawals] = useState<WithdrawalRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedWithdrawal, setSelectedWithdrawal] =
    useState<WithdrawalRequest | null>(null);
  const [filters, setFilters] = useState<WithdrawalFilters>({
    search: "",
    status: "all",
    method: "all",
  });

  const loadWithdrawals = async () => {
    setLoading(true);
    try {
      const data = await fetchAllWithdrawals();
      setWithdrawals(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load withdrawals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWithdrawals();
  }, []);

  const handleApprove = async (withdrawalId: string) => {
    if (!user) return;
    if (!window.confirm("Approve this withdrawal? The user will be notified."))
      return;

    try {
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
      if (!withdrawal) return;

      // 1. Update withdrawal status
      await updateWithdrawalStatus(withdrawalId, "approved");

      // 2. Deduct user's balance (Note: In production, wrap in a Firestore Transaction)
      await adminAdjustBalance(withdrawal.userId, {
        usd: Math.max(0, (withdrawal.amount || 0) * -1),
      });

      // 3. Notify user
      await createNotification(withdrawal.userId, {
        title: "Withdrawal Approved",
        message: `Your withdrawal of $${withdrawal.amount.toLocaleString()} has been approved and is being processed.`,
        category: "transaction",
        type: "success",
        priority: "high",
        actionUrl: "/dashboard/withdraw",
        sendEmail: true,
      });

      toast.success("Withdrawal approved successfully");
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to approve withdrawal");
    }
  };

  const handleReject = async (withdrawalId: string) => {
    if (!user) return;
    const reason = prompt(
      "Please provide a reason for rejection (shown to user):",
    );
    if (reason === null) return; // User cancelled

    try {
      const withdrawal = withdrawals.find((w) => w.id === withdrawalId);
      if (!withdrawal) return;

      await updateWithdrawalStatus(withdrawalId, "rejected", {
        rejectionReason: reason || "No reason provided",
      });

      await createNotification(withdrawal.userId, {
        title: "Withdrawal Rejected",
        message: `Your withdrawal of $${withdrawal.amount.toLocaleString()} was rejected. Reason: ${reason || "No reason provided"}.`,
        category: "transaction",
        type: "error",
        priority: "high",
        actionUrl: "/dashboard/support",
        sendEmail: true,
      });

      toast.success("Withdrawal rejected");
      setSelectedWithdrawal(null);
      loadWithdrawals();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reject withdrawal");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <ArrowUpFromLine className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Withdrawal Requests
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Review and process user withdrawal requests
              </p>
            </div>
          </div>

          <button
            onClick={loadWithdrawals}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <WithdrawalStats withdrawals={withdrawals} />

        {/* Pending Alert */}
        {withdrawals.filter((w) => w.status === "pending").length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <ArrowUpFromLine className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">
                {withdrawals.filter((w) => w.status === "pending").length}{" "}
                withdrawal
                {withdrawals.filter((w) => w.status === "pending").length > 1
                  ? "s"
                  : ""}{" "}
                pending review
              </h4>
              <p className="mt-0.5 text-xs text-slate-400">
                Please review and process pending withdrawal requests promptly.
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <WithdrawalTable
          withdrawals={withdrawals}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onView={setSelectedWithdrawal}
        />

        {/* Detail Modal */}
        <WithdrawalDetailModal
          withdrawal={selectedWithdrawal}
          onClose={() => setSelectedWithdrawal(null)}
          onApprove={handleApprove}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
};

export default Withdrawals;
