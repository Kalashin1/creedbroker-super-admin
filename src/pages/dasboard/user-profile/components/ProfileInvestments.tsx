// src/components/admin/profile/ProfileInvestments.tsx
import React from "react";
import {
  Briefcase,
  Package,
  DollarSign,
  TrendingUp,
  Clock,
} from "lucide-react";
import type { UserInvestment } from "../../../../types/investment.types";

interface Props {
  investments: UserInvestment[];
}

const statusColors: Record<string, string> = {
  pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  completed: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  cancelled: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  rejected: "bg-red-500/10 text-red-400 border-red-500/20",
};

const ProfileInvestments: React.FC<Props> = ({ investments }) => {
  if (investments.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Briefcase className="h-5 w-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Investments
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Package className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No investments yet</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-violet-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Investments
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          {investments.length} total
        </span>
      </div>

      <div className="space-y-2">
        {investments.map((inv) => (
          <div
            key={inv.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
          >
            <div className="flex items-start justify-between mb-3">
              <div>
                <h4 className="text-sm font-bold text-white">
                  {inv.packageName}
                </h4>
                <p className="text-[11px] text-slate-500">
                  {inv.startDate.toLocaleDateString()} • {inv.duration} days
                </p>
              </div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${
                  statusColors[inv.status] || statusColors.pending
                }`}
              >
                {inv.status}
              </span>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs">
              <div className="rounded-lg bg-slate-900/50 px-3 py-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <DollarSign className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-500">Amount</span>
                </div>
                <p className="font-bold text-white tabular-nums">
                  ${inv.amount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-slate-900/50 px-3 py-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <TrendingUp className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-500">ROI</span>
                </div>
                <p className="font-bold text-cyan-400 tabular-nums">
                  {inv.roi}%
                </p>
              </div>
              <div className="rounded-lg bg-slate-900/50 px-3 py-2">
                <div className="flex items-center gap-1 mb-0.5">
                  <Clock className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-500">Ends</span>
                </div>
                <p className="font-bold text-white tabular-nums">
                  {inv.endDate ? inv.endDate.toLocaleDateString() : "—"}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileInvestments;
