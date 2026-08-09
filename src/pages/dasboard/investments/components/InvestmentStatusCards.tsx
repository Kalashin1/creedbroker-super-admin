// src/components/admin/InvestmentStats.tsx
import React from "react";
import {
  TrendingUp,
  DollarSign,
  Clock,
  CheckCircle2,
  Package,
} from "lucide-react";
import type { InvestmentStats } from "../../../../types/investment.types";

interface Props {
  stats: InvestmentStats;
}

const InvestmentStatsCards: React.FC<Props> = ({ stats }) => {
  const cards = [
    {
      label: "Total Investments",
      value: stats.total.toString(),
      icon: Package,
      color: "emerald",
      subtitle: "All time",
    },
    {
      label: "Active",
      value: stats.active.toString(),
      icon: TrendingUp,
      color: "cyan",
      subtitle: "Currently running",
    },
    {
      label: "Pending",
      value: stats.pending.toString(),
      icon: Clock,
      color: "amber",
      subtitle: "Awaiting approval",
    },
    {
      label: "Completed",
      value: stats.completed.toString(),
      icon: CheckCircle2,
      color: "violet",
      subtitle: "Matured",
    },
    {
      label: "Total Invested",
      value: `$${stats.totalInvested.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      icon: DollarSign,
      color: "emerald",
      subtitle: "Platform capital",
    },
    {
      label: "Total Profit Paid",
      value: `$${stats.totalProfit.toLocaleString("en-US", {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
      })}`,
      icon: DollarSign,
      color: "cyan",
      subtitle: "Distributed",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      },
      cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
      },
      amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
      },
      violet: {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/20",
      },
    };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card, index) => {
        const colors = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div
            key={index}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${colors.text}`} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
            </div>
            <p className={`text-xl font-bold ${colors.text} tabular-nums`}>
              {card.value}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};

export default InvestmentStatsCards;
