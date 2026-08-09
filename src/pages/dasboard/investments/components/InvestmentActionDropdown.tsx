// src/components/admin/InvestmentActionDropdown.tsx
import React, { useRef, useState } from "react";
import {
  MoreVertical,
  Eye,
  CheckCircle2,
  XCircle,
  TrendingUp,
  Bell,
  Ban,
  Edit3,
} from "lucide-react";
import { useClickOutside } from "../../../../hooks/useClickOutside";
import type {
  AdminInvestment,
  InvestmentAction,
} from "../../../../types/investment.types";

interface Props {
  investment: AdminInvestment;
  onAction: (action: InvestmentAction, investment: AdminInvestment) => void;
}

interface ActionItem {
  id: InvestmentAction;
  label: string;
  icon: React.ReactNode;
  color: string;
  hoverColor: string;
  show: (inv: AdminInvestment) => boolean;
}

const actions: ActionItem[] = [
  {
    id: "view",
    label: "View Details",
    icon: <Eye className="h-4 w-4" />,
    color: "text-slate-300",
    hoverColor: "hover:bg-slate-800 hover:text-white",
    show: () => true,
  },
  {
    id: "approve",
    label: "Approve Investment",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-400",
    hoverColor: "hover:bg-emerald-500/10 hover:text-emerald-300",
    show: (inv) => inv.status === "pending",
  },
  {
    id: "activate",
    label: "Activate",
    icon: <TrendingUp className="h-4 w-4" />,
    color: "text-cyan-400",
    hoverColor: "hover:bg-cyan-500/10 hover:text-cyan-300",
    show: (inv) => inv.status === "pending",
  },
  {
    id: "complete",
    label: "Mark Completed",
    icon: <CheckCircle2 className="h-4 w-4" />,
    color: "text-emerald-400",
    hoverColor: "hover:bg-emerald-500/10 hover:text-emerald-300",
    show: (inv) => inv.status === "active",
  },
  {
    id: "cancel",
    label: "Cancel Investment",
    icon: <Ban className="h-4 w-4" />,
    color: "text-amber-400",
    hoverColor: "hover:bg-amber-500/10 hover:text-amber-300",
    show: (inv) => inv.status === "pending" || inv.status === "active",
  },
  {
    id: "reject",
    label: "Reject",
    icon: <XCircle className="h-4 w-4" />,
    color: "text-red-400",
    hoverColor: "hover:bg-red-500/10 hover:text-red-300",
    show: (inv) => inv.status === "pending",
  },
  {
    id: "adjust_profit",
    label: "Adjust Profit",
    icon: <Edit3 className="h-4 w-4" />,
    color: "text-violet-400",
    hoverColor: "hover:bg-violet-500/10 hover:text-violet-300",
    show: (inv) => inv.status === "active" || inv.status === "completed",
  },
  {
    id: "send_notification",
    label: "Send Notification",
    icon: <Bell className="h-4 w-4" />,
    color: "text-cyan-400",
    hoverColor: "hover:bg-cyan-500/10 hover:text-cyan-300",
    show: () => true,
  },
];

const InvestmentActionDropdown: React.FC<Props> = ({
  investment,
  onAction,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useClickOutside(ref, () => setIsOpen(false));

  const visibleActions = actions.filter((a) => a.show(investment));

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-800 hover:text-white"
        aria-label="Investment actions"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {isOpen && (
        <div className="absolute right-0 top-full z-50 mt-1 w-56 origin-top-right rounded-xl border border-slate-800 bg-slate-900 py-1.5 shadow-2xl shadow-black/40">
          {visibleActions.map((action) => (
            <button
              key={action.id}
              onClick={() => {
                onAction(action.id, investment);
                setIsOpen(false);
              }}
              className={`flex w-full items-center gap-2.5 px-3.5 py-2 text-left text-sm transition ${action.color} ${action.hoverColor}`}
            >
              {action.icon}
              <span className="font-medium">{action.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default InvestmentActionDropdown;
