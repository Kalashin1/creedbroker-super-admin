// src/components/admin/withdrawals/WithdrawalTable.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowUpFromLine,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type {
  WithdrawalRequest,
  WithdrawalFilters,
  WithdrawalStatus,
  WithdrawalMethod,
} from "../../../../types/transaction.types";
import WithdrawalStatusBadge from "./WithdrawalStatusBadge";

interface Props {
  withdrawals: WithdrawalRequest[];
  loading: boolean;
  filters: WithdrawalFilters;
  onFiltersChange: (filters: WithdrawalFilters) => void;
  onView: (withdrawal: WithdrawalRequest) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const WithdrawalTable: React.FC<Props> = ({
  withdrawals,
  loading,
  filters,
  onFiltersChange,
  onView,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredWithdrawals = useMemo(() => {
    let result = [...withdrawals];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (w) =>
          w.userName?.toLowerCase().includes(q) ||
          w.userEmail?.toLowerCase().includes(q) ||
          w.bankName.toLowerCase().includes(q) ||
          w.accountNumber.toLowerCase().includes(q) ||
          w.id.toLowerCase().includes(q),
      );
    }

    if (filters.status !== "all") {
      result = result.filter((w) => w.status === filters.status);
    }

    if (filters.method !== "all") {
      result = result.filter((w) => w.method === filters.method);
    }

    return result;
  }, [withdrawals, filters]);

  const totalPages = Math.ceil(filteredWithdrawals.length / itemsPerPage);
  const paginatedWithdrawals = filteredWithdrawals.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatDate = (date: Date) =>
    date.toLocaleDateString("en-US", {
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
              placeholder="Search by user, bank, account, or ID..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50"
            />
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />

            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as WithdrawalStatus | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="approved">Approved</option>
              <option value="rejected">Rejected</option>
              <option value="cancelled">Cancelled</option>
            </select>

            <select
              value={filters.method}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  method: e.target.value as WithdrawalMethod | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Methods</option>
              <option value="wire">Wire</option>
              <option value="ach">ACH</option>
              <option value="sepa">SEPA</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredWithdrawals.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {withdrawals.length}
            </span>{" "}
            withdrawals
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">
              Loading withdrawals...
            </p>
          </div>
        ) : paginatedWithdrawals.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
              <ArrowUpFromLine className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No withdrawals found
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {withdrawals.length === 0
                ? "No withdrawal requests have been made yet."
                : "Try adjusting your filters or search query."}
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
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      Bank
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                      Method
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
                  {paginatedWithdrawals.map((w) => (
                    <tr
                      key={w.id}
                      className="group transition hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
                            {(w.userName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {w.userName || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {w.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white tabular-nums">
                          ${w.amount.toLocaleString()}
                        </p>
                        <p className="text-[10px] text-slate-500">
                          Net: ${w.netAmount.toFixed(2)}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm text-white truncate max-w-[180px]">
                          {w.bankName}
                        </p>
                        <p className="text-[10px] text-slate-500 font-mono">
                          ••••{w.accountNumber.slice(-4)}
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <span className="inline-flex rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-semibold uppercase text-slate-300">
                          {w.method}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <WithdrawalStatusBadge status={w.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell tabular-nums">
                        {formatDate(new Date(w.createdAt))}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onView(w)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                        >
                          <Eye className="h-3.5 w-3.5" />
                          View
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

export default WithdrawalTable;
