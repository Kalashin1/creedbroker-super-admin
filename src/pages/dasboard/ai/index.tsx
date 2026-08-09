// sr./pagesStrategies.tsx
import React, { useState, useEffect } from "react";
import { Bot, Plus, LayoutGrid, Loader2 } from "lucide-react";
import { toast } from "react-toastify";
import { fetchMarketplaceStrategies } from "../../../services/ai.service";
import { AIStrategyStats } from "./components/AIStrategyStats";
import { AIStrategyForm } from "./components/AIStrategyForm";
import { AIStrategyCard } from "./components/AIStrategyCard";
import type { AIStrategy } from "../../../types/ai.types";
import DashboardLayout from "../components/Layout";

type ViewMode = "list" | "form";

const AdminAIStrategies: React.FC = () => {
  const [strategies, setStrategies] = useState<AIStrategy[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [editingStrategy, setEditingStrategy] = useState<AIStrategy | null>(
    null,
  );

  const loadStrategies = async () => {
    setLoading(true);
    try {
      const data = await fetchMarketplaceStrategies();
      setStrategies(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load AI strategies");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadStrategies();
  }, []);

  const handleEdit = (strategy: AIStrategy) => {
    setEditingStrategy(strategy);
    setViewMode("form");
  };

  const handleNew = () => {
    setEditingStrategy(null);
    setViewMode("form");
  };

  const handleFormClose = () => {
    setEditingStrategy(null);
    setViewMode("list");
  };

  const handleFormSaved = () => {
    setEditingStrategy(null);
    setViewMode("list");
    loadStrategies();
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500/20 to-purple-500/20 border border-violet-500/20">
              <Bot className="h-5 w-5 text-violet-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
                AI Strategy Management
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Create and manage AI trading bots for the marketplace
              </p>
            </div>
          </div>

          {viewMode === "list" && (
            <button
              onClick={handleNew}
              className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40"
            >
              <Plus className="h-4 w-4" /> Create New Strategy
            </button>
          )}
          {viewMode === "form" && (
            <button
              onClick={handleFormClose}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-5 py-2.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              <LayoutGrid className="h-4 w-4" /> Back to List
            </button>
          )}
        </div>

        {/* Content */}
        {viewMode === "form" ? (
          <AIStrategyForm
            editingStrategy={editingStrategy}
            onSaved={handleFormSaved}
            onCancel={handleFormClose}
          />
        ) : (
          <>
            <AIStrategyStats strategies={strategies} />

            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-10 w-10 animate-spin text-violet-400" />
                <p className="mt-4 text-sm text-slate-400">
                  Loading strategies...
                </p>
              </div>
            ) : strategies.length === 0 ? (
              <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-800 bg-slate-900/30 py-20">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-800/60">
                  <Bot className="h-8 w-8 text-slate-500" />
                </div>
                <h3 className="mt-4 text-lg font-semibold text-white">
                  No strategies yet
                </h3>
                <p className="mt-1 text-sm text-slate-400">
                  Create your first AI trading strategy to get started.
                </p>
                <button
                  onClick={handleNew}
                  className="mt-6 inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-500 to-purple-500 px-5 py-2.5 text-sm font-bold text-white shadow-lg shadow-violet-500/20 transition hover:shadow-violet-500/40"
                >
                  <Plus className="h-4 w-4" /> Create First Strategy
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
                {strategies.map((strategy) => (
                  <AIStrategyCard
                    key={strategy.id}
                    strategy={strategy}
                    onEdit={handleEdit}
                    onUpdated={loadStrategies}
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

export default AdminAIStrategies;
