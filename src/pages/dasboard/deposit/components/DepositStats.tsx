// src/components/admin/deposits/DepositStats.tsx
import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  ArrowDownToLine,
} from "lucide-react";
import type { DepositRequest } from "../../../../types/deposit.types";

interface Props {
  deposits: DepositRequest[];
}

export const DepositStats: React.FC<Props> = ({ deposits }) => {
  const stats = {
    total: deposits.length,
    pending: deposits.filter((d) => d.status === "pending").length,
    confirmed: deposits.filter((d) => d.status === "confirmed").length,
    rejected: deposits.filter((d) => d.status === "rejected").length,
    totalAmount: deposits
      .filter((d) => d.status === "confirmed")
      .reduce((sum, d) => sum + d.amount, 0),
    pendingAmount: deposits
      .filter((d) => d.status === "pending")
      .reduce((sum, d) => sum + d.amount, 0),
  };

  const cards = [
    {
      label: "Total Deposits",
      value: stats.total.toString(),
      subtitle: "All time",
      icon: ArrowDownToLine,
      color: "emerald",
    },
    {
      label: "Pending Review",
      value: stats.pending.toString(),
      subtitle: `$${stats.pendingAmount.toLocaleString()} awaiting`,
      icon: Clock,
      color: "amber",
    },
    {
      label: "Confirmed",
      value: stats.confirmed.toString(),
      subtitle: `$${stats.totalAmount.toLocaleString()} credited`,
      icon: CheckCircle2,
      color: "cyan",
    },
    {
      label: "Rejected",
      value: stats.rejected.toString(),
      subtitle: "Declined requests",
      icon: XCircle,
      color: "red",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      },
      amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
      },
      cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
      },
      red: {
        bg: "bg-red-500/10",
        text: "text-red-400",
        border: "border-red-500/20",
      },
    };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const colors = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div
            key={idx}
            className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}
          >
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${colors.text}`} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                {card.label}
              </p>
            </div>
            <p className={`text-2xl font-bold ${colors.text} tabular-nums`}>
              {card.value}
            </p>
            <p className="mt-0.5 text-[10px] text-slate-500">{card.subtitle}</p>
          </div>
        );
      })}
    </div>
  );
};
