// src/components/admin/security/GlobalSecuritySettings.tsx
import React, { useState } from 'react';
import { Settings, Loader2, Save } from 'lucide-react';
import { toast } from 'react-toastify';
import {  type GlobalSecuritySettings as _GlobalSecuritySettings } from '../../../../types/security.types';
import { updateGlobalSecuritySettings } from '../../../../services/security.service';

interface Props {
  initialSettings: _GlobalSecuritySettings;
  onUpdated: () => void;
}

export const GlobalSecuritySettings: React.FC<Props> = ({ initialSettings, onUpdated }) => {
  const [isSaving, setIsSaving] = useState(false);
  const [settings, setSettings] = useState(initialSettings);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      await updateGlobalSecuritySettings(settings);
      toast.success('Security settings updated successfully');
      onUpdated();
    } catch (err) {
      toast.error('Failed to update settings');
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass = "w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-emerald-500/50";

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
          <Settings className="h-5 w-5 text-violet-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Global Security Settings</h3>
          <p className="text-xs text-slate-400">Configure platform-wide security rules</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">Session Timeout (Minutes)</label>
          <input type="number" value={settings.sessionTimeoutMinutes} onChange={(e) => setSettings({ ...settings, sessionTimeoutMinutes: Number(e.target.value) })} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">Max Failed Login Attempts</label>
          <input type="number" value={settings.maxFailedLoginAttempts} onChange={(e) => setSettings({ ...settings, maxFailedLoginAttempts: Number(e.target.value) })} className={inputClass} />
        </div>
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">Min. Withdrawal Amount (USD)</label>
          <input type="number" value={settings.minWithdrawalAmountUSD} onChange={(e) => setSettings({ ...settings, minWithdrawalAmountUSD: Number(e.target.value) })} className={inputClass} />
        </div>
        <div className="flex items-end pb-2.5">
          <label className="flex items-center gap-3 cursor-pointer group">
            <div className="relative">
              <input type="checkbox" checked={settings.require2FAForWithdrawals} onChange={(e) => setSettings({ ...settings, require2FAForWithdrawals: e.target.checked })} className="peer sr-only" />
              <div className="h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-emerald-500" />
              <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
            </div>
            <span className="text-sm font-semibold text-slate-300">Require 2FA for Withdrawals</span>
          </label>
        </div>
      </div>

      <div className="flex items-center justify-between border-t border-slate-800 pt-4">
        <label className="flex items-center gap-3 cursor-pointer group">
          <div className="relative">
            <input type="checkbox" checked={settings.maintenanceMode} onChange={(e) => setSettings({ ...settings, maintenanceMode: e.target.checked })} className="peer sr-only" />
            <div className="h-6 w-11 rounded-full bg-slate-700 transition peer-checked:bg-red-500" />
            <div className="absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition peer-checked:translate-x-5" />
          </div>
          <span className="text-sm font-semibold text-red-400">Enable Maintenance Mode</span>
        </label>
        <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40 disabled:opacity-50">
          {isSaving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          Save Settings
        </button>
      </div>
    </form>
  );
};