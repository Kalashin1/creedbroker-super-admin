// src/components/admin/ai/AIStrategyForm.tsx
import React, { useState, useEffect } from "react";
import { Bot, Loader2, Save, X, Plus } from "lucide-react";
import { toast } from "react-toastify";
import {
  createAIStrategy,
  updateAIStrategy,
} from "../../../../services/ai.service";
import type {
  AIStrategy,
  StrategyStatus,
  RiskLevel,
} from "../../../../types/ai.types";

interface Props {
  editingStrategy?: AIStrategy | null;
  onSaved: () => void;
  onCancel: () => void;
}

export const AIStrategyForm: React.FC<Props> = ({
  editingStrategy,
  onSaved,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newPair, setNewPair] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "stopped" as StrategyStatus,
    riskLevel: "moderate" as RiskLevel,
    totalProfit: 0,
    totalTrades: 0,
    winRate: 0,
    allocation: 10,
    pairs: [] as string[],
  });

  useEffect(() => {
    if (editingStrategy) {
      setFormData({
        name: editingStrategy.name,
        description: editingStrategy.description,
        status: editingStrategy.status,
        riskLevel: editingStrategy.riskLevel,
        totalProfit: editingStrategy.totalProfit || 0,
        totalTrades: editingStrategy.totalTrades || 0,
        winRate: editingStrategy.winRate || 0,
        allocation: editingStrategy.allocation || 10,
        pairs: editingStrategy.pairs || [],
      });
    }
  }, [editingStrategy]);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >,
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalProfit" ||
        name === "totalTrades" ||
        name === "winRate" ||
        name === "allocation"
          ? Number(value)
          : value,
    }));
  };

  const addPair = () => {
    if (
      !newPair.trim() ||
      formData.pairs.includes(newPair.trim().toUpperCase())
    )
      return;
    setFormData((prev) => ({
      ...prev,
      pairs: [...prev.pairs, newPair.trim().toUpperCase()],
    }));
    setNewPair("");
  };

  const removePair = (pair: string) => {
    setFormData((prev) => ({
      ...prev,
      pairs: prev.pairs.filter((p) => p !== pair),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || formData.pairs.length === 0) {
      toast.error("Name and at least one trading pair are required");
      return;
    }

    setIsSubmitting(true);
    try {
      if (editingStrategy) {
        await updateAIStrategy(editingStrategy.id, formData);
        toast.success("Strategy updated successfully");
      } else {
        await createAIStrategy(formData);
        toast.success("Strategy created successfully");
      }
      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save strategy");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur"
    >
      <div className="mb-6 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
          <Bot className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">
            {editingStrategy ? "Edit AI Strategy" : "Create New AI Strategy"}
          </h3>
          <p className="text-xs text-slate-400">
            Configure the bot parameters for the marketplace
          </p>
        </div>
      </div>

      <div className="space-y-5">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Strategy Name *
            </label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              placeholder="e.g. Momentum Scalper"
              className={inputClass}
              required
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Risk Level *
            </label>
            <select
              name="riskLevel"
              value={formData.riskLevel}
              onChange={handleChange}
              className={`${inputClass} appearance-none`}
            >
              <option value="conservative">Conservative</option>
              <option value="moderate">Moderate</option>
              <option value="aggressive">Aggressive</option>
            </select>
          </div>
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Description *
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            placeholder="Briefly describe how this bot trades..."
            rows={3}
            className={`${inputClass} resize-none`}
            required
          />
        </div>

        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Trading Pairs *
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newPair}
              onChange={(e) => setNewPair(e.target.value)}
              placeholder="e.g. BTC/USD"
              className={`${inputClass} flex-1`}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addPair();
                }
              }}
            />
            <button
              type="button"
              onClick={addPair}
              className="rounded-xl bg-violet-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-violet-600"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {formData.pairs.map((pair) => (
              <span
                key={pair}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-800 border border-slate-700 px-3 py-1 text-xs font-semibold text-white"
              >
                {pair}
                <button
                  type="button"
                  onClick={() => removePair(pair)}
                  className="text-slate-400 hover:text-red-400"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Status
            </label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className={`${inputClass} appearance-none`}
            >
              <option value="active">Active</option>
              <option value="paused">Paused</option>
              <option value="stopped">Stopped</option>
            </select>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Win Rate (%)
            </label>
            <input
              type="number"
              name="winRate"
              value={formData.winRate}
              onChange={handleChange}
              min="0"
              max="100"
              step="0.1"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Total Trades
            </label>
            <input
              type="number"
              name="totalTrades"
              value={formData.totalTrades}
              onChange={handleChange}
              min="0"
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Total Profit ($)
            </label>
            <input
              type="number"
              name="totalProfit"
              value={formData.totalProfit}
              onChange={handleChange}
              step="0.01"
              className={inputClass}
            />
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />{" "}
                {editingStrategy ? "Update Strategy" : "Create Strategy"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};
