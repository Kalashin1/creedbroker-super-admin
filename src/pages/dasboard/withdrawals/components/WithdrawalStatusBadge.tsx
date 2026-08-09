// src/components/admin/withdrawals/WithdrawalStatusBadge.tsx
import React from "react";
import { Clock, CheckCircle2, XCircle, Ban } from "lucide-react";
import type { WithdrawalStatus } from "../../../../types/transaction.types";

interface Props {
  status: WithdrawalStatus;
}

const config: Record<
  WithdrawalStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  approved: {
    label: "Approved",
    icon: <CheckCircle2 className="h-3 w-3" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3 w-3" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  cancelled: {
    label: "Cancelled",
    icon: <Ban className="h-3 w-3" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

const WithdrawalStatusBadge: React.FC<Props> = ({ status }) => {
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

export default WithdrawalStatusBadge;
