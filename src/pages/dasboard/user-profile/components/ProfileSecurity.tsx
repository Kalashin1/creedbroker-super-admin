// src/components/admin/profile/ProfileSecurity.tsx
import React from "react";
import {
  Shield,
  Monitor,
  Smartphone,
  CheckCircle2,
  XCircle,
  Activity,
} from "lucide-react";
import type { LoginActivity, ActiveSession } from "../../../../types/security.types";

interface Props {
  loginActivity: LoginActivity[];
  sessions: ActiveSession[];
}

const ProfileSecurity: React.FC<Props> = ({ loginActivity, sessions }) => {
  const getDeviceIcon = (device: string) => {
    if (device.toLowerCase().includes("mobile")) return Smartphone;
    return Monitor;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center gap-2 mb-6">
        <Shield className="h-5 w-5 text-amber-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Security Activity
        </h3>
      </div>

      {/* Active Sessions */}
      <div className="mb-6">
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Monitor className="h-3.5 w-3.5" />
          Active Sessions ({sessions.length})
        </h4>
        {sessions.length === 0 ? (
          <p className="text-xs text-slate-500 italic">No active sessions</p>
        ) : (
          <div className="space-y-2">
            {sessions.map((session) => {
              const DeviceIcon = getDeviceIcon(session.device);
              return (
                <div
                  key={session.id}
                  className={`flex items-center justify-between rounded-lg border p-3 ${
                    session.isCurrent
                      ? "border-emerald-500/30 bg-emerald-500/5"
                      : "border-slate-800 bg-slate-950/50"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <DeviceIcon className="h-4 w-4 text-slate-400" />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {session.browser} on {session.os}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {session.location} • {session.ip}
                      </p>
                    </div>
                  </div>
                  {session.isCurrent && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                      <CheckCircle2 className="h-3 w-3" />
                      Current
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Recent Login Activity */}
      <div>
        <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-2">
          <Activity className="h-3.5 w-3.5" />
          Recent Login Activity ({loginActivity.length})
        </h4>
        {loginActivity.length === 0 ? (
          <p className="text-xs text-slate-500 italic">
            No login activity recorded
          </p>
        ) : (
          <div className="space-y-1.5 max-h-80 overflow-y-auto custom-scroll">
            {loginActivity.map((activity) => {
              const DeviceIcon = getDeviceIcon(activity.device);
              const isSuccess = activity.status === "success";
              return (
                <div
                  key={activity.id}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <DeviceIcon
                      className={`h-3.5 w-3.5 ${
                        isSuccess ? "text-emerald-400" : "text-red-400"
                      }`}
                    />
                    <div>
                      <p className="text-xs font-semibold text-white">
                        {activity.browser} • {activity.os}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {activity.location} • {activity.ip}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="h-3.5 w-3.5 text-red-400" />
                    )}
                    <span className="text-[10px] text-slate-500">
                      {activity.timestamp.toLocaleString()}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfileSecurity;
