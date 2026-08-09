// src/components/admin/transactions/AdminTransactionStats.tsx
import React from "react";
import {
  ArrowRightLeft,
  CheckCircle2,
  Clock,
  XCircle,
  DollarSign,
} from "lucide-react";
import type { TransactionRecord } from "../../../../types/transaction.types";

interface Props {
  transactions: TransactionRecord[];
}

export const AdminTransactionStats: React.FC<Props> = ({ transactions }) => {
  const stats = {
    total: transactions.length,
    completed: transactions.filter((t) => t.status === "completed").length,
    pending: transactions.filter(
      (t) => t.status === "pending" || t.status === "processing",
    ).length,
    failed: transactions.filter(
      (t) => t.status === "failed" || t.status === "cancelled",
    ).length,
    totalVolume: transactions
      .filter((t) => t.status === "completed")
      .reduce((sum, t) => sum + (t.usdValue || t.amount), 0),
  };

  const cards = [
    {
      label: "Total Transactions",
      value: stats.total.toString(),
      subtitle: "All time",
      icon: ArrowRightLeft,
      color: "emerald",
    },
    {
      label: "Completed",
      value: stats.completed.toString(),
      subtitle: `$${stats.totalVolume.toLocaleString()} volume`,
      icon: CheckCircle2,
      color: "cyan",
    },
    {
      label: "Pending/Processing",
      value: stats.pending.toString(),
      subtitle: "Awaiting action",
      icon: Clock,
      color: "amber",
    },
    {
      label: "Failed/Cancelled",
      value: stats.failed.toString(),
      subtitle: "Declined",
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
