// src/components/admin/transactions/AdminTransactionTable.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowRightLeft,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type {
  TransactionRecord,
  AdminTransactionFilters,
  TransactionType,
  TransactionStatus,
} from "../../../../types/transaction.types";

interface Props {
  transactions: TransactionRecord[];
  loading: boolean;
  filters: AdminTransactionFilters;
  onFiltersChange: (filters: AdminTransactionFilters) => void;
  onView: (tx: TransactionRecord) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const statusColors: Record<TransactionStatus, string> = {
  completed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  processing: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  failed: "bg-red-500/10 text-red-400 border-red-500/20",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
};

export const AdminTransactionTable: React.FC<Props> = ({
  transactions,
  loading,
  filters,
  onFiltersChange,
  onView,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredTx = useMemo(() => {
    let result = [...transactions];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.userName?.toLowerCase().includes(q) ||
          t.userEmail?.toLowerCase().includes(q) ||
          t.id.toLowerCase().includes(q) ||
          t.txHash?.toLowerCase().includes(q),
      );
    }
    if (filters.type !== "all")
      result = result.filter((t) => t.type === filters.type);
    if (filters.status !== "all")
      result = result.filter((t) => t.status === filters.status);
    return result;
  }, [transactions, filters]);

  const totalPages = Math.ceil(filteredTx.length / itemsPerPage);
  const paginatedTx = filteredTx.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatDate = (date: Date) =>
    new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const selectClass =
    "rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50";

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              placeholder="Search by user, tx hash, or ID..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />
            {/* 🆕 Updated to only show Deposit and Withdrawal */}
            <select
              value={filters.type}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  type: e.target.value as TransactionType | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Types</option>
              <option value="deposit">Deposit</option>
              <option value="withdrawal">Withdrawal</option>
            </select>
            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as TransactionStatus | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="completed">Completed</option>
              <option value="pending">Pending</option>
              <option value="processing">Processing</option>
              <option value="failed">Failed</option>
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredTx.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {transactions.length}
            </span>{" "}
            transactions
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">
              Loading transactions...
            </p>
          </div>
        ) : paginatedTx.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
              <ArrowRightLeft className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No transactions found
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Try adjusting your filters or search query.
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto overflow-y-visible">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Type
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                      Tx Hash
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden xl:table-cell">
                      Date
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedTx.map((t) => (
                    <tr
                      key={t.id}
                      className="group transition hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
                            {(t.userName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {t.userName || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {t.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <span className="inline-flex rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-semibold uppercase text-slate-300">
                          {t.type}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white tabular-nums">
                          {t.amount.toLocaleString()}{" "}
                          <span className="text-xs text-slate-500">
                            {t.currency}
                          </span>
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {t.txHash ? (
                          <span className="text-xs font-mono text-slate-400">
                            {t.txHash.slice(0, 6)}...{t.txHash.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold capitalize ${statusColors[t.status]}`}
                        >
                          {t.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell tabular-nums">
                        {formatDate(t.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onView(t)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" /> View
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            <div className="flex flex-col gap-3 border-t border-slate-800 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <span>Rows per page:</span>
                <select
                  value={itemsPerPage}
                  onChange={(e) => {
                    setItemsPerPage(Number(e.target.value));
                    setCurrentPage(1);
                  }}
                  className={selectClass}
                >
                  {ITEMS_PER_PAGE_OPTIONS.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="px-3 text-xs font-medium text-slate-300">
                  Page {currentPage} of {totalPages || 1}
                </span>
                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages || totalPages === 0}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border border-slate-800 bg-slate-900/50 text-slate-400 transition hover:bg-slate-800 hover:text-white disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
