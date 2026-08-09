// src/components/admin/deposits/DepositStatusBadge.tsx
import React from "react";
import { Clock, CheckCircle2, XCircle } from "lucide-react";
import type { DepositStatus } from "../../../../types/deposit.types";

const config: Record<
  DepositStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  pending: {
    label: "Pending",
    icon: <Clock className="h-3 w-3" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  confirmed: {
    label: "Confirmed",
    icon: <CheckCircle2 className="h-3 w-3" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  rejected: {
    label: "Rejected",
    icon: <XCircle className="h-3 w-3" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
};

export const DepositStatusBadge: React.FC<{ status: DepositStatus }> = ({
  status,
}) => {
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
