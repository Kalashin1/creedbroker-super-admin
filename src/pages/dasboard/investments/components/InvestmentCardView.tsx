// src/components/admin/InvestmentCardView.tsx
import React from "react";
import {
  User,
  Calendar,
  TrendingUp,
  DollarSign,
  Clock,
  Package,
} from "lucide-react";
import type { AdminInvestment } from "../../../../types/investment.types";
import InvestmentStatusBadge from "./InvestmentStatusBadge";
import InvestmentActionDropdown from "./InvestmentActionDropdown";
import type { InvestmentAction } from "../../../../types/investment.types";

interface Props {
  investments: AdminInvestment[];
  onAction: (action: InvestmentAction, investment: AdminInvestment) => void;
}

const InvestmentCardView: React.FC<Props> = ({ investments, onAction }) => {
  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  const calculateDaysRemaining = (endDate?: Date) => {
    if (!endDate) return null;
    const now = new Date();
    const diff = endDate.getTime() - now.getTime();
    const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
    return days > 0 ? days : 0;
  };

  if (investments.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-20">
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
          <Package className="h-8 w-8 text-slate-500" />
        </div>
        <h3 className="mt-4 text-lg font-semibold text-white">
          No investments found
        </h3>
        <p className="mt-1 text-sm text-slate-400">
          Try adjusting your filters or search query.
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {investments.map((investment) => {
        const daysRemaining = calculateDaysRemaining(investment.endDate);
        const expectedProfit = investment.amount * (investment.roi / 100);

        return (
          <div
            key={investment.id}
            className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition hover:border-slate-700 hover:bg-slate-900/80"
          >
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3 min-w-0 flex-1">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
                  <Package className="h-5 w-5 text-emerald-400" />
                </div>
                <div className="min-w-0 flex-1">
                  <h4 className="text-sm font-bold text-white truncate">
                    {investment.packageName}
                  </h4>
                  <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                    {investment.tier} tier
                  </p>
                </div>
              </div>
              <InvestmentActionDropdown
                investment={investment}
                onAction={onAction}
              />
            </div>

            {/* Status */}
            <div className="mb-4">
              <InvestmentStatusBadge status={investment.status} />
            </div>

            {/* User info */}
            <div className="mb-4 flex items-center gap-2 rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 text-xs font-bold text-slate-950">
                {investment.userName.charAt(0).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold text-white truncate">
                  {investment.userName}
                </p>
                <p className="text-[10px] text-slate-500 truncate">
                  {investment.userEmail}
                </p>
              </div>
            </div>

            {/* Amount & Profit */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <DollarSign className="h-3 w-3 text-slate-500" />
                  <p className="text-[10px] text-slate-500 uppercase">Amount</p>
                </div>
                <p className="text-sm font-bold text-white tabular-nums">
                  ${investment.amount.toLocaleString()}
                </p>
              </div>
              <div className="rounded-lg bg-emerald-500/5 border border-emerald-500/20 p-2.5">
                <div className="flex items-center gap-1 mb-1">
                  <TrendingUp className="h-3 w-3 text-emerald-400" />
                  <p className="text-[10px] text-emerald-400 uppercase">
                    Profit
                  </p>
                </div>
                <p className="text-sm font-bold text-emerald-400 tabular-nums">
                  ${investment.totalProfit.toLocaleString()}
                </p>
              </div>
            </div>

            {/* ROI & Duration */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
                <p className="text-[10px] text-slate-500 uppercase mb-1">ROI</p>
                <p className="text-sm font-bold text-cyan-400 tabular-nums">
                  {investment.roi}%
                </p>
              </div>
              <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
                <p className="text-[10px] text-slate-500 uppercase mb-1">
                  Duration
                </p>
                <p className="text-sm font-bold text-white tabular-nums">
                  {investment.duration} days
                </p>
              </div>
            </div>

            {/* Dates */}
            <div className="space-y-1.5 pt-3 border-t border-slate-800">
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-slate-500">
                  <Calendar className="h-3 w-3" />
                  <span>Start</span>
                </div>
                <span className="text-slate-300 tabular-nums">
                  {formatDate(investment.startDate)}
                </span>
              </div>

              {investment.endDate && (
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-slate-500">
                    <Clock className="h-3 w-3" />
                    <span>End</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-slate-300 tabular-nums">
                      {formatDate(investment.endDate)}
                    </span>
                    {investment.status === "active" &&
                      daysRemaining !== null && (
                        <span className="text-[10px] text-amber-400 font-semibold">
                          {daysRemaining}d left
                        </span>
                      )}
                  </div>
                </div>
              )}
            </div>

            {/* Expected profit indicator */}
            {investment.status === "active" && (
              <div className="mt-3 rounded-lg bg-cyan-500/5 border border-cyan-500/20 p-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-400">Expected profit</span>
                  <span className="font-semibold text-cyan-400 tabular-nums">
                    ${expectedProfit.toLocaleString()}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

export default InvestmentCardView;
