// src/components/admin/payments/PaymentMethodCard.tsx
import React, { useState } from "react";
import {
  CreditCard,
  Building,
  Bitcoin,
  Coins,
  Edit3,
  Trash2,
  Loader2,
  DollarSign,
  Clock,
  Percent,
  Wallet,
  Smartphone,
  Globe,
  Apple,
  ShoppingBag,
  CheckCircle2,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  updatePaymentMethod,
  deletePaymentMethod,
} from "../../../../services/payment.service";
import type { PaymentMethod } from "../../../../types/payments.types";
import { PaymentMethodFormModal } from "./PaymentMethodFormModal";

interface Props {
  method: PaymentMethod;
  onUpdated: () => void;
}

const ICON_MAP: Record<string, React.ElementType> = {
  CreditCard,
  Building,
  Bitcoin,
  Coins,
  Wallet,
  Smartphone,
  Globe,
  Apple,
  ShoppingBag,
};

const CATEGORY_COLORS = {
  card: {
    bg: "from-blue-500/20 to-blue-600/20",
    border: "border-blue-500/30",
    text: "text-blue-400",
    badge: "bg-blue-500/10 text-blue-400 border-blue-500/20",
  },
  bank: {
    bg: "from-emerald-500/20 to-emerald-600/20",
    border: "border-emerald-500/30",
    text: "text-emerald-400",
    badge: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  crypto: {
    bg: "from-orange-500/20 to-orange-600/20",
    border: "border-orange-500/30",
    text: "text-orange-400",
    badge: "bg-orange-500/10 text-orange-400 border-orange-500/20",
  },
  third_party: {
    bg: "from-violet-500/20 to-violet-600/20",
    border: "border-violet-500/30",
    text: "text-violet-400",
    badge: "bg-violet-500/10 text-violet-400 border-violet-500/20",
  },
};

export const PaymentMethodCard: React.FC<Props> = ({ method, onUpdated }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [isToggling, setIsToggling] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const Icon = ICON_MAP[method.iconName] || Wallet;
  const colors =
    CATEGORY_COLORS[method.category] || CATEGORY_COLORS.third_party;

  const handleToggle = async () => {
    setIsToggling(true);
    try {
      await updatePaymentMethod(method.id, { enabled: !method.enabled });
      toast.success(
        `${method.name} ${!method.enabled ? "enabled" : "disabled"}`,
      );
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to update status");
    } finally {
      setIsToggling(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(`Delete ${method.name}? This cannot be undone.`))
      return;
    setIsDeleting(true);
    try {
      await deletePaymentMethod(method.id);
      toast.success("Payment method deleted");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to delete");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <>
      <div
        className={`relative rounded-2xl border backdrop-blur transition-all duration-300 ${
          method.enabled
            ? `${colors.border} bg-gradient-to-br ${colors.bg} hover:scale-[1.02]`
            : "border-slate-800 bg-slate-950/50 opacity-60"
        }`}
      >
        {/* Header */}
        <div className="p-5">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-3">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-xl ${colors.badge}`}
              >
                <Icon className="h-6 w-6" />
              </div>
              <div>
                <h4 className="text-base font-bold text-white">
                  {method.name}
                </h4>
                <div className="flex items-center gap-2 mt-0.5">
                  <span
                    className={`text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border ${colors.badge}`}
                  >
                    {method.category.replace("_", " ")}
                  </span>
                  {method.asset && (
                    <span className="text-[10px] font-bold uppercase text-slate-400">
                      {method.asset}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Toggle */}
            <button
              onClick={handleToggle}
              disabled={isToggling}
              className={`relative h-6 w-11 rounded-full transition ${method.enabled ? "bg-emerald-500" : "bg-slate-700"} disabled:opacity-50`}
            >
              {isToggling ? (
                <Loader2 className="absolute top-0.5 left-3 h-5 w-5 animate-spin text-white" />
              ) : (
                <span
                  className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${method.enabled ? "left-5" : "left-0.5"}`}
                />
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <DollarSign className="h-3 w-3 text-slate-500" />
                <span className="text-[10px] text-slate-500 uppercase">
                  Limits
                </span>
              </div>
              <p className="text-xs font-semibold text-white tabular-nums">
                ${method.minAmount.toLocaleString()} - $
                {method.maxAmount.toLocaleString()}
              </p>
            </div>
            <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2.5">
              <div className="flex items-center gap-1.5 mb-1">
                <Percent className="h-3 w-3 text-slate-500" />
                <span className="text-[10px] text-slate-500 uppercase">
                  Fees
                </span>
              </div>
              <p className="text-xs font-semibold text-white tabular-nums">
                {method.feePercentage}% + ${method.feeFlat}
              </p>
            </div>
          </div>

          {/* Processing Time */}
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Clock className="h-3.5 w-3.5" />
            <span>{method.processingTime}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 border-t border-slate-800 p-3 bg-slate-950/30">
          <button
            onClick={() => setIsEditing(true)}
            className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
          >
            <Edit3 className="h-3.5 w-3.5" /> Edit
          </button>
          <button
            onClick={handleDelete}
            disabled={isDeleting}
            className="flex items-center justify-center rounded-lg bg-red-500/10 py-2 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          >
            {isDeleting ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Trash2 className="h-3.5 w-3.5" />
            )}
          </button>
        </div>
      </div>

      {isEditing && (
        <PaymentMethodFormModal
          method={method}
          onClose={() => setIsEditing(false)}
          onSaved={() => {
            setIsEditing(false);
            onUpdated();
          }}
        />
      )}
    </>
  );
};
