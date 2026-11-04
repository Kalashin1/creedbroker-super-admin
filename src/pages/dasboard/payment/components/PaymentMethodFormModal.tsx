// src/components/admin/payments/PaymentMethodFormModal.tsx
import React, { useState } from "react";
import {
  X,
  Save,
  Loader2,
  CreditCard,
  Building2,
  Bitcoin,
  Wallet,
  Smartphone,
  Apple,
  Globe,
} from "lucide-react";
import { toast } from "react-toastify";
import {
  createPaymentMethod,
  updatePaymentMethod,
} from "../../../../services/payment.service";
import type {
  PaymentMethod,
  PaymentCategory,
} from "../../../../types/payments.types";

interface Props {
  method?: PaymentMethod;
  onClose: () => void;
  onSaved: () => void;
}

interface Preset {
  name: string;
  category: PaymentCategory;
  asset?: string;
  iconName: string;
  min: number;
  max: number;
  feePct: number;
  feeFlat: number;
  time: string;
  icon: React.ElementType;
}

const PRESETS: Preset[] = [
  // Cards
  {
    name: "Visa / Mastercard",
    category: "card",
    asset: undefined,
    iconName: "CreditCard",
    min: 10,
    max: 50000,
    feePct: 2.5,
    feeFlat: 0,
    time: "Instant",
    icon: CreditCard,
  },

  // Bank
  {
    name: "Bank Wire",
    category: "bank",
    asset: undefined,
    iconName: "Building2",
    min: 100,
    max: 100000,
    feePct: 0,
    feeFlat: 15,
    time: "1-3 business days",
    icon: Building2,
  },

  // Crypto - Major
  {
    name: "Bitcoin",
    category: "crypto",
    asset: "btc",
    iconName: "Bitcoin",
    min: 50,
    max: 500000,
    feePct: 1,
    feeFlat: 0,
    time: "10-60 mins",
    icon: Bitcoin,
  },
  {
    name: "Ethereum",
    category: "crypto",
    asset: "eth",
    iconName: "Wallet",
    min: 50,
    max: 500000,
    feePct: 1,
    feeFlat: 0,
    time: "5-15 mins",
    icon: Wallet,
  },
  {
    name: "BNB",
    category: "crypto",
    asset: "bnb",
    iconName: "Wallet",
    min: 50,
    max: 500000,
    feePct: 1,
    feeFlat: 0,
    time: "1-5 mins",
    icon: Wallet,
  },
  {
    name: "Solana",
    category: "crypto",
    asset: "sol",
    iconName: "Wallet",
    min: 50,
    max: 500000,
    feePct: 1,
    feeFlat: 0,
    time: "Instant",
    icon: Wallet,
  },

  // Third Party
  {
    name: "PayPal",
    category: "third_party",
    asset: "paypal",
    iconName: "Globe",
    min: 10,
    max: 10000,
    feePct: 3.5,
    feeFlat: 0.3,
    time: "Instant",
    icon: Globe,
  },
  {
    name: "Apple Pay",
    category: "third_party",
    asset: "apple_pay",
    iconName: "Apple",
    min: 10,
    max: 10000,
    feePct: 2.9,
    feeFlat: 0.3,
    time: "Instant",
    icon: Apple,
  },
];

export const PaymentMethodFormModal: React.FC<Props> = ({
  method,
  onClose,
  onSaved,
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    name: method?.name || "",
    category: method?.category || "card",
    asset: method?.asset || "",
    iconName: method?.iconName || "CreditCard",
    enabled: method?.enabled !== undefined ? method.enabled : true,
    minAmount: method?.minAmount || 10,
    maxAmount: method?.maxAmount || 50000,
    feePercentage: method?.feePercentage || 0,
    feeFlat: method?.feeFlat || 0,
    processingTime: method?.processingTime || "Instant",
    instructions: method?.instructions || "",
  });

  const applyPreset = (preset: Preset) => {
    setFormData({
      ...formData,
      name: preset.name,
      category: preset.category,
      asset: preset.asset || "",
      iconName: preset.iconName,
      minAmount: preset.min,
      maxAmount: preset.max,
      feePercentage: preset.feePct,
      feeFlat: preset.feeFlat,
      processingTime: preset.time,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Name is required");
      return;
    }

    if (formData.minAmount >= formData.maxAmount) {
      toast.error("Min amount must be less than max amount");
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        ...formData,
        asset: formData.asset || undefined,
      };

      if (method) {
        await updatePaymentMethod(method.id, payload);
        toast.success("Payment method updated");
      } else {
        await createPaymentMethod(payload);
        toast.success("Payment method created");
      }
      onSaved();
    } catch (err: any) {
      toast.error(err.message || "Failed to save");
    } finally {
      setIsSaving(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20";

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      <div className="relative w-full max-w-3xl rounded-2xl border border-slate-800 bg-slate-900 shadow-2xl max-h-[90vh] overflow-y-auto custom-scroll">
        <div className="sticky top-0 flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-4 z-10">
          <h2 className="text-lg font-bold text-white">
            {method ? "Edit Payment Method" : "Add Payment Method"}
          </h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white transition"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Quick Presets */}
          {!method && (
            <div>
              <label className="mb-3 block text-xs font-semibold text-slate-300">
                Quick Setup Presets
              </label>
              <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2 max-h-64 overflow-y-auto custom-scroll p-1">
                {PRESETS.map((preset) => (
                  <button
                    key={preset.name}
                    type="button"
                    onClick={() => applyPreset(preset)}
                    className="flex flex-col items-center gap-2 rounded-xl border border-slate-800 bg-slate-950/50 p-3 text-center transition hover:border-violet-500/50 hover:bg-violet-500/5 group"
                  >
                    <preset.icon className="h-6 w-6 text-slate-400 group-hover:text-violet-400 transition" />
                    <span className="text-xs font-semibold text-slate-300 group-hover:text-white">
                      {preset.name}
                    </span>
                  </button>
                ))}
              </div>
              <p className="mt-2 text-[10px] text-slate-500">
                Or configure manually below
              </p>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Method Name *
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) =>
                  setFormData({ ...formData, name: e.target.value })
                }
                placeholder="e.g., Visa, Bitcoin, PayPal"
                className={inputClass}
                required
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Category *
              </label>
              <select
                value={formData.category}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    category: e.target.value as PaymentCategory,
                  })
                }
                className={`${inputClass} appearance-none`}
              >
                <option value="card">Card (Visa/Mastercard)</option>
                <option value="bank">Bank Transfer</option>
                <option value="crypto">Cryptocurrency</option>
                <option value="third_party">
                  Third Party (PayPal, Apple Pay)
                </option>
              </select>
            </div>
          </div>

          {(formData.category === "crypto" ||
            formData.category === "third_party") && (
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                {formData.category === "crypto"
                  ? "Crypto Symbol"
                  : "Provider Name"}
              </label>
              <input
                type="text"
                value={formData.asset}
                onChange={(e) =>
                  setFormData({ ...formData, asset: e.target.value })
                }
                placeholder={
                  formData.category === "crypto"
                    ? "e.g., btc, eth, usdt"
                    : "e.g., paypal, apple_pay"
                }
                className={inputClass}
              />
            </div>
          )}

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Min ($)
              </label>
              <input
                type="number"
                value={formData.minAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    minAmount: Number(e.target.value),
                  })
                }
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Max ($)
              </label>
              <input
                type="number"
                value={formData.maxAmount}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    maxAmount: Number(e.target.value),
                  })
                }
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Fee (%)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.feePercentage}
                onChange={(e) =>
                  setFormData({
                    ...formData,
                    feePercentage: Number(e.target.value),
                  })
                }
                className={inputClass}
                min="0"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-300">
                Flat Fee ($)
              </label>
              <input
                type="number"
                step="0.01"
                value={formData.feeFlat}
                onChange={(e) =>
                  setFormData({ ...formData, feeFlat: Number(e.target.value) })
                }
                className={inputClass}
                min="0"
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Processing Time
            </label>
            <input
              type="text"
              value={formData.processingTime}
              onChange={(e) =>
                setFormData({ ...formData, processingTime: e.target.value })
              }
              placeholder="e.g., Instant, 10-30 minutes"
              className={inputClass}
            />
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              User Instructions
            </label>
            <textarea
              value={formData.instructions}
              onChange={(e) =>
                setFormData({ ...formData, instructions: e.target.value })
              }
              rows={3}
              placeholder="Instructions shown to users..."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
            <div>
              <p className="text-sm font-semibold text-white">
                Enable Payment Method
              </p>
              <p className="text-[11px] text-slate-500">
                Users can use this method immediately
              </p>
            </div>
            <button
              type="button"
              onClick={() =>
                setFormData({ ...formData, enabled: !formData.enabled })
              }
              className={`relative h-6 w-11 rounded-full transition ${formData.enabled ? "bg-emerald-500" : "bg-slate-700"}`}
            >
              <span
                className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${formData.enabled ? "left-5" : "left-0.5"}`}
              />
            </button>
          </div>

          <div className="flex justify-end pt-4 border-t border-slate-800">
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-6 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40 disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {method ? "Update Method" : "Create Method"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
