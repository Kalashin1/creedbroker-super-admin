// src/components/admin/UserStatusBadge.tsx
import React from "react";
import { CheckCircle2, XCircle, AlertTriangle, Ban } from "lucide-react";
import type { AccountStatus } from "../../../types/admin.types";

interface Props {
  status: AccountStatus;
}

const config: Record<
  AccountStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  active: {
    label: "Active",
    icon: <CheckCircle2 className="h-3 w-3" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  restricted: {
    label: "Restricted",
    icon: <AlertTriangle className="h-3 w-3" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  blocked: {
    label: "Blocked",
    icon: <Ban className="h-3 w-3" />,
    classes: "bg-red-500/10 text-red-400 border-red-500/20",
  },
  deleted: {
    label: "Deleted",
    icon: <XCircle className="h-3 w-3" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

const UserStatusBadge: React.FC<Props> = ({ status }) => {
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

export default UserStatusBadge;
