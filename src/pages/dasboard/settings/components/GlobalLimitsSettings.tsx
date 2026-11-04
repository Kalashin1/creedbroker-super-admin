// src/components/admin/settings/GlobalLimitsSettings.tsx
import React, { useState } from "react";
import { DollarSign, Save, Loader2, AlertTriangle } from "lucide-react";
import { toast } from "react-toastify";
import { updateGlobalSettings } from "../../../../services/admin.settings.service";
import type { GlobalLimits } from "../../../../types/settings.types";

interface Props {
  initial: GlobalLimits;
  onSaved: () => void;
}

export const GlobalLimitsSettings: React.FC<Props> = ({ initial, onSaved }) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: Number(e.target.value) });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateGlobalSettings({ limits: form });
      toast.success("Global limits updated successfully");
      onSaved();
    } catch (err) {
      toast.error("Failed to update limits");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/20">
            <DollarSign className="h-5 w-5 text-emerald-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Global Account Limits
            </h3>
            <p className="text-xs text-slate-400">
              Maximum thresholds applied to all user accounts
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}{" "}
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Max Account Balance (USD)
          </label>
          <input
            type="number"
            name="maxAccountBalanceUSD"
            value={form.maxAccountBalanceUSD}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Max Trade Size (USD)
          </label>
          <input
            type="number"
            name="maxTradeSizeUSD"
            value={form.maxTradeSizeUSD}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Min Withdrawal Amount (USD)
          </label>
          <input
            type="number"
            name="minWithdrawalAmountUSD"
            value={form.minWithdrawalAmountUSD}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Max Single Withdrawal (USD)
          </label>
          <input
            type="number"
            name="maxWithdrawalAmountUSD"
            value={form.maxWithdrawalAmountUSD}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Max Daily Withdrawal Limit (USD)
          </label>
          <input
            type="number"
            name="maxDailyWithdrawalAmountUSD"
            value={form.maxDailyWithdrawalAmountUSD}
            onChange={handleChange}
            className={inputClass}
          />
        </div>
      </div>

      <div className="mt-4 flex items-start gap-2 rounded-lg bg-amber-500/5 border border-amber-500/20 p-3">
        <AlertTriangle className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
        <p className="text-xs text-amber-200/80">
          Changing these limits will immediately restrict user actions that
          exceed the new thresholds. Existing pending withdrawals above the new
          max will be flagged for manual review.
        </p>
      </div>
    </div>
  );
};
