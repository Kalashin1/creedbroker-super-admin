// src/components/admin/profile/ProfileBankAccounts.tsx
import React from "react";
import { Landmark, Building2, Hash, Globe } from "lucide-react";
import type { BankAccount } from "../../../../types/user.types";

interface Props {
  bankAccounts: BankAccount[];
}

const ProfileBankAccounts: React.FC<Props> = ({ bankAccounts }) => {
  if (bankAccounts.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
        <div className="flex items-center gap-2 mb-4">
          <Landmark className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Bank Accounts
          </h3>
        </div>
        <div className="flex flex-col items-center justify-center py-8 text-center">
          <Landmark className="h-10 w-10 text-slate-600 mb-2" />
          <p className="text-sm text-slate-400">No bank accounts added</p>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Landmark className="h-5 w-5 text-blue-400" />
          <h3 className="text-sm font-bold text-white uppercase tracking-wider">
            Bank Accounts
          </h3>
        </div>
        <span className="text-xs text-slate-500">
          {bankAccounts.length} total
        </span>
      </div>

      <div className="space-y-3">
        {bankAccounts.map((bank) => (
          <div
            key={bank.id}
            className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gradient-to-br from-blue-500 to-indigo-600">
                <Building2 className="h-5 w-5 text-white" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-sm font-bold text-white">
                  {bank.bankName}
                </h4>
                <p className="text-[11px] text-slate-500">{bank.accountName}</p>
              </div>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 text-[10px] font-semibold text-emerald-400">
                {bank.currency}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                <Hash className="h-3 w-3 text-slate-500" />
                <span className="text-slate-400">Account:</span>
                <span className="font-mono font-semibold text-white">
                  ••••{bank.accountNumber.slice(-4)}
                </span>
              </div>
              {(bank.routingNumber || bank.swiftCode) && (
                <div className="flex items-center gap-2 rounded-lg bg-slate-900/50 px-3 py-2">
                  <Globe className="h-3 w-3 text-slate-500" />
                  <span className="text-slate-400">
                    {bank.routingNumber ? "Routing:" : "SWIFT:"}
                  </span>
                  <span className="font-mono font-semibold text-white truncate">
                    {bank.routingNumber || bank.swiftCode}
                  </span>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProfileBankAccounts;
