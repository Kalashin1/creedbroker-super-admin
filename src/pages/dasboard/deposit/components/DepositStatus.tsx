// src/components/admin/deposits/DepositTable.tsx
import React, { useState, useMemo, useEffect } from "react";
import {
  Search,
  Filter,
  ArrowDownToLine,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Eye,
} from "lucide-react";
import type {
  DepositRequest,
  DepositFilters,
  DepositStatus,
} from "../../../../types/deposit.types";
import { DepositStatusBadge } from "./DepositStatusBadge";

interface Props {
  deposits: DepositRequest[];
  loading: boolean;
  filters: DepositFilters;
  onFiltersChange: (filters: DepositFilters) => void;
  onView: (deposit: DepositRequest) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

export const DepositTable: React.FC<Props> = ({
  deposits,
  loading,
  filters,
  onFiltersChange,
  onView,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const filteredDeposits = useMemo(() => {
    let result = [...deposits];
    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (d) =>
          d.userName?.toLowerCase().includes(q) ||
          d.userEmail?.toLowerCase().includes(q) ||
          d.txHash?.toLowerCase().includes(q) ||
          d.id.toLowerCase().includes(q),
      );
    }
    if (filters.status !== "all")
      result = result.filter((d) => d.status === filters.status);
    if (filters.network !== "all")
      result = result.filter(
        (d) => d.network?.toLowerCase() === filters.network.toLowerCase(),
      );
    return result;
  }, [deposits, filters]);

  const totalPages = Math.ceil(filteredDeposits.length / itemsPerPage);
  const paginatedDeposits = filteredDeposits.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [filters]);

  const formatDate = (ts: number) =>
    new Date(ts).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  const selectClass =
    "rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50";

  // Get unique networks for filter
  const networks = useMemo(
    () => Array.from(new Set(deposits.map((d) => d.network).filter(Boolean))),
    [deposits],
  );

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
            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as DepositStatus | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="confirmed">Confirmed</option>
              <option value="rejected">Rejected</option>
            </select>
            <select
              value={filters.network}
              onChange={(e) =>
                onFiltersChange({ ...filters, network: e.target.value })
              }
              className={selectClass}
            >
              <option value="all">All Networks</option>
              {networks.map((net) => (
                <option key={net} value={net}>
                  {net}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredDeposits.length}
            </span>{" "}
            of{" "}
            <span className="font-semibold text-white">{deposits.length}</span>{" "}
            deposits
          </p>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">Loading deposits...</p>
          </div>
        ) : paginatedDeposits.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
              <ArrowDownToLine className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No deposits found
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
                      Amount
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      Network
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
                  {paginatedDeposits.map((d) => (
                    <tr
                      key={d.id}
                      className="group transition hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
                            {(d.userName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {d.userName || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {d.userEmail}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="text-sm font-bold text-white tabular-nums">
                          {d.amount.toLocaleString()}{" "}
                          <span className="text-xs text-slate-500">
                            {d.currency}
                          </span>
                        </p>
                      </td>
                      <td className="px-6 py-4 hidden md:table-cell">
                        <span className="inline-flex rounded-md bg-slate-800/60 px-2 py-1 text-[10px] font-semibold uppercase text-slate-300">
                          {d.network || "N/A"}
                        </span>
                      </td>
                      <td className="px-6 py-4 hidden lg:table-cell">
                        {d.txHash ? (
                          <span className="text-xs font-mono text-slate-400">
                            {d.txHash.slice(0, 6)}...{d.txHash.slice(-4)}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-600 italic">
                            N/A
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4">
                        <DepositStatusBadge status={d.status} />
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-400 hidden xl:table-cell tabular-nums">
                        {formatDate(d.createdAt)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => onView(d)}
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
