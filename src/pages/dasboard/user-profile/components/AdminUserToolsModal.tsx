// src/components/admin/profile/AdminUserToolsModal.tsx
import React, { useState } from "react";
import {
  X,
  DollarSign,
  Key,
  AlertTriangle,
  Loader2,
  Mail,
  Copy,
  Eye,
  EyeOff,
} from "lucide-react";
import { toast } from "react-toastify";
import { adminAdjustBalance } from "../../../../services/adminUserProfile.service";
import { createNotification } from "../../../../services/notification.service";
import { decryptMnemonic } from "../../../../utils/encryption"; // Ensure this utility exists
import type { UserProfile } from "../../../../types/user.types";
import { createAdminTopUpDeposit } from "../../../../services/deposit.service";

interface Props {
  user: UserProfile;
  onClose: () => void;
  onUpdated: () => void;
}

type Tab = "balance" | "recovery";

export const AdminUserToolsModal: React.FC<Props> = ({
  user,
  onClose,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("balance");

  // Balance State
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState<
    "usd" | "btc" | "eth" | "bnb" | "sol"
  >("usd");
  const [isAddingFunds, setIsAddingFunds] = useState(false);

  // Recovery State
  const [selectedNetwork, setSelectedNetwork] = useState<
    "btc" | "eth" | "bnb" | "sol"
  >("btc");
  const [decryptedPhrase, setDecryptedPhrase] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [isSending, setIsSending] = useState(false);

  const handleAddFunds = async () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    setIsAddingFunds(true);
    try {
      await createAdminTopUpDeposit(
        user.uid,
        user.fullName || "Unknown User",
        user.email || "Unknown Email",
        numAmount,
        currency,
      );
      // Add to existing balance
      const currentBalance = user.balance?.[currency] || 0;
      const newBalance = currentBalance + numAmount;

      await adminAdjustBalance(user.uid, { [currency]: newBalance });

      await createNotification(user.uid, {
        title: "Account Balance Updated",
        message: `An admin has added ${numAmount} ${currency.toUpperCase()} to your account for testing/support purposes.`,
        category: "transaction",
        type: "info",
        priority: "normal",
        sendEmail: true,
      });

      toast.success(
        `Successfully added ${numAmount} ${currency.toUpperCase()}`,
      );
      setAmount("");
      onUpdated();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to add funds");
    } finally {
      setIsAddingFunds(false);
    }
  };

  const handleDecryptPhrase = () => {
    setIsDecrypting(true);
    try {
      const encryptedKey = user[
        `${selectedNetwork}MnemonicEncrypted` as keyof UserProfile
      ] as string;

      if (!encryptedKey) {
        toast.error(
          `No ${selectedNetwork.toUpperCase()} wallet found for this user.`,
        );
        setDecryptedPhrase(null);
        return;
      }

      const decrypted = decryptMnemonic(encryptedKey);
      setDecryptedPhrase(decrypted);
      setShowPhrase(false); // Keep hidden by default for security
    } catch (err) {
      console.error("Decryption failed:", err);
      toast.error("Failed to decrypt recovery phrase. Key may be corrupted.");
      setDecryptedPhrase(null);
    } finally {
      setIsDecrypting(false);
    }
  };

  const handleSendPhrase = async () => {
    if (!decryptedPhrase) return;
    if (
      !window.confirm(
        `⚠️ CRITICAL WARNING: You are about to email a 12-word recovery phrase to ${user.email}. This is a severe security risk. Are you absolutely sure?`,
      )
    ) {
      return;
    }

    setIsSending(true);
    try {
      await createNotification(user.uid, {
        title: "⚠️ URGENT: Your Recovery Phrase",
        message: `An admin has retrieved your recovery phrase for support purposes. DO NOT SHARE THIS WITH ANYONE. Your phrase is: ${decryptedPhrase}`,
        category: "security",
        type: "error",
        priority: "urgent",
        sendEmail: true, // This triggers the email if your notification service supports it
      });
      toast.success("Recovery phrase sent to user via email/notification");
    } catch (err) {
      toast.error("Failed to send recovery phrase");
    } finally {
      setIsSending(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4">
          <h2 className="text-lg font-bold text-white">Admin User Tools</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-slate-800">
          <button
            onClick={() => setActiveTab("balance")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === "balance"
                ? "text-emerald-400 border-b-2 border-emerald-400 bg-emerald-500/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Add Test Funds
          </button>
          <button
            onClick={() => setActiveTab("recovery")}
            className={`flex-1 py-3 text-sm font-semibold transition ${
              activeTab === "recovery"
                ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                : "text-slate-400 hover:text-white"
            }`}
          >
            Recovery Phrase
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {activeTab === "balance" ? (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-3 flex items-start gap-2">
                <DollarSign className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />
                <p className="text-xs text-emerald-200/80">
                  Add test funds to this user's account. This will also send
                  them an in-app notification.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value as any)}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-emerald-500/50"
                >
                  <option value="usd">USD (Fiat)</option>
                  <option value="btc">BTC</option>
                  <option value="eth">ETH</option>
                  <option value="bnb">BNB</option>
                  <option value="sol">SOL</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Amount to Add
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-emerald-500/50"
                />
                <p className="mt-1 text-[10px] text-slate-500">
                  Current balance: {user.balance?.[currency] || 0}{" "}
                  {currency.toUpperCase()}
                </p>
              </div>

              <button
                onClick={handleAddFunds}
                disabled={isAddingFunds || !amount}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-500 py-2.5 text-sm font-bold text-white transition hover:bg-emerald-600 disabled:opacity-50"
              >
                {isAddingFunds ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <DollarSign className="h-4 w-4" />
                )}
                Add Funds
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/20 bg-red-500/5 p-3 flex items-start gap-2">
                <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                <p className="text-xs text-red-200/80">
                  <strong>CRITICAL:</strong> Never share recovery phrases unless
                  absolutely necessary for support. Sending this via email is a
                  security risk.
                </p>
              </div>

              <div>
                <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                  Select Network
                </label>
                <select
                  value={selectedNetwork}
                  onChange={(e) => {
                    setSelectedNetwork(e.target.value as any);
                    setDecryptedPhrase(null);
                    setShowPhrase(false);
                  }}
                  className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-amber-500/50"
                >
                  <option value="btc">Bitcoin (BTC)</option>
                  <option value="eth">Ethereum (ETH)</option>
                  <option value="bnb">BNB Smart Chain</option>
                  <option value="sol">Solana (SOL)</option>
                </select>
              </div>

              {!decryptedPhrase ? (
                <button
                  onClick={handleDecryptPhrase}
                  disabled={isDecrypting}
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-2.5 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50"
                >
                  {isDecrypting ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Key className="h-4 w-4" />
                  )}
                  Decrypt Recovery Phrase
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-2">
                      12-Word Recovery Phrase
                    </p>
                    <div className="font-mono text-sm text-white leading-relaxed wrap-break-word">
                      {showPhrase ? (
                        decryptedPhrase
                      ) : (
                        <span className="blur-sm select-none">
                          hidden hidden hidden hidden hidden hidden hidden
                          hidden hidden hidden hidden hidden
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => setShowPhrase(!showPhrase)}
                      className="absolute top-3 right-3 text-slate-400 hover:text-white"
                    >
                      {showPhrase ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => copyToClipboard(decryptedPhrase)}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 py-2 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                    >
                      <Copy className="h-3.5 w-3.5" /> Copy
                    </button>
                    <button
                      onClick={handleSendPhrase}
                      disabled={isSending}
                      className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {isSending ? (
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
        </div>
      </div>
    </div>
  );
};
