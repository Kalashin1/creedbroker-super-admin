// src/pages/admin/Deposits.tsx
import React, { useState, useEffect } from "react";
import { ArrowDownToLine, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { useAuth } from "../../../context/AuthContext";
import {
  fetchAllDeposits,
  updateDepositStatus,
} from "../../../services/deposit.service";
import { createNotification } from "../../../services/notification.service";
import { adminAdjustBalance } from "../../../services/adminUserProfile.service";
import { DepositStats } from "./components/DepositStats";
import { DepositTable } from "./components/DepositTable";
import { DepositDetailModal } from "./components/DepositDetailsModal";
import type {
  DepositRequest,
  DepositFilters,
} from "../../../types/deposit.types";
import DashboardLayout from "../components/Layout";

const Deposits: React.FC = () => {
  const { user } = useAuth();
  const [deposits, setDeposits] = useState<DepositRequest[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [selectedDeposit, setSelectedDeposit] = useState<DepositRequest | null>(
    null,
  );

  const [filters, setFilters] = useState<DepositFilters>({
    search: "",
    status: "all",
    network: "all",
  });

  const loadDeposits = async () => {
    setLoading(true);
    try {
      const data = await fetchAllDeposits();
      setDeposits(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load deposits");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeposits();
  }, []);

  const handleConfirm = async (depositId: string) => {
    if (!user) return;
    if (
      !window.confirm(
        "Confirm this deposit? The user's balance will be updated and they will be notified.",
      )
    )
      return;

    try {
      const deposit = deposits.find((d) => d.id === depositId);
      if (!deposit) return;

      // 1. Update deposit status
      await updateDepositStatus(depositId, "confirmed");

      // 2. Credit user's balance dynamically based on currency
      const balanceUpdate: Record<string, number> = {};
      const currencyKey = deposit.currency.toLowerCase() as
        | "usd"
        | "btc"
        | "eth"
        | "bnb"
        | "sol";
      if (["usd", "btc", "eth", "bnb", "sol"].includes(currencyKey)) {
        balanceUpdate[currencyKey] = deposit.amount;
      } else {
        balanceUpdate.usd = deposit.amount; // Fallback to USD
      }
      await adminAdjustBalance(deposit.userId, balanceUpdate);

      // 3. Notify user
      await createNotification(deposit.userId, {
        title: "Deposit Confirmed",
        message: `Your deposit of ${deposit.amount} ${deposit.currency} has been confirmed and credited to your account.`,
        category: "transaction",
        type: "success",
        priority: "high",
        actionUrl: "/dashboard/wallets",
        sendEmail: true,
      });

      toast.success("Deposit confirmed successfully");
      setSelectedDeposit(null);
      loadDeposits();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to confirm deposit");
    }
  };

  const handleReject = async (depositId: string) => {
    if (!user) return;
    const reason = prompt(
      "Please provide a reason for rejection (shown to user):",
    );
    if (reason === null) return;

    try {
      const deposit = deposits.find((d) => d.id === depositId);
      if (!deposit) return;

      await updateDepositStatus(depositId, "rejected", {
        rejectionReason: reason || "No reason provided",
      });

      await createNotification(deposit.userId, {
        title: "Deposit Rejected",
        message: `Your deposit of ${deposit.amount} ${deposit.currency} was rejected. Reason: ${reason || "No reason provided"}.`,
        category: "transaction",
        type: "error",
        priority: "high",
        actionUrl: "/dashboard/support",
        sendEmail: true,
      });

      toast.success("Deposit rejected");
      setSelectedDeposit(null);
      loadDeposits();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to reject deposit");
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
              <ArrowDownToLine className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Deposit Requests
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Review and process user deposit requests
              </p>
            </div>
          </div>
          <button
            onClick={loadDeposits}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>
        </div>

        {/* Stats */}
        <DepositStats deposits={deposits} />

        {/* Pending Alert */}
        {deposits.filter((d) => d.status === "pending").length > 0 && (
          <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4 flex items-start gap-3">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <ArrowDownToLine className="h-4 w-4 text-amber-400" />
            </div>
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-white">
                {deposits.filter((d) => d.status === "pending").length} deposit
                {deposits.filter((d) => d.status === "pending").length > 1
                  ? "s"
                  : ""}{" "}
                pending review
              </h4>
              <p className="mt-0.5 text-xs text-slate-400">
                Please review and confirm pending deposits promptly to maintain
                user satisfaction.
              </p>
            </div>
          </div>
        )}

        {/* Table */}
        <DepositTable
          deposits={deposits}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onView={setSelectedDeposit}
        />

        {/* Detail Modal */}
        <DepositDetailModal
          deposit={selectedDeposit}
          onClose={() => setSelectedDeposit(null)}
          onConfirm={handleConfirm}
          onReject={handleReject}
        />
      </div>
    </DashboardLayout>
  );
};

export default Deposits;
