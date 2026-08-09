// src/components/admin/packages/PackageCard.tsx
import React, { useState } from "react";
import {
  Edit3,
  Trash2,
  Star,
  TrendingUp,
  Zap,
  Crown,
  Gem,
  Building2,
  Rocket,
  Shield,
  Target,
  Award,
  Flame,
  Check,
  Loader2,
  type LucideIcon,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  deletePackage,
  togglePackagePopular,
} from "../../../../../services/adminPackage.service";
import type { InvestmentPackage } from "../../../../../types/investment.types";

interface Props {
  package: InvestmentPackage;
  onEdit: (pkg: InvestmentPackage) => void;
  onDeleted: () => void;
  onUpdated: () => void;
}

const ICON_MAP: Record<string, LucideIcon> = {
  TrendingUp,
  Zap,
  Crown,
  Gem,
  Building2,
  Rocket,
  Shield,
  Target,
  Award,
  Flame,
  Star,
};

const PackageCard: React.FC<Props> = ({
  package: pkg,
  onEdit,
  onDeleted,
  onUpdated,
}) => {
  const [isDeleting, setIsDeleting] = useState(false);
  const [isToggling, setIsToggling] = useState(false);

  const Icon = ICON_MAP[pkg.iconName] || TrendingUp;

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${pkg.name}"? This will remove it from the user's invest page.`,
      )
    )
      return;

    setIsDeleting(true);
    try {
      await deletePackage(pkg.id);
      toast.success("Package deleted");
      onDeleted();
    } catch (err) {
      console.error(err);
      toast.error("Failed to delete package");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleTogglePopular = async () => {
    setIsToggling(true);
    try {
      await togglePackagePopular(pkg.id, !pkg.popular);
      toast.success(pkg.popular ? "Removed from popular" : "Marked as popular");
      onUpdated();
    } catch (err) {
      console.error(err);
      toast.error("Failed to update package");
    } finally {
      setIsToggling(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition hover:border-slate-700 hover:bg-slate-900/80">
      {/* Popular badge */}
      {pkg.popular && (
        <div className="absolute -top-2.5 right-4 inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-amber-500 to-orange-500 px-2.5 py-0.5 text-[10px] font-bold text-slate-950 shadow-lg">
          <Star className="h-3 w-3" />
          Popular
        </div>
      )}

      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br ${pkg.accentFrom} ${pkg.accentTo} shadow-lg`}
          >
            <Icon className="h-6 w-6 text-white" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{pkg.name}</h4>
            <p className="text-[10px] font-medium text-slate-500 uppercase tracking-wider">
              {pkg.tier} tier
            </p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-4 grid grid-cols-3 gap-2">
        <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 text-center">
          <p className="text-[9px] text-slate-500 uppercase">ROI</p>
          <p className="text-sm font-bold text-emerald-400 tabular-nums">
            {pkg.roi}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 text-center">
          <p className="text-[9px] text-slate-500 uppercase">Duration</p>
          <p className="text-sm font-bold text-white tabular-nums">
            {pkg.duration}d
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 text-center">
          <p className="text-[9px] text-slate-500 uppercase">Daily</p>
          <p className="text-sm font-bold text-cyan-400 tabular-nums">
            {pkg.dailyProfit}%
          </p>
        </div>
      </div>

      {/* Range */}
      <div className="mb-4 flex items-center justify-between rounded-lg bg-slate-950/50 border border-slate-800 px-3 py-2">
        <span className="text-[10px] text-slate-500 uppercase">Range</span>
        <span className="text-xs font-semibold text-white tabular-nums">
          ${pkg.minInvestment.toLocaleString()} - $
          {pkg.maxInvestment.toLocaleString()}
        </span>
      </div>

      {/* Features */}
      <div className="mb-4 flex-1 space-y-1">
        {pkg.features.slice(0, 3).map((feature, idx) => (
          <div
            key={idx}
            className="flex items-center gap-2 text-xs text-slate-300"
          >
            <Check className="h-3 w-3 text-emerald-400 shrink-0" />
            <span className="truncate">{feature}</span>
          </div>
        ))}
        {pkg.features.length > 3 && (
          <p className="text-[10px] text-slate-500 italic">
            +{pkg.features.length - 3} more features
          </p>
        )}
      </div>

      {/* Actions */}
      <div className="flex gap-2 border-t border-slate-800 pt-3">
        <button
          onClick={() => onEdit(pkg)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
        >
          <Edit3 className="h-3.5 w-3.5" />
          Edit
        </button>
        <button
          onClick={handleTogglePopular}
          disabled={isToggling}
          className={`flex items-center justify-center rounded-lg py-2 px-3 text-xs font-semibold transition ${
            pkg.popular
              ? "bg-amber-500/15 text-amber-400 hover:bg-amber-500/25"
              : "bg-slate-800/60 text-slate-400 hover:bg-slate-800 hover:text-amber-400"
          } disabled:opacity-50`}
          title={pkg.popular ? "Remove from popular" : "Mark as popular"}
        >
          {isToggling ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Star className="h-3.5 w-3.5" />
          )}
        </button>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="flex items-center justify-center rounded-lg bg-red-500/10 py-2 px-3 text-xs font-semibold text-red-400 transition hover:bg-red-500/20 disabled:opacity-50"
          title="Delete package"
        >
          {isDeleting ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Trash2 className="h-3.5 w-3.5" />
          )}
        </button>
      </div>
    </div>
  );
};

export default PackageCard;
