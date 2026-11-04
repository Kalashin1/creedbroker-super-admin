// src/components/admin/profile/AdminPreferences.tsx
import React, { useState, useEffect } from "react";
import { Bell, Globe, Clock, Save, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchAdminPreferences,
  updateAdminPreferences,
} from "../../../../services/profile.service";
import type { AdminPreferences as AdminPrefsType } from "../../../../types/profile.types";

interface Props {
  adminId: string;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (US)" },
  { value: "America/Los_Angeles", label: "Pacific Time (US)" },
  { value: "Europe/London", label: "London (GMT)" },
  { value: "Europe/Paris", label: "Paris (CET)" },
  { value: "Asia/Dubai", label: "Dubai (GST)" },
  { value: "Asia/Singapore", label: "Singapore (SGT)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Africa/Lagos", label: "Lagos (WAT)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Español" },
  { value: "fr", label: "Français" },
  { value: "de", label: "Deutsch" },
  { value: "ar", label: "العربية" },
  { value: "zh", label: "中文" },
];

export const AdminPreferencesCard: React.FC<Props> = ({ adminId }) => {
  const [prefs, setPrefs] = useState<AdminPrefsType | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const load = async () => {
      const data = await fetchAdminPreferences(adminId);
      setPrefs(data);
      setLoading(false);
    };
    load();
  }, [adminId]);

  const handleSave = async () => {
    if (!prefs) return;
    setSaving(true);
    try {
      await updateAdminPreferences(adminId, prefs);
      toast.success("Preferences saved");
    } catch (err) {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  if (loading || !prefs) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <Loader2 className="h-6 w-6 animate-spin text-violet-400" />
      </div>
    );
  }

  const Toggle = ({
    label,
    description,
    value,
    onChange,
  }: {
    label: string;
    description: string;
    value: boolean;
    onChange: (v: boolean) => void;
  }) => (
    <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
      <div>
        <p className="text-sm font-semibold text-white">{label}</p>
        <p className="text-[11px] text-slate-500 mt-0.5">{description}</p>
      </div>
      <button
        onClick={() => onChange(!value)}
        className={`relative h-6 w-11 rounded-full transition ${value ? "bg-emerald-500" : "bg-slate-700"}`}
      >
        <span
          className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${value ? "left-5" : "left-0.5"}`}
        />
      </button>
    </div>
  );

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/20">
          <Bell className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-white">Preferences</h3>
          <p className="text-xs text-slate-400">
            Customize your admin experience
          </p>
        </div>
      </div>

      <div className="space-y-4">
        <Toggle
          label="Email Notifications"
          description="Receive email updates for important events"
          value={prefs.emailNotifications}
          onChange={(v) => setPrefs({ ...prefs, emailNotifications: v })}
        />
        <Toggle
          label="Security Alerts"
          description="Get notified about suspicious activity"
          value={prefs.securityAlerts}
          onChange={(v) => setPrefs({ ...prefs, securityAlerts: v })}
        />
        <Toggle
          label="KYC Alerts"
          description="Notifications for new KYC submissions"
          value={prefs.kycAlerts}
          onChange={(v) => setPrefs({ ...prefs, kycAlerts: v })}
        />
        <Toggle
          label="Withdrawal Alerts"
          description="Notifications for new withdrawal requests"
          value={prefs.withdrawalAlerts}
          onChange={(v) => setPrefs({ ...prefs, withdrawalAlerts: v })}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Clock className="h-3.5 w-3.5" /> Timezone
            </label>
            <select
              value={prefs.timezone}
              onChange={(e) => setPrefs({ ...prefs, timezone: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              {TIMEZONES.map((tz) => (
                <option key={tz.value} value={tz.value}>
                  {tz.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-1.5 flex items-center gap-1.5 text-xs font-semibold text-slate-300">
              <Globe className="h-3.5 w-3.5" /> Language
            </label>
            <select
              value={prefs.language}
              onChange={(e) => setPrefs({ ...prefs, language: e.target.value })}
              className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-cyan-500/50"
            >
              {LANGUAGES.map((lang) => (
                <option key={lang.value} value={lang.value}>
                  {lang.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex justify-end pt-2">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 disabled:opacity-50"
          >
            {saving ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Save className="h-4 w-4" />
            )}
            Save Preferences
          </button>
        </div>
      </div>
    </div>
  );
};
