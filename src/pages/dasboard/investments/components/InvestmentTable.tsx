// src/components/admin/InvestmentTable.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  Package,
  Loader2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import type {
  AdminInvestment,
  InvestmentAction,
  InvestmentFilters,
  InvestmentStatus,
} from "../../../../types/investment.types";
import InvestmentStatusBadge from "./InvestmentStatusBadge";
import InvestmentActionDropdown from "./InvestmentActionDropdown";

interface Props {
  investments: AdminInvestment[];
  loading: boolean;
  filters: InvestmentFilters;
  onFiltersChange: (filters: InvestmentFilters) => void;
  onAction: (action: InvestmentAction, investment: AdminInvestment) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const InvestmentTable: React.FC<Props> = ({
  investments,
  loading,
  filters,
  onFiltersChange,
  onAction,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredInvestments = useMemo(() => {
    let result = [...investments];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.userName.toLowerCase().includes(q) ||
          inv.userEmail.toLowerCase().includes(q) ||
          inv.packageName.toLowerCase().includes(q) ||
          inv.id.toLowerCase().includes(q),
      );
    }

    if (filters.status !== "all") {
      result = result.filter((inv) => inv.status === filters.status);
    }

    if (filters.tier !== "all") {
      result = result.filter((inv) => inv.tier === filters.tier);
    }

    return result;
  }, [investments, filters]);

  const totalPages = Math.ceil(filteredInvestments.length / itemsPerPage);
  const paginatedInvestments = filteredInvestments.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const selectClass =
    "rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50";

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
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
              placeholder="Search by user, package, or ID..."
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
                  status: e.target.value as InvestmentStatus | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="active">Active</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
              <option value="rejected">Rejected</option>
            </select>

            <select
              value={filters.tier}
              onChange={(e) =>
                // @ts-ignore
                onFiltersChange({ ...filters, tier: e.target.value })
              }
              className={selectClass}
            >
              <option value="all">All Tiers</option>
              <option value="starter">Starter</option>
              <option value="professional">Professional</option>
              <option value="premium">Premium</option>
              <option value="elite">Elite</option>
              <option value="institutional">Institutional</option>
            </select>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredInvestments.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">
              {investments.length}
            </span>{" "}
            investments
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-hidden rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">
              Loading investments...
            </p>
          </div>
        ) : paginatedInvestments.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
              <Package className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No investments found
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {investments.length === 0
                ? "No investments have been made on the platform yet."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Investment
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      ROI
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                      Profit
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden xl:table-cell">
                      Start Date
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedInvestments.map((inv) => (
                    <tr
                      key={inv.id}
                      className="group transition hover:bg-slate-800/30"
                    >
                      {/* Investment info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-linear-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
                            <Package className="h-4 w-4 text-emerald-400" />
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {inv.packageName}
                            </p>
                            <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                              {inv.tier} • {inv.duration}d
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* User */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-emerald-400 to-cyan-500 text-[10px] font-bold text-slate-950">
                            {inv.userName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-xs font-semibold text-white">
                              {inv.userName}
                            </p>
                            <p className="truncate text-[10px] text-slate-500">
                              {inv.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Amount */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white tabular-nums">
                          {formatCurrency(inv.amount)}
                        </p>
                      </td>

                      {/* ROI */}
                      <td className="px-6 py-4 hidden md:table-cell">
                        <p className="text-sm font-semibold text-cyan-400 tabular-nums">
                          {inv.roi}%
                        </p>
                      </td>

                      {/* Profit */}
                      <td className="px-6 py-4 hidden lg:table-cell">
                        <p className="text-sm font-bold text-emerald-400 tabular-nums">
                          {formatCurrency(inv.totalProfit)}
                        </p>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <InvestmentStatusBadge status={inv.status} />
                      </td>

                      {/* Start Date */}
                      <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell tabular-nums">
                        {formatDate(inv.startDate)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <InvestmentActionDropdown
                            investment={inv}
                            onAction={onAction}
                          />
                        </div>
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

export default InvestmentTable;
