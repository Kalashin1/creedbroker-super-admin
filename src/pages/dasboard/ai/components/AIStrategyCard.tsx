// src/components/admin/ai/AIStrategyCard.tsx
import React, { useState } from "react";
import { Bot, Edit3, Trash2, Play, Pause, Square, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  updateAIStrategy,
  deleteAIStrategy,
} from "../../../../services/ai.service";
import type { AIStrategy, StrategyStatus } from "../../../../types/ai.types";

interface Props {
  strategy: AIStrategy;
  onEdit: (strategy: AIStrategy) => void;
  onUpdated: () => void;
}

const statusConfig: Record<
  StrategyStatus,
  { label: string; icon: React.ReactNode; classes: string }
> = {
  active: {
    label: "Active",
    icon: <Play className="h-3 w-3" />,
    classes: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  },
  paused: {
    label: "Paused",
    icon: <Pause className="h-3 w-3" />,
    classes: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  },
  stopped: {
    label: "Stopped",
    icon: <Square className="h-3 w-3" />,
    classes: "bg-slate-500/10 text-slate-400 border-slate-500/20",
  },
};

const riskConfig: Record<string, string> = {
  conservative: "text-emerald-400",
  moderate: "text-amber-400",
  aggressive: "text-red-400",
};

export const AIStrategyCard: React.FC<Props> = ({
  strategy,
  onEdit,
  onUpdated,
}) => {
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const config = statusConfig[strategy.status];

  const handleToggleStatus = async () => {
    setIsUpdating(true);
    try {
      const newStatus = strategy.status === "active" ? "paused" : "active";
      await updateAIStrategy(strategy.id, { status: newStatus });
      toast.success(`Strategy ${newStatus}`);
      onUpdated();
    } catch (err) {
      toast.error("Failed to update status");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDelete = async () => {
    if (
      !window.confirm(
        `Delete "${strategy.name}"? This will remove it from the marketplace.`,
      )
    )
      return;
    setIsDeleting(true);
    try {
      await deleteAIStrategy(strategy.id);
      toast.success("Strategy deleted");
      onUpdated();
    } catch (err) {
      toast.error("Failed to delete strategy");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="group relative flex flex-col rounded-2xl border border-slate-800 bg-slate-900/50 p-5 backdrop-blur transition hover:border-slate-700 hover:bg-slate-900/80">
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <Bot className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">{strategy.name}</h4>
            <p
              className={`text-[10px] font-medium uppercase tracking-wider ${riskConfig[strategy.riskLevel] || "text-slate-400"}`}
            >
              {strategy.riskLevel} Risk
            </p>
          </div>
        </div>
        <span
          className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold ${config.classes}`}
        >
          {config.icon}
          {config.label}
        </span>
      </div>

      <p className="text-xs text-slate-400 line-clamp-2 mb-4 flex-1">
        {strategy.description}
      </p>

      <div className="grid grid-cols-3 gap-2 mb-4">
        <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 text-center">
          <p className="text-[9px] text-slate-500 uppercase">Win Rate</p>
          <p className="text-sm font-bold text-cyan-400 tabular-nums">
            {strategy.winRate}%
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 text-center">
          <p className="text-[9px] text-slate-500 uppercase">Trades</p>
          <p className="text-sm font-bold text-white tabular-nums">
            {strategy.totalTrades}
          </p>
        </div>
        <div className="rounded-lg bg-slate-950/50 border border-slate-800 p-2 text-center">
          <p className="text-[9px] text-slate-500 uppercase">Profit</p>
          <p className="text-sm font-bold text-emerald-400 tabular-nums">
            ${strategy.totalProfit.toLocaleString()}
          </p>
        </div>
      </div>

      <div className="mb-4 flex flex-wrap gap-1">
        {strategy.pairs.slice(0, 3).map((pair) => (
          <span
            key={pair}
            className="rounded bg-slate-800/60 px-2 py-0.5 text-[10px] font-semibold text-slate-300"
          >
            {pair}
          </span>
        ))}
        {strategy.pairs.length > 3 && (
          <span className="text-[10px] text-slate-500">
            +{strategy.pairs.length - 3}
          </span>
        )}
      </div>

      <div className="flex gap-2 border-t border-slate-800 pt-3">
        <button
          onClick={() => onEdit(strategy)}
          className="flex-1 inline-flex items-center justify-center gap-1.5 rounded-lg bg-slate-800/60 py-2 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white"
        >
          <Edit3 className="h-3.5 w-3.5" /> Edit
        </button>
        <button
          onClick={handleToggleStatus}
          disabled={isUpdating}
          className="flex items-center justify-center rounded-lg bg-slate-800/60 py-2 px-3 text-xs font-semibold text-slate-200 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
        >
          {isUpdating ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : strategy.status === "active" ? (
            <Pause className="h-3.5 w-3.5" />
          ) : (
            <Play className="h-3.5 w-3.5" />
          )}
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
  );
};
