// src/components/admin/InvestmentStatusBadge.tsx
import React from "react";
import {
  Clock,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  TrendingUp,
} from "lucide-react";
import type { InvestmentStatus } from "../../../../types/investment.types";

interface Props {
  status: InvestmentStatus;
}

const config: Record<
  InvestmentStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  active: {
    label: "Active",
    icon: <TrendingUp className="h-3 w-3" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  completed: {
    label: "Completed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    classes: "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: <XCircle className="h-3 w-3" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: <AlertTriangle className="h-3 w-3" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

const InvestmentStatusBadge: React.FC<Props> = ({ status }) => {
  const c = config[status];
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-semibold ${c.classes}`}
    >
      {c.icon}
      {c.label}
    </span>
  );
};

export default InvestmentStatusBadge;
