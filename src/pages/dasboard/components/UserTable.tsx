// src/components/admin/UserTable.tsx
import React, { useState, useMemo, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Search,
  Filter,
  Users,
  Loader2,
  ChevronLeft,
  ChevronRight,
  Mail,
  MailCheck,
  Shield,
  User as UserIcon,
  CheckCircle2,
  AlertTriangle,
  Ban,
  X,
} from "lucide-react";
import type {
  AdminUser,
  UserAction,
  UserFilters,
  AccountStatus,
  KYCStatus,
  UserRole,
} from "../../../types/admin.types";
import UserStatusBadge from "./UserStatusBadge";
import KYCStatusBadge from "./KYCStatusBadge";
import UserActionDropdown from "./UserActionDropdown";
import { adminBulkUpdateStatus } from "../../../services/admin.service";
import { toast } from "react-toastify";

interface Props {
  users: AdminUser[];
  loading: boolean;
  filters: UserFilters;
  onFiltersChange: (filters: UserFilters) => void;
  onAction: (action: UserAction, user: AdminUser) => void;
}

const ITEMS_PER_PAGE_OPTIONS = [10, 25, 50, 100];

const UserTable: React.FC<Props> = ({
  users,
  loading,
  filters,
  onFiltersChange,
  onAction,
}) => {
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);

  const [selectedUsers, setSelectedUsers] = useState<string[]>([]);

  const handleBulkAction = async (
    status: "active" | "restricted" | "blocked",
  ) => {
    if (selectedUsers.length === 0) {
      toast.error("Please select at least one user");
      return;
    }
    if (
      !window.confirm(`Apply "${status}" to ${selectedUsers.length} user(s)?`)
    )
      return;

    try {
      const result = await adminBulkUpdateStatus(selectedUsers, status);
      toast.success(
        `Updated ${result.success} user(s)${result.failed > 0 ? `, ${result.failed} failed` : ""}`,
      );
      setSelectedUsers([]);
      // Trigger parent refresh - you may need to pass onRefresh prop
    } catch (err) {
      toast.error("Bulk action failed");
    }
  };

  // Apply filters
  const filteredUsers = useMemo(() => {
    let result = [...users];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (u) =>
          u.fullName.toLowerCase().includes(q) ||
          u.email.toLowerCase().includes(q) ||
          u.phone?.toLowerCase().includes(q) ||
          u.country?.toLowerCase().includes(q),
      );
    }

    if (filters.role !== "all") {
      result = result.filter((u) => u.role === filters.role);
    }
    if (filters.status !== "all") {
      result = result.filter((u) => u.accountStatus === filters.status);
    }
    if (filters.kyc !== "all") {
      result = result.filter((u) => u.kycStatus === filters.kyc);
    }

    return result;
  }, [users, filters]);

  const toggleUserSelection = (userId: string) => {
    setSelectedUsers((prev) =>
      prev.includes(userId)
        ? prev.filter((id) => id !== userId)
        : [...prev, userId],
    );
  };

  const toggleSelectAll = () => {
    if (selectedUsers.length === paginatedUsers.length) {
      setSelectedUsers([]);
    } else {
      setSelectedUsers(paginatedUsers.map((u) => u.id));
    }
  };

  // Pagination
  const totalPages = Math.ceil(filteredUsers.length / itemsPerPage);
  const paginatedUsers = filteredUsers.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage,
  );

  // Reset page when filters change
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

  const formatBalance = (usd: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
    }).format(usd);
  };

  const selectClass =
    "rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50";

  return (
    <div className="space-y-4">
      {/* Filters Bar */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4 backdrop-blur">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          {/* Search */}
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
            <input
              type="text"
              value={filters.search}
              onChange={(e) =>
                onFiltersChange({ ...filters, search: e.target.value })
              }
              placeholder="Search by name, email, phone, or country..."
              className="w-full rounded-lg border border-slate-800 bg-slate-950/50 py-2 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />

            <select
              value={filters.role}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  role: e.target.value as UserRole | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Roles</option>
              <option value="client">Clients</option>
              <option value="admin">Admins</option>
            </select>

            <select
              value={filters.status}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  status: e.target.value as AccountStatus | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="restricted">Restricted</option>
              <option value="blocked">Blocked</option>
              <option value="deleted">Deleted</option>
            </select>

            <select
              value={filters.kyc}
              onChange={(e) =>
                onFiltersChange({
                  ...filters,
                  kyc: e.target.value as KYCStatus | "all",
                })
              }
              className={selectClass}
            >
              <option value="all">All KYC</option>
              <option value="none">Not Started</option>
              <option value="pending">Pending</option>
              <option value="verified">Verified</option>
              <option value="rejected">Rejected</option>
            </select>
          </div>
        </div>

        {/* Results count */}
        <div className="mt-3 flex items-center justify-between border-t border-slate-800 pt-3">
          <p className="text-xs text-slate-500">
            Showing{" "}
            <span className="font-semibold text-white">
              {filteredUsers.length}
            </span>{" "}
            of <span className="font-semibold text-white">{users.length}</span>{" "}
            users
          </p>
        </div>
      </div>

      {selectedUsers.length > 0 && (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-500/5 p-4 flex flex-wrap items-center gap-3">
          <p className="text-sm font-semibold text-amber-400">
            {selectedUsers.length} user{selectedUsers.length > 1 ? "s" : ""}{" "}
            selected
          </p>
          <div className="flex gap-2 ml-auto">
            <button
              onClick={() => handleBulkAction("active")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 hover:bg-emerald-500/20 transition"
            >
              <CheckCircle2 className="h-3.5 w-3.5" /> Activate
            </button>
            <button
              onClick={() => handleBulkAction("restricted")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400 hover:bg-amber-500/20 transition"
            >
              <AlertTriangle className="h-3.5 w-3.5" /> Restrict
            </button>
            <button
              onClick={() => handleBulkAction("blocked")}
              className="inline-flex items-center gap-1.5 rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-400 hover:bg-red-500/20 transition"
            >
              <Ban className="h-3.5 w-3.5" /> Block
            </button>
            <button
              onClick={() => setSelectedUsers([])}
              className="inline-flex items-center gap-1.5 rounded-lg border border-slate-800 bg-slate-900/50 px-3 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition"
            >
              <X className="h-3.5 w-3.5" /> Clear
            </button>
          </div>
        </div>
      )}

      {/* 🆕 Table - Changed from overflow-hidden to allow dropdown overflow */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">Loading users...</p>
          </div>
        ) : paginatedUsers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
              <Users className="h-8 w-8 text-slate-500" />
            </div>
            <h3 className="mt-4 text-lg font-semibold text-white">
              No users found
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              {users.length === 0
                ? "No users have registered on the platform yet."
                : "Try adjusting your filters or search query."}
            </p>
          </div>
        ) : (
          <>
            {/* 🆕 Removed overflow-hidden, only overflow-x-auto for horizontal scroll */}
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="px-4 py-3.5">
                      <input
                        type="checkbox"
                        checked={
                          selectedUsers.length === paginatedUsers.length &&
                          paginatedUsers.length > 0
                        }
                        onChange={toggleSelectAll}
                        className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                      />
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Role
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Status
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      KYC
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Balance
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                      Joined
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {paginatedUsers.map((user) => (
                    <tr
                      key={user.id}
                      className="group transition hover:bg-slate-800/30"
                    >
                      <td className="px-4 py-4">
                        <input
                          type="checkbox"
                          checked={selectedUsers.includes(user.id)}
                          onChange={() => toggleUserSelection(user.id)}
                          className="h-4 w-4 rounded border-slate-700 bg-slate-900 text-emerald-500 focus:ring-emerald-500/20"
                        />
                      </td>
                      {/* User info */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {user.fullName}
                            </p>
                            <div className="mt-0.5 flex items-center gap-1.5">
                              {user.emailVerified ? (
                                <MailCheck className="h-3 w-3 text-emerald-400" />
                              ) : (
                                <Mail className="h-3 w-3 text-slate-500" />
                              )}
                              <p className="truncate text-xs text-slate-400">
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Role */}
                      <td className="px-6 py-4">
                        <span
                          className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${
                            user.role === "admin"
                              ? "bg-violet-500/10 text-violet-400 border-violet-500/20"
                              : "bg-slate-500/10 text-slate-400 border-slate-500/20"
                          }`}
                        >
                          {user.role === "admin" ? (
                            <Shield className="h-3 w-3" />
                          ) : (
                            <UserIcon className="h-3 w-3" />
                          )}
                          {user.role === "admin" ? "Admin" : "Client"}
                        </span>
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <UserStatusBadge status={user.accountStatus} />
                      </td>

                      {/* KYC */}
                      <td className="px-6 py-4">
                        <KYCStatusBadge status={user.kycStatus} />
                      </td>

                      {/* Balance */}
                      <td className="px-6 py-4">
                        <p className="text-sm font-semibold text-white tabular-nums">
                          {formatBalance(user.balance.usd)}
                        </p>
                      </td>

                      {/* Joined */}
                      <td className="px-6 py-4 text-sm text-slate-400 hidden lg:table-cell">
                        {formatDate(user.createdAt)}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end">
                          <UserActionDropdown user={user} onAction={onAction} />
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
                  Page {currentPage} of {totalPages}
                </span>

                <button
                  onClick={() =>
                    setCurrentPage((p) => Math.min(totalPages, p + 1))
                  }
                  disabled={currentPage === totalPages}
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

export default UserTable;
