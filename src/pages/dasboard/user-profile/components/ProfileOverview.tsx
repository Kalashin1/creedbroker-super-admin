// src/components/admin/profile/ProfileOverview.tsx
import React from "react";
import {
  DollarSign,
  TrendingUp,
  Briefcase,
  ArrowUpFromLine,
  Wallet,
} from "lucide-react";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
}

const ProfileOverview: React.FC<Props> = ({ profile }) => {
  const balance = profile.balance || { usd: 0, btc: 0, eth: 0, bnb: 0, sol: 0 };
  const stats = profile.stats || {
    totalInvestments: 0,
    totalInvested: 0,
    totalProfit: 0,
    totalWithdrawals: 0,
  };

  const cards = [
    {
      label: "USD Balance",
      value: `$${balance.usd.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      icon: DollarSign,
      color: "emerald",
    },
    {
      label: "Total Invested",
      value: `$${stats.totalInvested.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      icon: Briefcase,
      color: "cyan",
    },
    {
      label: "Total Profit",
      value: `$${stats.totalProfit.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      icon: TrendingUp,
      color: "violet",
    },
    {
      label: "Total Withdrawals",
      value: `$${stats.totalWithdrawals.toLocaleString("en-US", {
        minimumFractionDigits: 2,
      })}`,
      icon: ArrowUpFromLine,
      color: "amber",
    },
    {
      label: "Active Investments",
      value: stats.totalInvestments.toString(),
      icon: Wallet,
      color: "blue",
    },
  ];

  const colorMap: Record<string, { bg: string; text: string; border: string }> =
    {
      emerald: {
        bg: "bg-emerald-500/10",
        text: "text-emerald-400",
        border: "border-emerald-500/20",
      },
      cyan: {
        bg: "bg-cyan-500/10",
        text: "text-cyan-400",
        border: "border-cyan-500/20",
      },
      violet: {
        bg: "bg-violet-500/10",
        text: "text-violet-400",
        border: "border-violet-500/20",
      },
      amber: {
        bg: "bg-amber-500/10",
        text: "text-amber-400",
        border: "border-amber-500/20",
      },
      blue: {
        bg: "bg-blue-500/10",
        text: "text-blue-400",
        border: "border-blue-500/20",
      },
    };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-4">
        Financial Overview
      </h3>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-5">
        {cards.map((card, idx) => {
          const colors = colorMap[card.color];
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className={`rounded-xl border ${colors.border} ${colors.bg} p-4`}
            >
              <div className="flex items-center gap-2 mb-2">
                <Icon className={`h-4 w-4 ${colors.text}`} />
                <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                  {card.label}
                </p>
              </div>
              <p className={`text-lg font-bold ${colors.text} tabular-nums`}>
                {card.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Crypto balances */}
      {(balance.btc > 0 ||
      // @ts-ignore
      balance.eth > 0 ||
      // @ts-ignore
      balance.bnb > 0 ||
      // @ts-ignore
        balance.sol > 0) && (
        <div className="mt-4 rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3">
            Crypto Balances
          </p>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {balance.btc > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400">BTC</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {balance.btc.toFixed(6)}
                </span>
              </div>
            )}
            {balance.eth && balance.eth > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400">ETH</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {balance.eth?.toFixed(6)}
                </span>
              </div>
            )}
            {balance.bnb && balance.bnb > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400">BNB</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {balance.bnb.toFixed(6)}
                </span>
              </div>
            )}
            {balance.sol && balance.sol > 0 && (
              <div className="flex items-center justify-between rounded-lg bg-slate-900/50 px-3 py-2">
                <span className="text-xs text-slate-400">SOL</span>
                <span className="text-sm font-bold text-white tabular-nums">
                  {balance.sol.toFixed(6)}
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfileOverview;
