// src/components/admin/security/SecurityStats.tsx
import React from 'react';
import { ShieldAlert, UserCheck, Ban, Clock } from 'lucide-react';

interface Props {
  alertsCount: number;
  pendingKYCCount: number;
  blockedUsersCount: number;
  avgSessionTime: string;
}

export const SecurityStats: React.FC<Props> = ({ alertsCount, pendingKYCCount, blockedUsersCount, avgSessionTime }) => {
  const cards = [
    { label: 'Unreviewed Alerts', value: alertsCount.toString(), icon: ShieldAlert, color: 'red' },
    { label: 'Pending KYC', value: pendingKYCCount.toString(), icon: Clock, color: 'amber' },
    { label: 'Blocked Accounts', value: blockedUsersCount.toString(), icon: Ban, color: 'slate' },
    { label: 'Avg Session Duration', value: avgSessionTime, icon: UserCheck, color: 'emerald' },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> = {
    red: { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/20' },
    amber: { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/20' },
    slate: { bg: 'bg-slate-500/10', text: 'text-slate-400', border: 'border-slate-500/20' },
    emerald: { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/20' },
  };

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card, idx) => {
        const colors = colorMap[card.color];
        const Icon = card.icon;
        return (
          <div key={idx} className={`rounded-2xl border ${colors.border} ${colors.bg} p-4`}>
            <div className="flex items-center gap-2 mb-2">
              <Icon className={`h-4 w-4 ${colors.text}`} />
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">{card.label}</p>
            </div>
            <p className={`text-2xl font-bold ${colors.text} tabular-nums`}>{card.value}</p>
          </div>
        );
      })}
    </div>
  );
};