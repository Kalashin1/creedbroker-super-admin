// src/components/admin/profile/ProfileWallets.tsx
import React, { useState } from "react";
import {
  Wallet,
  Copy,
  Check,
  Bitcoin,
  CircleDollarSign,
  Hexagon,
  Sparkles,
} from "lucide-react";
import { toast } from "react-toastify";
import type { UserProfile } from "../../../../types/user.types";

interface Props {
  profile: UserProfile;
}

interface WalletInfo {
  id: "btc" | "eth" | "bnb" | "sol";
  name: string;
  symbol: string;
  icon: React.ReactNode;
  color: string;
  address: string;
  hasMnemonic: boolean;
}

export const ProfileWallets: React.FC<Props> = ({ profile }) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const wallets: WalletInfo[] = [
    {
      id: "btc",
      name: "Bitcoin",
      symbol: "BTC",
      icon: <Bitcoin className="h-5 w-5" />,
      color: "from-orange-500 to-amber-600",
      address: profile.btcAddress || "",
      hasMnemonic: !!profile.btcMnemonicEncrypted,
    },
    {
      id: "eth",
      name: "Ethereum",
      symbol: "ETH",
      icon: <CircleDollarSign className="h-5 w-5" />,
      color: "from-indigo-500 to-purple-600",
      address: profile.ethAddress || "",
      hasMnemonic: !!profile.ethMnemonicEncrypted,
    },
    {
      id: "bnb",
      name: "BNB Chain",
      symbol: "BNB",
      icon: <Hexagon className="h-5 w-5" />,
      color: "from-yellow-500 to-amber-500",
      address: profile.bnbAddress || "",
      hasMnemonic: !!profile.bnbMnemonicEncrypted,
    },
    {
      id: "sol",
      name: "Solana",
      symbol: "SOL",
      icon: <Sparkles className="h-5 w-5" />,
      color: "from-purple-500 to-pink-500",
      address: profile.solAddress || "",
      hasMnemonic: !!profile.solMnemonicEncrypted,
    },
  ];

  const handleCopy = async (address: string, id: string) => {
    try {
      await navigator.clipboard.writeText(address);
      setCopiedId(id);
      toast.success(`${id.toUpperCase()} address copied!`);
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      toast.error("Failed to copy");
    }
  };

  const shortenAddress = (addr: string) => {
    if (!addr || addr.length <= 10) return addr || "—";
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  return (
    <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6">
      <div className="flex items-center gap-2 mb-4">
        <Wallet className="h-5 w-5 text-cyan-400" />
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Wallet Addresses
        </h3>
      </div>

      <div className="space-y-3">
        {wallets.map((wallet) => {
          if (!wallet.address) return null;

          return (
            <div
              key={wallet.id}
              className="rounded-xl border border-slate-800 bg-slate-950/50 p-4"
            >
              <div className="flex items-center gap-3 mb-2">
                <div
                  className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${wallet.color} text-white`}
                >
                  {wallet.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-semibold text-white">
                      {wallet.name}
                    </h4>
                    <span className="text-[10px] font-semibold text-slate-500 uppercase">
                      {wallet.symbol}
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    {wallet.hasMnemonic ? (
                      <span className="text-emerald-400">
                        ✓ Recovery phrase stored
                      </span>
                    ) : (
                      <span className="text-amber-400">
                        ⚠ No recovery phrase
                      </span>
                    )}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2 rounded-lg bg-slate-900/80 border border-slate-800 px-3 py-2">
                <span className="flex-1 font-mono text-xs text-slate-300 truncate">
                  {shortenAddress(wallet.address)}
                </span>
                <button
                  onClick={() => handleCopy(wallet.address, wallet.id)}
                  className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md text-slate-400 hover:bg-slate-800 hover:text-emerald-400 transition"
                  title="Copy address"
                >
                  {copiedId === wallet.id ? (
                    <Check className="h-3.5 w-3.5 text-emerald-400" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </button>
              </div>
            </div>
          );
        })}

        {wallets.every((w) => !w.address) && (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <Wallet className="h-10 w-10 text-slate-600 mb-2" />
            <p className="text-sm text-slate-400">No wallets generated yet</p>
            <p className="text-xs text-slate-500 mt-1">
              User needs to generate wallets from their dashboard
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
