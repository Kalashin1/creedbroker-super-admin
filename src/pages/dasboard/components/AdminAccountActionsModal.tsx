// src/components/admin/profile/AdminAccountActionsModal.tsx
import React, { useState } from "react";
import {
  X,
  Shield,
  Mail,
  MailCheck,
  UserCheck,
  FileCheck,
  AlertTriangle,
  Ban,
  Unlock,
  Loader2,
  CheckCircle2,
  XCircle,
  RotateCcw,
  Trash2,
  RefreshCw,
  DollarSign,
  Key,
  Eye,
  EyeOff,
  Copy,
} from "lucide-react";
import { toast } from "react-toastify";
import { createNotification } from "../../../services/notification.service";
import {
  updateUserStatus,
  updateUserKYC,
} from "../../../services/admin.service";
import {
  adminVerifyEmail,
  adminMarkProfileComplete,
  adminReactivateAccount,
  adminResetKYC,
} from "../../../services/admin.service";
import { createAdminTopUpDeposit } from "../../../services/deposit.service";
import { decryptMnemonic } from "../../../utils/encryption";
import type { UserProfile } from "../../../types/user.types";
import { adminAdjustBalance } from "../../../services/adminUserProfile.service";

interface Props {
  user: UserProfile;
  onClose: () => void;
  onUpdated: () => void;
}

type Tab =
  | "status"
  | "email"
  | "profile"
  | "kyc"
  | "balance"
  | "recovery"
  | "danger";

export const AdminAccountActionsModal: React.FC<Props> = ({
  user,
  onClose,
  onUpdated,
}) => {
  const [activeTab, setActiveTab] = useState<Tab>("status");
  const [isProcessing, setIsProcessing] = useState<string | null>(null);

  // ─── Balance State ───
  const [topUpAmount, setTopUpAmount] = useState("");
  const [topUpCurrency, setTopUpCurrency] = useState<
    "usd" | "btc" | "eth" | "bnb" | "sol"
  >("usd");

  const handleDecryptPhrase = () => {
    setIsProcessing("decrypt");
    try {
      // 🆕 Map network to exact field name from UserProfile type
      const fieldMap: Record<string, keyof UserProfile> = {
        btc: "btcMnemonicEncrypted",
        eth: "ethMnemonicEncrypted",
        bnb: "bnbMnemonicEncrypted",
        sol: "solMnemonicEncrypted",
      };

      const fieldName = fieldMap[selectedNetwork];
      const encryptedKey = user[fieldName] as string | undefined;

      if (!encryptedKey) {
        toast.error(
          `No ${selectedNetwork.toUpperCase()} wallet found for this user.`,
        );
        setDecryptedPhrase(null);
        return;
      }

      const decrypted = decryptMnemonic(encryptedKey);
      setDecryptedPhrase(decrypted);
      setShowPhrase(false);
    } catch (err) {
      console.error("Decryption failed:", err);
      toast.error("Failed to decrypt recovery phrase. Key may be corrupted.");
      setDecryptedPhrase(null);
    } finally {
      setIsProcessing(null);
    }
  };

  // ─── Recovery State ───
  const [selectedNetwork, setSelectedNetwork] = useState<
    "btc" | "eth" | "bnb" | "sol"
  >("btc");
  const [decryptedPhrase, setDecryptedPhrase] = useState<string | null>(null);
  const [showPhrase, setShowPhrase] = useState(false);

  const runAction = async (
    actionKey: string,
    action: () => Promise<void>,
    successMessage: string,
  ) => {
    setIsProcessing(actionKey);
    try {
      await action();
      toast.success(successMessage);
      onUpdated();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Action failed");
    } finally {
      setIsProcessing(null);
    }
  };

  // ─── Balance Top-Up Handler ───
  const handleTopUp = async () => {
    const numAmount = parseFloat(topUpAmount);
    if (isNaN(numAmount) || numAmount <= 0) {
      toast.error("Please enter a valid amount greater than 0");
      return;
    }

    if (
      !window.confirm(
        `Add ${numAmount} ${topUpCurrency.toUpperCase()} to ${user.fullName}'s account?`,
      )
    ) {
      return;
    }

    setIsProcessing("topUp");
    try {
      // 1. Create audit trail deposit record
      await createAdminTopUpDeposit(
        user.uid,
        user.fullName || "Unknown User",
        user.email || "Unknown Email",
        numAmount,
        topUpCurrency,
      );

      // 2. Add to existing balance
      const currentBalance = (user.balance?.[topUpCurrency] as number) || 0;
      const newBalance = currentBalance + numAmount;
      await adminAdjustBalance(user.uid, { [topUpCurrency]: newBalance });

      // 3. Notify user
      await createNotification(user.uid, {
        title: "Account Balance Updated",
        message: `An admin has added ${numAmount} ${topUpCurrency.toUpperCase()} to your account for testing/support purposes.`,
        category: "transaction",
        type: "info",
        priority: "normal",
        sendEmail: true,
      });

      toast.success(
        `Successfully added ${numAmount} ${topUpCurrency.toUpperCase()}`,
      );
      setTopUpAmount("");
      onUpdated();
    } catch (err: any) {
      console.error("Top-up error:", err);
      toast.error(err.message || "Failed to add funds");
    } finally {
      setIsProcessing(null);
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

    setIsProcessing("sendPhrase");
    try {
      await createNotification(user.uid, {
        title: "⚠️ URGENT: Your Recovery Phrase",
        message: `An admin has retrieved your recovery phrase for support purposes. DO NOT SHARE THIS WITH ANYONE. Your phrase is: ${decryptedPhrase}`,
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

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Copied to clipboard");
  };

  const ActionButton = ({
    onClick,
    icon: Icon,
    label,
    description,
    color,
    loadingKey,
    disabled = false,
  }: {
    onClick: () => void;
    icon: React.ElementType;
    label: string;
    description: string;
    color: "emerald" | "red" | "amber" | "cyan" | "violet" | "slate";
    loadingKey: string;
    disabled?: boolean;
  }) => {
    const isLoading = isProcessing === loadingKey;
    const colorMap = {
      emerald:
        "bg-emerald-500/10 border-emerald-500/20 text-emerald-400 hover:bg-emerald-500/20",
      red: "bg-red-500/10 border-red-500/20 text-red-400 hover:bg-red-500/20",
      amber:
        "bg-amber-500/10 border-amber-500/20 text-amber-400 hover:bg-amber-500/20",
      cyan: "bg-cyan-500/10 border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20",
      violet:
        "bg-violet-500/10 border-violet-500/20 text-violet-400 hover:bg-violet-500/20",
      slate:
        "bg-slate-800/60 border-slate-700 text-slate-300 hover:bg-slate-800",
    };

    return (
      <button
        onClick={onClick}
        disabled={isLoading || disabled}
        className={`flex w-full items-center gap-3 rounded-xl border p-3 text-left transition disabled:opacity-50 disabled:cursor-not-allowed ${colorMap[color]}`}
      >
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-950/50">
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Icon className="h-4 w-4" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">{label}</p>
          <p className="text-[11px] opacity-70 mt-0.5">{description}</p>
        </div>
      </button>
    );
  };

  const tabs: { id: Tab; label: string; icon: React.ElementType }[] = [
    { id: "status", label: "Status", icon: Shield },
    { id: "email", label: "Email", icon: Mail },
    { id: "profile", label: "Profile", icon: UserCheck },
    { id: "kyc", label: "KYC", icon: FileCheck },
    { id: "balance", label: "Balance", icon: DollarSign },
    { id: "recovery", label: "Recovery", icon: Key },
    { id: "danger", label: "Danger", icon: AlertTriangle },
  ];

  // Network info for recovery tab
  // const networks = [
  //   { id: "btc" as const, label: "Bitcoin", fullName: "BTC Wallet" },
  //   { id: "eth" as const, label: "Ethereum", fullName: "ETH Wallet" },
  //   { id: "bnb" as const, label: "BNB Chain", fullName: "BNB Wallet" },
  //   { id: "sol" as const, label: "Solana", fullName: "SOL Wallet" },
  // ];

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 px-6 py-4 shrink-0">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-brrom-amber-500/20 to-orange-500/20 border border-amber-500/20">
              <Shield className="h-5 w-5 text-amber-400" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Account Management
              </h2>
              <p className="text-xs text-slate-400">
                {user.fullName} • {user.email}
              </p>
            </div>
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
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  // Reset recovery state when switching tabs
                  if (tab.id !== "recovery") {
                    setDecryptedPhrase(null);
                    setShowPhrase(false);
                  }
                }}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-semibold transition whitespace-nowrap ${
                  isActive
                    ? "text-amber-400 border-b-2 border-amber-400 bg-amber-500/5"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                <Icon className="h-3.5 w-3.5" />
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 custom-scroll">
          {/* ─── BALANCE TAB ─── */}
          {activeTab === "balance" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 flex items-start gap-3">
                <DollarSign className="h-5 w-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Add Test Funds
                  </p>
                  <p className="text-xs text-emerald-200/80 mt-1">
                    Top up the user's balance. A deposit record will be created
                    and the user will be notified.
                  </p>
                </div>
              </div>

              {/* Current balances display */}
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-3">
                  Current Balances
                </p>
                <div className="grid grid-cols-5 gap-2">
                  {(["usd", "btc", "eth", "bnb", "sol"] as const).map(
                    (currency) => (
                      <div
                        key={currency}
                        className="rounded-lg bg-slate-900/50 border border-slate-800 p-2 text-center"
                      >
                        <p className="text-[9px] text-slate-500 uppercase">
                          {currency}
                        </p>
                        <p className="text-xs font-bold text-white tabular-nums">
                          {(user.balance?.[currency] || 0).toLocaleString(
                            undefined,
                            { maximumFractionDigits: 6 },
                          )}
                        </p>
                      </div>
                    ),
                  )}
                </div>
              </div>

              {/* Top-up form */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                    Currency
                  </label>
                  <select
                    value={topUpCurrency}
                    onChange={(e) => setTopUpCurrency(e.target.value as any)}
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
                    Amount
                  </label>
                  <input
                    type="number"
                    value={topUpAmount}
                    onChange={(e) => setTopUpAmount(e.target.value)}
                    placeholder="0.00"
                    className="w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none focus:border-emerald-500/50"
                  />
                </div>
              </div>

              {/* Quick amount buttons */}
              <div className="flex gap-2">
                {[100, 500, 1000, 5000, 10000].map((amt) => (
                  <button
                    key={amt}
                    onClick={() => setTopUpAmount(amt.toString())}
                    className="flex-1 rounded-lg bg-slate-800/60 border border-slate-700 py-1.5 text-xs font-semibold text-slate-300 hover:bg-slate-800 hover:text-emerald-400 transition"
                  >
                    ${amt.toLocaleString()}
                  </button>
                ))}
              </div>

              <button
                onClick={handleTopUp}
                disabled={isProcessing === "topUp" || !topUpAmount}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 py-3 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isProcessing === "topUp" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Processing...
                  </>
                ) : (
                  <>
                    <DollarSign className="h-4 w-4" />
                    Add Funds
                  </>
                )}
              </button>
            </div>
          )}

          {/* ─── RECOVERY PHRASE TAB ─── */}
          {/* ─── RECOVERY PHRASE TAB ─── */}
          {activeTab === "recovery" && (
            <div className="space-y-4">
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 flex items-start gap-3">
                <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Critical Security Action
                  </p>
                  <p className="text-xs text-red-200/80 mt-1">
                    Recovery phrases grant full control over the user's wallet.
                    Never share these outside of verified support scenarios. All
                    actions are logged.
                  </p>
                </div>
              </div>

              {/* Network selector with addresses */}
              <div>
                <label className="mb-2 block text-xs font-semibold text-slate-300">
                  Select Wallet Network
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    {
                      id: "btc" as const,
                      label: "Bitcoin",
                      fullName: "BTC Wallet",
                      address: user.btcAddress,
                      hasMnemonic: !!user.btcMnemonicEncrypted,
                    },
                    {
                      id: "eth" as const,
                      label: "Ethereum",
                      fullName: "ETH Wallet",
                      address: user.ethAddress,
                      hasMnemonic: !!user.ethMnemonicEncrypted,
                    },
                    {
                      id: "bnb" as const,
                      label: "BNB Chain",
                      fullName: "BNB Wallet",
                      address: user.bnbAddress,
                      hasMnemonic: !!user.bnbMnemonicEncrypted,
                    },
                    {
                      id: "sol" as const,
                      label: "Solana",
                      fullName: "SOL Wallet",
                      address: user.solAddress,
                      hasMnemonic: !!user.solMnemonicEncrypted,
                    },
                  ].map((net) => {
                    const hasWallet = !!net.address;
                    const isSelected = selectedNetwork === net.id;
                    return (
                      <button
                        key={net.id}
                        onClick={() => {
                          setSelectedNetwork(net.id);
                          setDecryptedPhrase(null);
                          setShowPhrase(false);
                        }}
                        disabled={!hasWallet}
                        className={`rounded-xl border p-3 text-left transition ${
                          isSelected
                            ? "border-amber-500/50 bg-amber-500/10"
                            : "border-slate-800 bg-slate-950/50 hover:border-slate-700"
                        } ${!hasWallet ? "opacity-40 cursor-not-allowed" : "cursor-pointer"}`}
                      >
                        <div className="flex items-center justify-between mb-1">
                          <p className="text-xs font-bold text-white">
                            {net.label}
                          </p>
                          <span
                            className={`text-[9px] px-1.5 py-0.5 rounded ${
                              hasWallet
                                ? "bg-emerald-500/20 text-emerald-400"
                                : "bg-slate-700 text-slate-500"
                            }`}
                          >
                            {hasWallet ? "ACTIVE" : "NONE"}
                          </span>
                        </div>
                        {hasWallet && net.address && (
                          <p
                            className="text-[10px] text-slate-400 font-mono truncate"
                            title={net.address}
                          >
                            {net.address.slice(0, 8)}...{net.address.slice(-6)}
                          </p>
                        )}
                        {!hasWallet && (
                          <p className="text-[10px] text-slate-600 italic">
                            No wallet
                          </p>
                        )}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Show current wallet address */}
              {(() => {
                const currentAddress = user[
                  `${selectedNetwork}Address` as keyof UserProfile
                ] as string | undefined;
                return currentAddress ? (
                  <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3">
                    <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
                      {selectedNetwork.toUpperCase()} Wallet Address
                    </p>
                    <div className="flex items-center gap-2">
                      <p className="flex-1 font-mono text-xs text-white break-all">
                        {currentAddress}
                      </p>
                      <button
                        onClick={() => copyToClipboard(currentAddress)}
                        className="shrink-0 flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ) : null;
              })()}

              {/* Decrypt button or phrase display */}
              {!decryptedPhrase ? (
                <button
                  onClick={handleDecryptPhrase}
                  disabled={
                    isProcessing === "decrypt" ||
                    !user[
                      `${selectedNetwork}MnemonicEncrypted` as keyof UserProfile
                    ]
                  }
                  className="w-full inline-flex items-center justify-center gap-2 rounded-xl border border-amber-500/30 bg-amber-500/10 py-3 text-sm font-semibold text-amber-400 transition hover:bg-amber-500/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isProcessing === "decrypt" ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Decrypting...
                    </>
                  ) : (
                    <>
                      <Key className="h-4 w-4" />
                      Decrypt {selectedNetwork.toUpperCase()} Recovery Phrase
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="relative rounded-xl border border-slate-800 bg-slate-950/50 p-4">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-[10px] text-slate-500 uppercase tracking-wider">
                        {selectedNetwork.toUpperCase()} 12-Word Recovery Phrase
                      </p>
                      <button
                        onClick={() => setShowPhrase(!showPhrase)}
                        className="flex items-center gap-1 text-xs text-slate-400 hover:text-white transition"
                      >
                        {showPhrase ? (
                          <EyeOff className="h-3.5 w-3.5" />
                        ) : (
                          <Eye className="h-3.5 w-3.5" />
                        )}
                        {showPhrase ? "Hide" : "Show"}
                      </button>
                    </div>
                    <div className="font-mono text-sm text-white leading-relaxed wrap-break-word min-h-20">
                      {showPhrase ? (
                        decryptedPhrase
                      ) : (
                        <span className="blur-sm select-none">
                          hidden hidden hidden hidden hidden hidden hidden
                          hidden hidden hidden hidden hidden
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => copyToClipboard(decryptedPhrase)}
                      className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-800/50 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
                    >
                      <Copy className="h-3.5 w-3.5" />
                      Copy Phrase
                    </button>
                    <button
                      onClick={handleSendPhrase}
                      disabled={isProcessing === "sendPhrase"}
                      className="inline-flex items-center justify-center gap-2 rounded-xl bg-red-500 py-2.5 text-xs font-bold text-white transition hover:bg-red-600 disabled:opacity-50"
                    >
                      {isProcessing === "sendPhrase" ? (
                        <Loader2 className="h-3.5 w-3.5 animate-spin" />
                      ) : (
                        <Mail className="h-3.5 w-3.5" />
                      )}
                      Email to User
                    </button>
                  </div>

                  <button
                    onClick={() => {
                      setDecryptedPhrase(null);
                      setShowPhrase(false);
                    }}
                    className="w-full text-xs text-slate-500 hover:text-slate-300 transition py-2"
                  >
                    ← Hide phrase and return
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ─── STATUS TAB ─── */}
          {activeTab === "status" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 mb-4">
                <p className="text-xs text-slate-400">
                  Current status:{" "}
                  <span
                    className={`font-semibold ${
                      user.accountStatus === "active"
                        ? "text-emerald-400"
                        : user.accountStatus === "restricted"
                          ? "text-amber-400"
                          : user.accountStatus === "blocked"
                            ? "text-red-400"
                            : "text-slate-400"
                    }`}
                  >
                    {user.accountStatus?.toUpperCase() || "ACTIVE"}
                  </span>
                </p>
              </div>

              <ActionButton
                onClick={() =>
                  runAction(
                    "activate",
                    async () => {
                      await updateUserStatus(user.uid, "active");
                      await createNotification(user.uid, {
                        title: "Account Activated",
                        message:
                          "Your account has been fully activated. All features are now available.",
                        category: "account",
                        type: "success",
                        priority: "high",
                        sendEmail: true,
                      });
                    },
                    "Account activated",
                  )
                }
                icon={CheckCircle2}
                label="Activate Account"
                description="Restore full access to all platform features"
                color="emerald"
                loadingKey="activate"
                disabled={user.accountStatus === "active"}
              />

              <ActionButton
                onClick={() => {
                  if (
                    !window.confirm(
                      "Restrict this account? The user will have limited access.",
                    )
                  )
                    return;
                  runAction(
                    "restrict",
                    async () => {
                      await updateUserStatus(user.uid, "restricted");
                      await createNotification(user.uid, {
                        title: "Account Restricted",
                        message:
                          "Your account has been temporarily restricted. Some features are unavailable.",
                        category: "security",
                        type: "warning",
                        priority: "high",
                        sendEmail: true,
                      });
                    },
                    "Account restricted",
                  );
                }}
                icon={AlertTriangle}
                label="Restrict Account"
                description="Limit access to withdrawals and trading"
                color="amber"
                loadingKey="restrict"
                disabled={user.accountStatus === "restricted"}
              />

              <ActionButton
                onClick={() => {
                  if (
                    !window.confirm(
                      "Block this account? The user will be unable to log in.",
                    )
                  )
                    return;
                  runAction(
                    "block",
                    async () => {
                      await updateUserStatus(user.uid, "blocked");
                      await createNotification(user.uid, {
                        title: "Account Blocked",
                        message:
                          "Your account has been blocked. Contact support for assistance.",
                        category: "security",
                        type: "error",
                        priority: "urgent",
                        sendEmail: true,
                      });
                    },
                    "Account blocked",
                  );
                }}
                icon={Ban}
                label="Block Account"
                description="Prevent the user from logging in entirely"
                color="red"
                loadingKey="block"
                disabled={user.accountStatus === "blocked"}
              />
            </div>
          )}

          {/* ─── EMAIL TAB ─── */}
          {activeTab === "email" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 mb-4">
                <p className="text-xs text-slate-400">
                  Email verification status:{" "}
                  <span
                    className={`font-semibold ${user.emailVerified ? "text-emerald-400" : "text-red-400"}`}
                  >
                    {user.emailVerified ? "VERIFIED" : "NOT VERIFIED"}
                  </span>
                </p>
              </div>

              <ActionButton
                onClick={() =>
                  runAction(
                    "verifyEmail",
                    async () => {
                      await adminVerifyEmail(user.uid);
                      await createNotification(user.uid, {
                        title: "Email Verified",
                        message:
                          "An admin has manually verified your email address.",
                        category: "account",
                        type: "success",
                        priority: "normal",
                        sendEmail: true,
                      });
                    },
                    "Email verified",
                  )
                }
                icon={MailCheck}
                label="Verify Email"
                description="Manually mark this user's email as verified"
                color="emerald"
                loadingKey="verifyEmail"
                disabled={user.emailVerified}
              />
            </div>
          )}

          {/* ─── PROFILE TAB ─── */}
          {activeTab === "profile" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 mb-4">
                <p className="text-xs text-slate-400">
                  Profile completion status:{" "}
                  <span
                    className={`font-semibold ${user.profileComplete ? "text-emerald-400" : "text-amber-400"}`}
                  >
                    {user.profileComplete ? "COMPLETE" : "INCOMPLETE"}
                  </span>
                </p>
              </div>

              <ActionButton
                onClick={() =>
                  runAction(
                    "markComplete",
                    async () => {
                      await adminMarkProfileComplete(user.uid, true);
                      await createNotification(user.uid, {
                        title: "Profile Approved",
                        message:
                          "An admin has marked your profile as complete.",
                        category: "account",
                        type: "success",
                        priority: "normal",
                      });
                    },
                    "Profile marked complete",
                  )
                }
                icon={UserCheck}
                label="Mark Profile Complete"
                description="Allow the user to access all platform features"
                color="emerald"
                loadingKey="markComplete"
                disabled={user.profileComplete}
              />

              <ActionButton
                onClick={() =>
                  runAction(
                    "markIncomplete",
                    async () => {
                      await adminMarkProfileComplete(user.uid, false);
                      await createNotification(user.uid, {
                        title: "Profile Review Required",
                        message:
                          "Please review and update your profile information.",
                        category: "account",
                        type: "warning",
                        priority: "normal",
                        actionUrl: "/dashboard/profile",
                      });
                    },
                    "Profile marked incomplete",
                  )
                }
                icon={RefreshCw}
                label="Mark Profile Incomplete"
                description="Force the user to complete their profile again"
                color="amber"
                loadingKey="markIncomplete"
                disabled={!user.profileComplete}
              />
            </div>
          )}

          {/* ─── KYC TAB ─── */}
          {activeTab === "kyc" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-3 mb-4">
                <p className="text-xs text-slate-400">
                  KYC status:{" "}
                  <span
                    className={`font-semibold ${
                      user.kycStatus === "verified"
                        ? "text-emerald-400"
                        : user.kycStatus === "pending"
                          ? "text-amber-400"
                          : user.kycStatus === "rejected"
                            ? "text-red-400"
                            : "text-slate-400"
                    }`}
                  >
                    {user.kycStatus?.toUpperCase() || "NONE"}
                  </span>
                </p>
              </div>

              <ActionButton
                onClick={() => {
                  if (
                    !window.confirm(
                      "Verify this user's KYC? They will gain full platform access.",
                    )
                  )
                    return;
                  runAction(
                    "verifyKYC",
                    async () => {
                      await updateUserKYC(user.uid, "verified");
                      await createNotification(user.uid, {
                        title: "KYC Approved",
                        message:
                          "Your identity has been verified. You now have full access to all features.",
                        category: "account",
                        type: "success",
                        priority: "high",
                        actionUrl: "/dashboard/profile",
                        sendEmail: true,
                      });
                    },
                    "KYC verified",
                  );
                }}
                icon={CheckCircle2}
                label="Verify KYC"
                description="Approve the user's identity verification"
                color="emerald"
                loadingKey="verifyKYC"
                disabled={user.kycStatus === "verified"}
              />

              <ActionButton
                onClick={() => {
                  const reason = prompt(
                    "Reason for rejection (shown to user):",
                  );
                  if (reason === null) return;
                  runAction(
                    "rejectKYC",
                    async () => {
                      await updateUserKYC(user.uid, "rejected");
                      await createNotification(user.uid, {
                        title: "KYC Rejected",
                        message: `Your KYC was rejected. Reason: ${reason || "Not provided"}. Please resubmit.`,
                        category: "account",
                        type: "error",
                        priority: "high",
                        actionUrl: "/dashboard/kyc",
                        sendEmail: true,
                      });
                    },
                    "KYC rejected",
                  );
                }}
                icon={XCircle}
                label="Reject KYC"
                description="Reject the user's identity verification"
                color="red"
                loadingKey="rejectKYC"
                disabled={
                  user.kycStatus === "rejected" || user.kycStatus === "none"
                }
              />

              <ActionButton
                onClick={() => {
                  if (
                    !window.confirm(
                      'Reset KYC to "Not Started"? The user will need to resubmit all documents.',
                    )
                  )
                    return;
                  runAction(
                    "resetKYC",
                    async () => {
                      await adminResetKYC(user.uid);
                      await createNotification(user.uid, {
                        title: "KYC Reset",
                        message:
                          "Your KYC verification has been reset. Please resubmit your documents.",
                        category: "account",
                        type: "info",
                        priority: "normal",
                        actionUrl: "/dashboard/kyc",
                      });
                    },
                    "KYC reset",
                  );
                }}
                icon={RotateCcw}
                label="Reset KYC"
                description="Clear KYC status so user can resubmit"
                color="cyan"
                loadingKey="resetKYC"
                disabled={user.kycStatus === "none"}
              />
            </div>
          )}

          {/* ─── DANGER ZONE TAB ─── */}
          {activeTab === "danger" && (
            <div className="space-y-3">
              <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4 mb-4">
                <div className="flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 mt-0.5 shrink-0" />
                  <p className="text-xs text-red-200">
                    <strong>Warning:</strong> Actions in this section are
                    irreversible or have serious consequences. Proceed with
                    caution.
                  </p>
                </div>
              </div>

              <ActionButton
                onClick={() => {
                  if (
                    !window.confirm(
                      "Reactivate this deleted/deactivated account?",
                    )
                  )
                    return;
                  runAction(
                    "reactivate",
                    async () => {
                      await adminReactivateAccount(user.uid);
                      await createNotification(user.uid, {
                        title: "Account Reactivated",
                        message:
                          "Your account has been reactivated by an administrator.",
                        category: "account",
                        type: "success",
                        priority: "high",
                        sendEmail: true,
                      });
                    },
                    "Account reactivated",
                  );
                }}
                icon={Unlock}
                label="Reactivate Account"
                description="Restore a deleted or deactivated account"
                color="emerald"
                loadingKey="reactivate"
                disabled={user.accountStatus === "active"}
              />

              <ActionButton
                onClick={() => {
                  const confirm = prompt(
                    'Type "DELETE" to permanently delete this user account:',
                  );
                  if (confirm !== "DELETE") {
                    if (confirm !== null) toast.error("Deletion cancelled");
                    return;
                  }
                  runAction(
                    "deleteAccount",
                    async () => {
                      await updateUserStatus(user.uid, "deleted");
                    },
                    "Account deleted",
                  );
                }}
                icon={Trash2}
                label="Delete Account Permanently"
                description="Mark the account as deleted (cannot be undone)"
                color="red"
                loadingKey="deleteAccount"
                disabled={user.accountStatus === "deleted"}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
