// src/components/admin/wallets/UserWalletModal.tsx
import React, { useState } from "react";
import {
  X,
  DollarSign,
  Key,
  Copy,
  Eye,
  EyeOff,
  Loader2,
  RefreshCw,
  Lock,
  Unlock,
  AlertTriangle,
  Mail,
} from "lucide-react";
import { toast } from "react-toastify";
import { createAdminTopUpDeposit } from "../../../../services/deposit.service";
import { createNotification } from "../../../../services/notification.service";
import {
  adminGenerateWallet,
  toggleWalletFreeze,
} from "../../../../services/adminwallets.service";
import { decryptMnemonic } from "../../../../utils/encryption";
import type { UserProfile } from "../../../../types/user.types";
import { adminAdjustBalance } from "../../../../services/adminUserProfile.service";

interface Props {
  user: UserProfile;
  onClose: () => void;
  onUpdated: () => void;
}

type Tab = "usd" | "btc" | "eth" | "bnb" | "sol";

export const UserWalletModal: React.FC<Props> = ({
  user,
  onClose,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("usd");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const [topUpAmount, setTopUpAmount] = useState("");
  const [decryptedPhrase, setDecryptedPhrase] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);

  const networks: { id: Tab; label: string; symbol: string }[] = [
    { id: "usd", label: "USD (Fiat)", symbol: "USD" },
    { id: "btc", label: "Bitcoin", symbol: "BTC" },
    { id: "eth", label: "Ethereum", symbol: "ETH" },
    { id: "bnb", label: "BNB Chain", symbol: "BNB" },
    { id: "sol", label: "Solana", symbol: "SOL" },
  ];

  const currentAddress = user[`${activeTab}Address` as keyof UserProfile] as
    | string
    | undefined;
  const isFrozen = (user.frozenWallets || []).includes(activeTab);
  const currentBalance = (user.balance?.[activeTab] as number) || 0;

  const handleTopUp = async () => {
    const numAmount = parseFloat(topUpAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setIsProcessing("topUp");
    try {
      if (activeTab !== "usd") {
        await createAdminTopUpDeposit(
          user.uid,
          user.fullName,
          user.email,
          numAmount,
          activeTab.toUpperCase(),
        );
      }

      await adminAdjustBalance(user.uid, {
        [activeTab]: currentBalance + numAmount,
      });

      await createNotification(user.uid, {
        title: "Wallet Top-Up",
        message: `An admin has added ${numAmount} ${activeTab.toUpperCase()} to your wallet.`,
        category: "transaction",
        type: "info",
        priority: "normal",
        sendEmail: true,
      });

      toast.success(
        `Successfully added ${numAmount} ${activeTab.toUpperCase()}`,
      );
      setTopUpAmount("");
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to top up");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleGenerateWallet = async () => {
    if (
      !window.confirm(
        `Generate a new ${activeTab.toUpperCase()} wallet? This will overwrite any existing address.`,
      )
    )
      return;
    setIsProcessing("generate");
    try {
      // @ts-ignore
      await adminGenerateWallet(user.uid, activeTab);
      toast.success(`${activeTab.toUpperCase()} wallet generated successfully`);
      onUpdated();
    } catch (err: any) {
      toast.error(err.message || "Failed to generate wallet");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleDecryptPhrase = () => {
    setIsProcessing("decrypt");
    try {
      const encryptedKey = user[
        `${activeTab}MnemonicEncrypted` as keyof UserProfile
      ] as string;
      if (!encryptedKey) {
        toast.error("No encrypted phrase found for this wallet.");
        return;
      }
      setDecryptedPhrase(decryptMnemonic(encryptedKey));
      setShowPhrase(false);
    } catch (err) {
      toast.error("Failed to decrypt recovery phrase.");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleSendPhrase = async () => {
    if (!decryptedPhrase) return;
    if (
      !window.confirm(
        `⚠️ CRITICAL: Emailing a 12-word phrase to ${user.email} is a severe security risk. Proceed?`,
      )
    )
      return;

    setIsProcessing("sendPhrase");
    try {
      await createNotification(user.uid, {
        title: "⚠️ URGENT: Your Recovery Phrase",
        message: `An admin has retrieved your recovery phrase for support. DO NOT SHARE THIS. Phrase: ${decryptedPhrase}`,
        category: "security",
        type: "error",
        priority: "urgent",
        sendEmail: true,
      });
      toast.success("Recovery phrase sent to user");
    } catch (err) {
      toast.error("Failed to send recovery phrase");
    } finally {
      setIsProcessing(null);
    }
  };

  const handleToggleFreeze = async () => {
    setIsProcessing("freeze");
    try {
      await toggleWalletFreeze(user.uid, activeTab, !isFrozen);
      toast.success(`Wallet ${!isFrozen ? "frozen" : "unfrozen"}`);
      onUpdated();
    } catch (err) {
      toast.error("Failed to update wallet status");
    } finally {
      setIsProcessing(null);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-2xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 shrink-0">
          <div>
            <h2 className="text-lg font-bold text-white">
              Manage User Wallets
            </h2>
            <p className="text-xs text-slate-400">
              {user.fullName} • {user.email}
            </p>
          </div>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800 overflow-x-auto shrink-0 custom-scroll">
          {networks.map((net) => (
            <button
              key={net.id}
              onClick={() => {
                setActiveTab(net.id);
                setDecryptedPhrase(null);
                setShowPhrase(false);
                setTopUpAmount("");
              }}
              className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition whitespace-nowrap ${
                activeTab === net.id
                  ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5"
                  : "text-slate-400 hover:text-white"
              }`}
            >
              {net.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scroll space-y-6">
          {/* Balance Display */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4 flex items-center justify-between">
            <div>
              <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                Current Balance
              </p>
              <p className="text-2xl font-bold text-white tabular-nums">
                {currentBalance.toLocaleString(undefined, {
                  maximumFractionDigits: 6,
                })}{" "}
                <span className="text-sm text-slate-400">
                  {activeTab.toUpperCase()}
                </span>
              </p>
            </div>
            {activeTab !== "usd" && (
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-semibold ${
                  isFrozen
                    ? "bg-red-500/10 text-red-400 border-red-500/20"
                    : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                }`}
              >
                {isFrozen ? (
                  <Lock className="h-3.5 w-3.5" />
                ) : (
                  <Unlock className="h-3.5 w-3.5" />
                )}
                {isFrozen ? "Frozen" : "Active"}
              </span>
            )}
          </div>

          {/* Crypto Specific Actions */}
          {activeTab !== "usd" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                  Wallet Address
                </p>
                {currentAddress ? (
                  <div className="flex items-center gap-2">
                    <p className="flex-1 font-mono text-xs text-white break-all">
                      {currentAddress}
                    </p>
                    <button
                      onClick={() => copyToClipboard(currentAddress)}
                      className="shrink-0 text-slate-400 hover:text-white transition"
                    >
                      <Copy className="h-4 w-4" />
                    </button>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">
                    No wallet generated yet.
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={
                    currentAddress ? handleDecryptPhrase : handleGenerateWallet
                  }
                  disabled={
                    isProcessing === "decrypt" || isProcessing === "generate"
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800 disabled:opacity-50"
                >
                  {isProcessing === "decrypt" || isProcessing === "generate" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : currentAddress ? (
                    <Key className="h-3.5 w-3.5" />
                  ) : (
                    <RefreshCw className="h-3.5 w-3.5" />
                  )}
                  {currentAddress
                    ? "View 12-Word Phrase"
                    : "Generate New Wallet"}
                </button>

                <button
                  onClick={handleToggleFreeze}
                  disabled={isProcessing === "freeze"}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl py-2.5 text-xs font-semibold transition disabled:opacity-50 ${
                    isFrozen
                      ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20"
                      : "bg-red-500/10 border border-red-500/20 text-red-400 hover:bg-red-500/20"
                  }`}
                >
                  {isProcessing === "freeze" ? (
                    <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  ) : isFrozen ? (
                    <Unlock className="h-3.5 w-3.5" />
                  ) : (
                    <Lock className="h-3.5 w-3.5" />
                  )}
                  {isFrozen ? "Unfreeze Wallet" : "Freeze Wallet"}
                </button>
              </div>

              {/* Recovery Phrase Display */}
              {decryptedPhrase && (
                <div className="space-y-3 rounded-xl border border-amber-500/30 bg-amber-500/5 p-4">
                  <div className="flex items-center justify-between">
                    <p className="text-[10px] text-amber-400 uppercase tracking-wider font-semibold">
                      12-Word Recovery Phrase
                    </p>
                    <button
                      onClick={() => setShowPhrase(!showPhrase)}
                      className="text-amber-400 hover:text-amber-300 transition"
                    >
                      {showPhrase ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>
                  <div className="font-mono text-sm text-white leading-relaxed break-words min-h-[60px]">
                    {showPhrase ? (
                      decryptedPhrase
                    ) : (
                      <span className="blur-sm select-none">
                        hidden hidden hidden hidden hidden hidden hidden hidden
                        hidden hidden hidden hidden
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(decryptedPhrase)}
                      className="flex-1 rounded-lg bg-slate-800/60 py-2 text-xs font-semibold text-slate-300 hover:bg-slate-800 transition flex items-center justify-center gap-1.5"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button
                      onClick={handleSendPhrase}
                      disabled={isProcessing === "sendPhrase"}
                      className="flex-1 rounded-lg bg-red-500 py-2 text-xs font-bold text-white hover:bg-red-600 transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                    >
                      {isProcessing === "sendPhrase" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      Email to User
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Top Up Section */}
          <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
              Top Up Wallet
            </p>
            <div className="flex gap-2 mb-3">
              <input
                type="number"
                value={topUpAmount}
                onChange={(e) => setTopUpAmount(e.target.value)}
                placeholder={`Amount in ${activeTab.toUpperCase()}`}
                className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 px-4 text-sm text-white outline-none focus:border-emerald-500/50"
              />
              <button
                onClick={handleTopUp}
                disabled={isProcessing === "topUp" || !topUpAmount}
                className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50 flex items-center gap-2"
              >
                {isProcessing === "topUp" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                Top Up
              </button>
            </div>
            <div className="flex gap-2">
              {[10, 50, 100, 500].map((amt) => (
                <button
                  key={amt}
                  onClick={() => setTopUpAmount(amt.toString())}
                  className="flex-1 rounded-lg bg-slate-800/60 border border-slate-700 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition"
                >
                  +{amt}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
