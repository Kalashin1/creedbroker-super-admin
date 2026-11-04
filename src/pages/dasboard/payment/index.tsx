// src/pages/admin/PaymentMethods.tsx
import React, { useState, useEffect } from "react";
import { CreditCard, Plus, Loader2, RefreshCw, Filter } from "lucide-react";
import { toast } from "react-toastify";
import { fetchPaymentMethods } from "../../../services/payment.service";
import { PaymentMethodCard } from "./components/PaymentMethodCard";
import { PaymentMethodFormModal } from "./components/PaymentMethodFormModal";
import type {
  PaymentMethod,
  PaymentCategory,
} from "../../../types/payments.types";
import DashboardLayout from "../components/Layout";

const AdminPaymentMethods: React.FC = () => {
  const [methods, setMethods] = useState<PaymentMethod[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<PaymentCategory | "all">("all");
  const [showAddModal, setShowAddModal] = useState(false);

  const loadMethods = async () => {
    setLoading(true);
    try {
      const data = await fetchPaymentMethods();
      setMethods(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load payment methods");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMethods();
  }, []);

  const filteredMethods =
    filter === "all" ? methods : methods.filter((m) => m.category === filter);

  const stats = {
    total: methods.length,
    enabled: methods.filter((m) => m.enabled).length,
    card: methods.filter((m) => m.category === "card").length,
    bank: methods.filter((m) => m.category === "bank").length,
    crypto: methods.filter((m) => m.category === "crypto").length,
    thirdParty: methods.filter((m) => m.category === "third_party").length,
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* 1. Header Section */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between border-b border-slate-800 pb-6">
          <div className="flex items-center gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500/20 to-cyan-500/20 border border-emerald-500/30">
              <CreditCard className="h-6 w-6 text-emerald-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white">
                Payment Methods
              </h1>
              <p className="mt-1 text-sm text-slate-400">
                Manage deposit and withdrawal options for users
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={loadMethods}
              disabled={loading}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/50 px-4 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${loading ? "animate-spin" : ""}`}
              />
              Refresh
            </button>
            <button
              onClick={() => setShowAddModal(true)}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 hover:brightness-110"
            >
              <Plus className="h-4 w-4" /> Add Method
            </button>
          </div>
        </div>

        {/* 2. Stats Section (Full Width Row) */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
            <p className="text-[10px] text-slate-500 uppercase tracking-wider mb-1">
              Total Methods
            </p>
            <p className="text-2xl font-bold text-white tabular-nums">
              {stats.total}
            </p>
          </div>
          <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4">
            <p className="text-[10px] text-emerald-400 uppercase tracking-wider mb-1">
              Enabled
            </p>
            <p className="text-2xl font-bold text-emerald-400 tabular-nums">
              {stats.enabled}
            </p>
          </div>
          <div className="rounded-xl border border-blue-500/20 bg-blue-500/5 p-4">
            <p className="text-[10px] text-blue-400 uppercase tracking-wider mb-1">
              Card
            </p>
            <p className="text-2xl font-bold text-blue-400 tabular-nums">
              {stats.card}
            </p>
          </div>
          <div className="rounded-xl border border-violet-500/20 bg-violet-500/5 p-4">
            <p className="text-[10px] text-violet-400 uppercase tracking-wider mb-1">
              Bank
            </p>
            <p className="text-2xl font-bold text-violet-400 tabular-nums">
              {stats.bank}
            </p>
          </div>
          <div className="rounded-xl border border-orange-500/20 bg-orange-500/5 p-4">
            <p className="text-[10px] text-orange-400 uppercase tracking-wider mb-1">
              Crypto
            </p>
            <p className="text-2xl font-bold text-orange-400 tabular-nums">
              {stats.crypto}
            </p>
          </div>
          <div className="rounded-xl border border-pink-500/20 bg-pink-500/5 p-4">
            <p className="text-[10px] text-pink-400 uppercase tracking-wider mb-1">
              3rd Party
            </p>
            <p className="text-2xl font-bold text-pink-400 tabular-nums">
              {stats.thirdParty}
            </p>
          </div>
        </div>

        {/* 3. Filter Section (Full Width Row) */}
        <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/30 px-5 py-3">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Filter className="h-4 w-4" />
            <span>Filter by category:</span>
          </div>
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="rounded-lg border border-slate-700 bg-slate-950 px-3 py-1.5 text-xs font-medium text-white outline-none transition focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/20"
          >
            <option value="all">All Categories</option>
            <option value="card">Card</option>
            <option value="bank">Bank</option>
            <option value="crypto">Crypto</option>
            <option value="third_party">Third Party</option>
          </select>
        </div>

        {/* 4. Payment Methods Grid (Sits clearly underneath everything) */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-10 w-10 animate-spin text-emerald-400" />
            <p className="mt-4 text-sm text-slate-400">
              Loading payment methods...
            </p>
          </div>
        ) : filteredMethods.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-24">
            <CreditCard className="h-12 w-12 text-slate-600 mb-3" />
            <h3 className="text-lg font-semibold text-white">
              No payment methods found
            </h3>
            <p className="mt-1 text-sm text-slate-400">
              Use the "Add Method" button to get started.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {filteredMethods.map((method) => (
              <PaymentMethodCard
                key={method.id}
                method={method}
                onUpdated={loadMethods}
              />
            ))}
          </div>
        )}

        {/* Add/Edit Modal */}
        {showAddModal && (
          <PaymentMethodFormModal
            onClose={() => setShowAddModal(false)}
            onSaved={() => {
              setShowAddModal(false);
              loadMethods();
            }}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default AdminPaymentMethods;
