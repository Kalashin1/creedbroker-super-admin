// src/components/admin/security/KYCQueue.tsx
import React, { useState, useEffect } from "react";
import {
  FileCheck,
  Loader2,
  Eye,
  CheckCircle2,
  XCircle,
  Clock,
} from "lucide-react";
import {
  getKYCUsers,
  type KycFilterStatus,
} from '../../../../services/security.service'
import { KYCReviewModal } from "./KYCReviewModal";

export const KYCQueue: React.FC = () => {
  const [activeTab, setActiveTab] = useState<KycFilterStatus>("pending");
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<any>(null);

  useEffect(() => {
    const fetchUsers = async () => {
      setLoading(true);
      const data = await getKYCUsers(activeTab);
      setUsers(data);
      setLoading(false);
    };
    fetchUsers();
  }, [activeTab]);

  const formatDate = (ts: any) => {
    if (!ts) return "Unknown";
    const date = ts.toDate ? ts.toDate() : new Date(ts);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const tabs: {
    id: KycFilterStatus;
    label: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: "pending",
      label: "Pending",
      icon: <Clock className="h-3.5 w-3.5" />,
      color: "text-amber-400 border-amber-400 bg-amber-500/10",
    },
    {
      id: "verified",
      label: "Verified",
      icon: <CheckCircle2 className="h-3.5 w-3.5" />,
      color: "text-emerald-400 border-emerald-400 bg-emerald-500/10",
    },
    {
      id: "rejected",
      label: "Rejected",
      icon: <XCircle className="h-3.5 w-3.5" />,
      color: "text-red-400 border-red-400 bg-red-500/10",
    },
  ];

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
      {/* Header & Tabs */}
      <div className="border-b border-slate-800">
        <div className="flex items-center justify-between p-6 pb-0">
          <div className="flex items-center gap-2">
            <FileCheck className="h-5 w-5 text-violet-400" />
            <h3 className="text-lg font-bold text-white">KYC Management</h3>
          </div>
          <span className="text-xs text-slate-500">{users.length} users</span>
        </div>

        <div className="flex gap-2 px-6 mt-4">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-t-lg border-b-2 transition ${
                activeTab === tab.id
                  ? `${tab.color} border-b-2`
                  : "text-slate-400 border-b-2 border-transparent hover:text-slate-200"
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-violet-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-slate-400 text-sm">
            No {activeTab} KYC requests found
          </p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-slate-950/50 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  User
                </th>
                <th className="px-6 py-3.5 text-left text-[11px] font-semibold uppercase tracking-wider text-slate-400 hidden sm:table-cell">
                  Last Updated
                </th>
                <th className="px-6 py-3.5 text-right text-[11px] font-semibold uppercase tracking-wider text-slate-400">
                  Action
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {users.map((user) => (
                <tr
                  key={user.id}
                  className="group transition hover:bg-slate-800/30"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-violet-400 to-purple-500 text-sm font-bold text-slate-950">
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
                  <td className="px-6 py-4 text-sm text-slate-400 hidden sm:table-cell tabular-nums">
                    {formatDate(user.updatedAt)}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedUser(user)}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800/60 border border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                    >
                      <Eye className="h-3.5 w-3.5" /> View Details
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedUser && (
        <KYCReviewModal
          user={selectedUser}
          currentStatus={activeTab}
          onClose={() => setSelectedUser(null)}
          onReviewed={() => {
            setSelectedUser(null);
            // Refresh current tab
            getKYCUsers(activeTab).then(setUsers);
          }}
        />
      )}
    </div>
  );
};
