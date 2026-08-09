// src/pages/admin/AdminWallets.tsx
import React, { useState, useEffect } from "react";
import { Wallet, Search, Loader2, RefreshCw } from "lucide-react";
import { toast } from "react-toastify";
import { collection, getDocs, query, orderBy } from "firebase/firestore";
import { db } from "../../../lib/firebase";
import type { UserProfile } from "../../../types/user.types";
import { UserWalletModal } from "./components/UserWalletModal";
import DashboardLayout from "../components/Layout";

const AdminWallets: React.FC = () => {
  const [users, setUsers] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null);

  const loadUsers = async () => {
    setLoading(true);
    try {
      const q = query(collection(db, "users"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const userList = snapshot.docs.map((doc) => doc.data() as UserProfile);
      setUsers(userList);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = users.filter(
    (u) =>
      u.fullName.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
              <Wallet className="h-5 w-5 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                User Wallets
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Manage balances, generate wallets, and view recovery phrases
              </p>
            </div>
          </div>
          <button
            onClick={loadUsers}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />{" "}
            Refresh
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email..."
            className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-white placeholder-slate-500 outline-none transition focus:border-emerald-500/50"
          />
        </div>

        {/* Table */}
        <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
              <p className="mt-4 text-sm text-slate-400">Loading wallets...</p>
            </div>
          ) : filteredUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20">
              <Wallet className="h-10 w-10 text-slate-600 mb-3" />
              <p className="text-sm text-slate-400">No users found</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="border-b border-slate-800 bg-slate-950/50">
                  <tr>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      User
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      USD
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      BTC
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden md:table-cell">
                      ETH
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                      BNB
                    </th>
                    <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden lg:table-cell">
                      SOL
                    </th>
                    <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {filteredUsers.map((user) => (
                    <tr
                      key={user.uid}
                      className="group transition hover:bg-slate-800/30"
                    >
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-sm font-bold text-slate-950">
                            {(user.fullName || "?").charAt(0).toUpperCase()}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-white">
                              {user.fullName || "Unknown"}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {user.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm font-semibold text-white tabular-nums">
                        $
                        {(user.balance?.usd || 0).toLocaleString(undefined, {
                          maximumFractionDigits: 2,
                        })}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 tabular-nums hidden md:table-cell">
                        {(user.balance?.btc || 0).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 tabular-nums hidden md:table-cell">
                        {(user.balance?.eth || 0).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 tabular-nums hidden lg:table-cell">
                        {(user.balance?.bnb || 0).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-sm text-slate-300 tabular-nums hidden lg:table-cell">
                        {(user.balance?.sol || 0).toFixed(6)}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button
                          onClick={() => setSelectedUser(user)}
                          className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-400 transition hover:bg-emerald-500/20"
                        >
                          <Wallet className="h-3.5 w-3.5" /> Manage
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Modal */}
        {selectedUser && (
          <UserWalletModal
            user={selectedUser}
            onClose={() => setSelectedUser(null)}
            onUpdated={() => {
              loadUsers();
              const updated = users.find((u) => u.uid === selectedUser.uid);
              if (updated) setSelectedUser(updated);
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminWallets;
