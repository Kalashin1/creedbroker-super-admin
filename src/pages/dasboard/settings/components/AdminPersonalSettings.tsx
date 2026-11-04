// src/components/admin/settings/AdminPersonalSettings.tsx
import React, { useState } from "react";
import { UserCog, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { updateAdminPersonalSettings } from "../../../../services/admin.settings.service";
import type { AdminPersonalSettings as AdminPersonalSettingsType } from "../../../../types/settings.types";

interface Props {
  adminId: string;
  initial: AdminPersonalSettingsType;
  onSaved: () => void;
}

export const AdminPersonalSettings: React.FC<Props> = ({
  adminId,
  initial,
  onSaved,
}) => {
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initial);

  const handleSave = async () => {
    setLoading(true);
    try {
      await updateAdminPersonalSettings(adminId, form);
      toast.success("Personal admin settings saved");
      onSaved();
    } catch (err) {
      toast.error("Failed to save settings");
    } finally {
      setLoading(false);
    }
  };

  const Toggle = ({
    label,
    desc,
    value,
    onChange,
  }: {
    label: string;
    desc: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-3">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-slate-500">{desc}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-cyan-500" : "bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
            <UserCog className="h-5 w-5 text-cyan-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              My Admin Preferences
            </h3>
            <p className="text-xs text-slate-400">
              Customize your personal dashboard experience
            </p>
          </div>
        </div>
        <button
          onClick={handleSave}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-xl bg-cyan-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-cyan-600 disabled:opacity-50"
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
        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Dashboard Behavior
          </h4>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Session Timeout (Minutes)
            </label>
            <input
              type="number"
              value={form.sessionTimeout}
              onChange={(e) =>
                setForm({ ...form, sessionTimeout: Number(e.target.value) })
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Preferred Currency
            </label>
            <select
              value={form.preferredCurrency}
              onChange={(e) =>
                setForm({ ...form, preferredCurrency: e.target.value })
              }
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              <option value="USD">USD ($)</option>
              <option value="EUR">EUR (€)</option>
              <option value="GBP">GBP (£)</option>
            </select>
          </div>
          <Toggle
            label="Auto-Refresh Dashboard"
            desc="Refresh data every 30 seconds"
            value={form.autoRefreshDashboard}
            onChange={(v) => setForm({ ...form, autoRefreshDashboard: v })}
          />
        </div>

        <div className="space-y-4">
          <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Admin Alerts
          </h4>
          <Toggle
            label="KYC Submissions"
            desc="Notify when a user submits KYC"
            value={form.adminAlerts.kycSubmissions}
            onChange={(v) =>
              setForm({
                ...form,
                adminAlerts: { ...form.adminAlerts, kycSubmissions: v },
              })
            }
          />
          <Toggle
            label="Large Withdrawals"
            desc="Notify for withdrawals over $10,000"
            value={form.adminAlerts.largeWithdrawals}
            onChange={(v) =>
              setForm({
                ...form,
                adminAlerts: { ...form.adminAlerts, largeWithdrawals: v },
              })
            }
          />
          <Toggle
            label="System Errors"
            desc="Critical platform failure alerts"
            value={form.adminAlerts.systemErrors}
            onChange={(v) =>
              setForm({
                ...form,
                adminAlerts: { ...form.adminAlerts, systemErrors: v },
              })
            }
          />
          <Toggle
            label="Security Breaches"
            desc="Immediate alert for suspicious activity"
            value={form.adminAlerts.securityBreaches}
            onChange={(v) =>
              setForm({
                ...form,
                adminAlerts: { ...form.adminAlerts, securityBreaches: v },
              })
            }
          />
        </div>
      </div>
    </div>
  );
};
