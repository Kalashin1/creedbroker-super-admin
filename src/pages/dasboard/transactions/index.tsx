// src/pages/admin/Transactions.tsx
import React, { useState, useEffect } from "react";
import { ArrowRightLeft, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { fetchAllTransactions } from "../../../services/transaction.service";
import { AdminTransactionStats } from "./components/AdminTransactionStats";
import { AdminTransactionTable } from "./components/AdminTransactionTable";
import { AdminTransactionDetailModal } from "./components/AdminTransactionDetailModal";
import type {
  TransactionRecord,
  AdminTransactionFilters,
} from "../../../types/transaction.types";
import DashboardLayout from "../components/Layout";

const AdminTransactions: React.FC = () => {
  const [transactions, setTransactions] = useState<TransactionRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedTx, setSelectedTx] = useState<TransactionRecord | null>(null);
  const [filters, setFilters] = useState<AdminTransactionFilters>({
    search: "",
    type: "all",
    status: "all",
  });

  const loadTransactions = async () => {
    setLoading(true);
    try {
      const data = await fetchAllTransactions();
      setTransactions(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load transactions");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTransactions();
  }, []);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-linear-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <ArrowRightLeft className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Platform Transactions
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Monitor and manage all financial activity across the platform
              </p>
            </div>
          </div>

          <button
            onClick={loadTransactions}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>

        {/* Stats */}
        <AdminTransactionStats transactions={transactions} />

        {/* Table */}
        <AdminTransactionTable
          transactions={transactions}
          loading={loading}
          filters={filters}
          onFiltersChange={setFilters}
          onView={setSelectedTx}
        />

        {/* Detail Modal */}
        <AdminTransactionDetailModal
          transaction={selectedTx}
          onClose={() => setSelectedTx(null)}
          onUpdated={loadTransactions}
        />
      </div>
    </DashboardLayout>
  );
};

export default AdminTransactions;
