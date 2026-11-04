// src/components/admin/settings/GlobalTradingAndFeesSettings.tsx
import React, { useState } from "react";
import { TrendingUp, Percent, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { updateGlobalSettings } from "../../../../services/admin.settings.service";
import type { GlobalTrading, GlobalFees } from "../../../../types/settings.types";

interface Props {
  trading: GlobalTrading;
  fees: GlobalFees;
  onSaved: () => void;
}

export const GlobalTradingAndFeesSettings: React.FC<Props> = ({
  trading,
  fees,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [tForm, setTForm] = useState(trading);
  const [fForm, setFForm] = useState(fees);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateGlobalSettings({ trading: tForm, fees: fForm });
      toast.success("Trading and fee settings updated");
      onSaved();
    } catch (err) {
      toast.error("Failed to update settings");
    } finally {
      setLoading(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <TrendingUp className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              Trading & Fee Structure
            </h3>
            <p className="text-xs text-slate-400">
              Platform-wide trading rules and revenue fees
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-violet-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-violet-600 disabled:opacity-50"
        >
          {loading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}{" "}
          Save
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Trading */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <TrendingUp className="h-3.5 w-3.5" /> Trading Rules
          </h4>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3">
            <span className="text-sm text-slate-300">
              Enable Platform Trading
            </span>
            <button
              onClick={() =>
                setTForm({ ...tForm, tradingEnabled: !tForm.tradingEnabled })
              }
              className={`relative h-6 w-11 rounded-full transition ${tForm.tradingEnabled ? "bg-emerald-500" : "bg-slate-700"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${tForm.tradingEnabled ? "left-5" : "left-0.5"}`}
              />
            </button>
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Global Max Leverage (x)
            </label>
            <input
              type="number"
              value={tForm.globalMaxLeverage}
              onChange={(e) =>
                setTForm({
                  ...tForm,
                  globalMaxLeverage: Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Default Leverage (x)
            </label>
            <input
              type="number"
              value={tForm.defaultLeverage}
              onChange={(e) =>
                setTForm({ ...tForm, defaultLeverage: Number(e.target.value) })
              }
              className={inputClass}
            />
          </div>
        </div>

        {/* Fees */}
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider flex items-center gap-2">
            <Percent className="h-3.5 w-3.5" /> Platform Fees
          </h4>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Trading Fee (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={tForm.tradingFeePercentage}
              onChange={(e) =>
                setTForm({
                  ...tForm,
                  tradingFeePercentage: Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Withdrawal Flat Fee (USD)
            </label>
            <input
              type="number"
              step="0.01"
              value={fForm.withdrawalFeeFlatUSD}
              onChange={(e) =>
                setFForm({
                  ...fForm,
                  withdrawalFeeFlatUSD: Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Withdrawal Fee (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={fForm.withdrawalFeePercentage}
              onChange={(e) =>
                setFForm({
                  ...fForm,
                  withdrawalFeePercentage: Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Deposit Fee (%)
            </label>
            <input
              type="number"
              step="0.01"
              value={fForm.depositFeePercentage}
              onChange={(e) =>
                setFForm({
                  ...fForm,
                  depositFeePercentage: Number(e.target.value),
                })
              }
              className={inputClass}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
