// src/components/admin/security/PendingKYCQueue.tsx
import React, { useState } from "react";
import { FileCheck, Loader2, Eye } from "lucide-react";
import { KYCReviewModal } from "./KYCReviewModal";

interface User {
  id: string;
  fullName: string;
  email: string;
  updatedAt: any;
}

interface Props {
  users: User[];
  loading: boolean;
  onReviewed: () => void;
}

export const PendingKYCQueue: React.FC<Props> = ({
  users,
  loading,
  onReviewed,
}) => {
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

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

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 backdrop-blur overflow-hidden">
      <div className="flex items-center justify-between p-6 border-b border-slate-800">
        <div className="flex items-center gap-2">
          <FileCheck className="h-5 w-5 text-amber-400" />
          <h3 className="text-lg font-bold text-white">Pending KYC Reviews</h3>
        </div>
        <span className="text-xs text-slate-500">{users.length} awaiting</span>
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-amber-400" />
        </div>
      ) : users.length === 0 ? (
        <div className="p-10 text-center">
          <p className="text-slate-400 text-sm">No pending KYC requests</p>
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
                  Submitted
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
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-sm font-bold text-slate-950">
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
                      className="inline-flex items-center gap-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 text-xs font-semibold text-amber-400 transition hover:bg-amber-500/20"
                    >
                      <Eye className="h-3.5 w-3.5" /> Review Docs
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
          currentStatus="pending"
          onClose={() => setSelectedUser(null)}
          onReviewed={() => {
            setSelectedUser(null);
            onReviewed();
          }}
        />
      )}
    </div>
  );
};
