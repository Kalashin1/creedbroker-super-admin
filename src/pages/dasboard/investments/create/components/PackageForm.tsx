// src/components/admin/packages/PackageForm.tsx
import React, { useState, useEffect } from "react";
import {
  Package,
  DollarSign,
  Percent,
  Clock,
  ListChecks,
  Loader2,
  Save,
  X,
  Star,
} from "lucide-react";
import { toast } from "react-toastify";
import { createPackage, updatePackage } from "../../../../../services/adminPackage.service"
import IconPicker from "./IconPicker";
import GradientPicker from "./GradientPicker";
import type {
  InvestmentPackage,
  PackageTier,
} from "../../../../../types/investment.types";

interface Props {
  editingPackage?: InvestmentPackage | null;
  onSaved: () => void;
  onCancel: () => void;
}

const TIERS: { value: PackageTier; label: string }[] = [
  { value: "starter", label: "Starter" },
  { value: "professional", label: "Professional" },
  { value: "premium", label: "Premium" },
  { value: "elite", label: "Elite" },
  { value: "institutional", label: "Institutional" },
];

interface FormData {
  name: string;
  tier: PackageTier;
  minInvestment: string;
  maxInvestment: string;
  duration: string;
  roi: string;
  dailyProfit: string;
  popular: boolean;
  features: string[];
  iconName: string;
  accentFrom: string;
  accentTo: string;
}

const PackageForm: React.FC<Props> = ({
  editingPackage,
  onSaved,
  onCancel,
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [newFeature, setNewFeature] = useState("");

  const [formData, setFormData] = useState<FormData>({
    name: "",
    tier: "starter",
    minInvestment: "",
    maxInvestment: "",
    duration: "",
    roi: "",
    dailyProfit: "",
    popular: false,
    features: [],
    iconName: "TrendingUp",
    accentFrom: "from-emerald-500",
    accentTo: "to-cyan-500",
  });

  // Populate form when editing
  useEffect(() => {
    if (editingPackage) {
      setFormData({
        name: editingPackage.name,
        tier: editingPackage.tier,
        minInvestment: editingPackage.minInvestment.toString(),
        maxInvestment: editingPackage.maxInvestment.toString(),
        duration: editingPackage.duration.toString(),
        roi: editingPackage.roi.toString(),
        dailyProfit: editingPackage.dailyProfit.toString(),
        popular: editingPackage.popular || false,
        features: editingPackage.features || [],
        iconName: editingPackage.iconName || "TrendingUp",
        accentFrom: editingPackage.accentFrom || "from-emerald-500",
        accentTo: editingPackage.accentTo || "to-cyan-500",
      });
    }
  }, [editingPackage]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const addFeature = () => {
    if (!newFeature.trim()) return;
    setFormData((prev) => ({
      ...prev,
      features: [...prev.features, newFeature.trim()],
    }));
    setNewFeature("");
  };

  const removeFeature = (index: number) => {
    setFormData((prev) => ({
      ...prev,
      features: prev.features.filter((_, i) => i !== index),
    }));
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return "Package name is required";
    if (!formData.minInvestment || Number(formData.minInvestment) <= 0)
      return "Minimum investment must be greater than 0";
    if (!formData.maxInvestment || Number(formData.maxInvestment) <= 0)
      return "Maximum investment must be greater than 0";
    if (Number(formData.minInvestment) >= Number(formData.maxInvestment))
      return "Minimum investment must be less than maximum";
    if (!formData.duration || Number(formData.duration) <= 0)
      return "Duration must be greater than 0";
    if (!formData.roi || Number(formData.roi) <= 0)
      return "ROI must be greater than 0";
    if (!formData.dailyProfit || Number(formData.dailyProfit) <= 0)
      return "Daily profit must be greater than 0";
    if (formData.features.length === 0)
      return "At least one feature is required";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const error = validate();
    if (error) {
      toast.error(error);
      return;
    }

    setIsSubmitting(true);
    try {
      const payload = {
        name: formData.name.trim(),
        tier: formData.tier,
        minInvestment: Number(formData.minInvestment),
        maxInvestment: Number(formData.maxInvestment),
        duration: Number(formData.duration),
        roi: Number(formData.roi),
        dailyProfit: Number(formData.dailyProfit),
        popular: formData.popular,
        features: formData.features,
        iconName: formData.iconName,
        accentFrom: formData.accentFrom,
        accentTo: formData.accentTo,
      };

      if (editingPackage) {
        await updatePackage(editingPackage.id, payload);
        toast.success("Package updated successfully");
      } else {
        await createPackage(payload);
        toast.success("Package created successfully");
      }

      onSaved();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Failed to save package");
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    "w-full rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 pl-10 pr-4 text-sm text-white outline-none transition focus:border-emerald-500/50 focus:ring-2 focus:ring-emerald-500/20";

  return (
    <form
      onSubmit={handleSubmit}
      className="rounded-2xl border border-slate-800 bg-slate-900/50 p-6 backdrop-blur"
    >
      <div className="mb-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
            <Package className="h-5 w-5 text-violet-400" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-white">
              {editingPackage ? "Edit Package" : "Create New Package"}
            </h3>
            <p className="text-xs text-slate-400">
              {editingPackage
                ? "Update the investment package details"
                : "This package will be visible to all users"}
            </p>
          </div>
        </div>
      </div>

      <div className="space-y-5">
        {/* Name & Tier */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Package Name <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Package className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="e.g. Gold Growth Plan"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Tier <span className="text-red-400">*</span>
            </label>
            <select
              name="tier"
              value={formData.tier}
              onChange={handleChange}
              className="w-full appearance-none rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-emerald-500/50"
            >
              {TIERS.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Investment Range */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Minimum Investment ($) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                name="minInvestment"
                value={formData.minInvestment}
                onChange={handleChange}
                placeholder="100"
                min="0"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Maximum Investment ($) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <DollarSign className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                name="maxInvestment"
                value={formData.maxInvestment}
                onChange={handleChange}
                placeholder="10000"
                min="0"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Duration & ROI */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Duration (days) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Clock className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                name="duration"
                value={formData.duration}
                onChange={handleChange}
                placeholder="30"
                min="1"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Total ROI (%) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                name="roi"
                value={formData.roi}
                onChange={handleChange}
                placeholder="25"
                min="0"
                step="0.1"
                className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="mb-1.5 block text-xs font-semibold text-slate-300">
              Daily Profit (%) <span className="text-red-400">*</span>
            </label>
            <div className="relative">
              <Percent className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="number"
                name="dailyProfit"
                value={formData.dailyProfit}
                onChange={handleChange}
                placeholder="0.83"
                min="0"
                step="0.01"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Icon & Gradient */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <IconPicker
            value={formData.iconName}
            onChange={(iconName) => setFormData({ ...formData, iconName })}
          />
          <GradientPicker
            fromValue={formData.accentFrom}
            toValue={formData.accentTo}
            onChange={(from, to) =>
              setFormData({ ...formData, accentFrom: from, accentTo: to })
            }
          />
        </div>

        {/* Popular toggle */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-amber-500/10 border border-amber-500/20">
              <Star className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-white">
                Mark as "Most Popular"
              </p>
              <p className="text-[11px] text-slate-500">
                Highlights this package with a badge on the user's invest page
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() =>
              setFormData({ ...formData, popular: !formData.popular })
            }
            className={`relative h-6 w-11 rounded-full transition ${
              formData.popular ? "bg-amber-500" : "bg-slate-700"
            }`}
          >
            <span
              className={`absolute top-0.5 h-5 w-5 rounded-full bg-white transition ${
                formData.popular ? "left-5" : "left-0.5"
              }`}
            />
          </button>
        </div>

        {/* Features */}
        <div>
          <label className="mb-1.5 block text-xs font-semibold text-slate-300">
            Features <span className="text-red-400">*</span>
          </label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={newFeature}
              onChange={(e) => setNewFeature(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  addFeature();
                }
              }}
              placeholder="e.g. Daily profit distribution"
              className="flex-1 rounded-xl border border-slate-800 bg-slate-950/50 py-2.5 px-4 text-sm text-white outline-none transition focus:border-emerald-500/50"
            />
            <button
              type="button"
              onClick={addFeature}
              className="rounded-xl bg-emerald-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-600"
            >
              Add
            </button>
          </div>

          {formData.features.length > 0 ? (
            <div className="space-y-1.5">
              {formData.features.map((feature, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/50 px-3 py-2"
                >
                  <div className="flex items-center gap-2">
                    <ListChecks className="h-3.5 w-3.5 text-emerald-400" />
                    <span className="text-sm text-white">{feature}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFeature(idx)}
                    className="flex h-6 w-6 items-center justify-center rounded-md text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">
              No features added yet
            </p>
          )}
        </div>

        {/* Preview */}
        <div className="rounded-xl border border-slate-800 bg-slate-950/50 p-4">
          <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 mb-3">
            Preview
          </p>
          <div
            className={`rounded-xl bg-gradient-to-br ${formData.accentFrom} ${formData.accentTo} p-4`}
          >
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-white/20">
                <span className="text-xl">📦</span>
              </div>
              <div>
                <p className="text-sm font-bold text-white">
                  {formData.name || "Package Name"}
                </p>
                <p className="text-[10px] text-white/70 uppercase">
                  {formData.tier} tier
                </p>
              </div>
            </div>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-[9px] text-white/70">ROI</p>
                <p className="text-sm font-bold text-white">
                  {formData.roi || "0"}%
                </p>
              </div>
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-[9px] text-white/70">Duration</p>
                <p className="text-sm font-bold text-white">
                  {formData.duration || "0"}d
                </p>
              </div>
              <div className="rounded-lg bg-black/20 p-2">
                <p className="text-[9px] text-white/70">Daily</p>
                <p className="text-sm font-bold text-white">
                  {formData.dailyProfit || "0"}%
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onCancel}
            className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40 disabled:opacity-50"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : (
              <>
                <Save className="h-4 w-4" />
                {editingPackage ? "Update Package" : "Create Package"}
              </>
            )}
          </button>
        </div>
      </div>
    </form>
  );
};

export default PackageForm;
