// src/pages/admin/CreatePackage.tsx
import React, { useState, useEffect } from "react";
import { Package, Plus, LayoutGrid, Loader2, ArrowLeft } from "lucide-react";
import { toast } from "react-toastify";
import { fetchAdminPackages } from "../../../../services/adminPackage.service";
import PackageForm from "./components/PackageForm";
import PackageCard from "./components/PackageCard";
import type { InvestmentPackage } from "../../../../types/investment.types";
import DashboardLayout from "../../components/Layout";

type ViewMode = "list" | "form";

const CreatePackage: React.FC = () => {
  const [packages, setPackages] = useState<InvestmentPackage[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingPackage, setEditingPackage] =
    useState<InvestmentPackage | null>(null);

  const loadPackages = async () => {
    setLoading(true);
    try {
      const data = await fetchAdminPackages();
      setPackages(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load packages");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPackages();
  }, []);

  const handleEdit = (pkg: InvestmentPackage) => {
    setEditingPackage(pkg);
    setViewMode("form");
  };

  const handleNew = () => {
    setEditingPackage(null);
    setViewMode("form");
  };

  const handleFormClose = () => {
    setEditingPackage(null);
    setViewMode("list");
  };

  const handleFormSaved = () => {
    setEditingPackage(null);
    setViewMode("list");
    loadPackages();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <Package className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                Investment Packages
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Create and manage investment packages available to users
              </p>
            </div>
          </div>

          {viewMode === "list" && (
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40"
            >
              <Plus className="h-4 w-4" />
              Create New Package
            </button>
          )}

          {viewMode === "form" && (
            <button
              onClick={handleFormClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              <ArrowLeft className="h-4 w-4" />
              Back to List
            </button>
          )}
        </div>

        {/* Content */}
        {viewMode === "form" ? (
          <PackageForm
            editingPackage={editingPackage}
            onSaved={handleFormSaved}
            onCancel={handleFormClose}
          />
        ) : (
          <>
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              <div className="rounded-2xl border border-slate-800 bg-slate-900/50 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-slate-500">
                  Total Packages
                </p>
                <p className="mt-1 text-2xl font-bold text-white tabular-nums">
                  {packages.length}
                </p>
              </div>
              <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-amber-400">
                  Popular
                </p>
                <p className="mt-1 text-2xl font-bold text-amber-400 tabular-nums">
                  {packages.filter((p) => p.popular).length}
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-emerald-400">
                  Min Range
                </p>
                <p className="mt-1 text-2xl font-bold text-emerald-400 tabular-nums">
                  $
                  {packages.length > 0
                    ? Math.min(
                        ...packages.map((p) => p.minInvestment),
                      ).toLocaleString()
                    : "0"}
                </p>
              </div>
              <div className="rounded-2xl border border-cyan-500/20 bg-cyan-500/5 p-4">
                <p className="text-xs font-medium uppercase tracking-wider text-cyan-400">
                  Max Range
                </p>
                <p className="mt-1 text-2xl font-bold text-cyan-400 tabular-nums">
                  $
                  {packages.length > 0
                    ? Math.max(
                        ...packages.map((p) => p.maxInvestment),
                      ).toLocaleString()
                    : "0"}
                </p>
              </div>
            </div>

            {/* Packages Grid */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="mt-4 text-sm text-slate-400">
                  Loading packages...
                </p>
              </div>
            ) : packages.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
                  <Package className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  No packages yet
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Create your first investment package to get started.
                </p>
                <button
                  onClick={handleNew}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40"
                >
                  <Plus className="h-4 w-4" />
                  Create First Package
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {packages.map((pkg) => (
                  <PackageCard
                    key={pkg.id}
                    package={pkg}
                    onEdit={handleEdit}
                    onDeleted={loadPackages}
                    onUpdated={loadPackages}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
};

export default CreatePackage;
