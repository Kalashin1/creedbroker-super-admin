// src/pages/admin/Investments.tsx
import React, { useState, useEffect, useMemo } from "react";
import { Package, LayoutGrid, Table } from "lucide-react";
import { toast } from "react-toastify";
import {
  fetchAllInvestments,
  updateInvestmentStatus,
  adjustInvestmentProfit,
} from "../../../services/adminInvestment.service";
import { createNotification } from "../../../services/notification.service";
import InvestmentCardView from "./components/InvestmentCardView";
import InvestmentTable from "./components/InvestmentTable";
import type {
  AdminInvestment,
  InvestmentAction,
  InvestmentFilters,
  InvestmentStats,
} from "../../../types/investment.types";
import InvestmentStatsCards from "./components/InvestmentStatusCards";
import DashboardLayout from "../components/Layout";

type ViewMode = "cards" | "table";

const Investments: React.FC = () => {
  const [investments, setInvestments] = useState<AdminInvestment[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<ViewMode>("cards");
  const [filters, setFilters] = useState<InvestmentFilters>({
    search: "",
    status: "all",
    tier: "all",
  });

  const loadInvestments = async () => {
    setLoading(true);
    try {
      const data = await fetchAllInvestments();
      setInvestments(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load investments");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInvestments();
  }, []);

  // Compute stats
  const stats: InvestmentStats = useMemo(() => {
    return {
      total: investments.length,
      active: investments.filter((i) => i.status === "active").length,
      pending: investments.filter((i) => i.status === "pending").length,
      completed: investments.filter((i) => i.status === "completed").length,
      totalInvested: investments.reduce((sum, i) => sum + i.amount, 0),
      totalProfit: investments.reduce((sum, i) => sum + i.totalProfit, 0),
    };
  }, [investments]);

  const handleAction = async (
    action: InvestmentAction,
    investment: AdminInvestment,
  ) => {
    try {
      switch (action) {
        case "view":
          toast.info(`Viewing investment ${investment.id}`);
          // TODO: Navigate to investment detail page
          break;

        case "approve":
        case "activate":
          if (
            window.confirm(
              `Activate ${investment.packageName} for ${investment.userName}?`,
            )
          ) {
            const endDate = new Date();
            endDate.setDate(endDate.getDate() + investment.duration);

            await updateInvestmentStatus(
              investment.userId,
              investment.id,
              "active",
              { endDate },
            );

            await createNotification(investment.userId, {
              title: "Investment Activated",
              message: `Your investment of $${investment.amount.toLocaleString()} in ${investment.packageName} is now active. Duration: ${investment.duration} days.`,
              category: "investment",
              type: "success",
              priority: "high",
              actionUrl: "/dashboard/invest/active",
              sendEmail: true,
            });

            toast.success("Investment activated successfully");
            loadInvestments();
          }
          break;

        case "complete":
          if (
            window.confirm(
              `Mark ${investment.packageName} as completed for ${investment.userName}?`,
            )
          ) {
            await updateInvestmentStatus(
              investment.userId,
              investment.id,
              "completed",
              { completedAt: new Date() },
            );

            await createNotification(investment.userId, {
              title: "Investment Matured",
              message: `Your investment in ${investment.packageName} has matured. Principal + profit of $${(investment.amount + investment.totalProfit).toLocaleString()} has been returned to your balance.`,
              category: "investment",
              type: "success",
              priority: "high",
              actionUrl: "/dashboard/invest/history",
              sendEmail: true,
            });

            toast.success("Investment marked as completed");
            loadInvestments();
          }
          break;

        case "cancel":
          if (
            window.confirm(
              `Cancel ${investment.packageName} for ${investment.userName}?`,
            )
          ) {
            await updateInvestmentStatus(
              investment.userId,
              investment.id,
              "cancelled",
            );

            await createNotification(investment.userId, {
              title: "Investment Cancelled",
              message: `Your investment in ${investment.packageName} has been cancelled. The amount has been refunded to your balance.`,
              category: "investment",
              type: "warning",
              priority: "high",
              actionUrl: "/dashboard/invest/history",
              sendEmail: true,
            });

            toast.success("Investment cancelled");
            loadInvestments();
          }
          break;

        case "reject":
          if (
            window.confirm(
              `Reject ${investment.packageName} for ${investment.userName}?`,
            )
          ) {
            await updateInvestmentStatus(
              investment.userId,
              investment.id,
              "rejected",
            );

            await createNotification(investment.userId, {
              title: "Investment Rejected",
              message: `Your investment in ${investment.packageName} was rejected. Please contact support for more information.`,
              category: "investment",
              type: "error",
              priority: "high",
              actionUrl: "/dashboard/support",
              sendEmail: true,
            });

            toast.success("Investment rejected");
            loadInvestments();
          }
          break;

        case "adjust_profit":
          const newProfit = prompt(
            `Adjust profit for ${investment.userName}'s ${investment.packageName}:`,
            investment.totalProfit.toString(),
          );
          if (newProfit !== null && !isNaN(Number(newProfit))) {
            await adjustInvestmentProfit(
              investment.userId,
              investment.id,
              Number(newProfit),
            );

            await createNotification(investment.userId, {
              title: "Investment Profit Updated",
              message: `The profit on your ${investment.packageName} investment has been updated to $${Number(newProfit).toLocaleString()}.`,
              category: "investment",
              type: "info",
              priority: "normal",
              actionUrl: "/dashboard/invest/active",
              sendEmail: true,
            });

            toast.success("Profit adjusted successfully");
            loadInvestments();
          }
          break;

        case "send_notification":
          const message = prompt(
            `Send notification to ${investment.userName}:`,
            "Hello! We have an update regarding your investment.",
          );
          if (message) {
            await createNotification(investment.userId, {
              title: "Message from CreedMarket",
              message,
              category: "system",
              type: "info",
              priority: "normal",
              sendEmail: true,
            });
            toast.success("Notification sent successfully");
          }
          break;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Action failed");
    }
  };

  // Filtered investments for card view
  const filteredInvestments = useMemo(() => {
    let result = [...investments];

    if (filters.search) {
      const q = filters.search.toLowerCase();
      result = result.filter(
        (inv) =>
          inv.userName.toLowerCase().includes(q) ||
          inv.userEmail.toLowerCase().includes(q) ||
          inv.packageName.toLowerCase().includes(q),
      );
    }

    if (filters.status !== "all") {
      result = result.filter((inv) => inv.status === filters.status);
    }

    if (filters.tier !== "all") {
      result = result.filter((inv) => inv.tier === filters.tier);
    }

    return result;
  }, [investments, filters]);

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
                Investment Management
              </h1>
              <p className="mt-0.5 text-sm text-slate-400">
                Monitor and manage all user investments
              </p>
            </div>
          </div>

          {/* View Toggle */}
          <div className="flex items-center gap-1 rounded-xl border border-slate-800 bg-slate-950/50 p-1">
            <button
              onClick={() => setViewMode("cards")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "cards"
                  ? "bg-violet-500/15 text-violet-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" />
              Cards
            </button>
            <button
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition ${
                viewMode === "table"
                  ? "bg-violet-500/15 text-violet-400"
                  : "text-slate-400 hover:bg-slate-800 hover:text-white"
              }`}
            >
              <Table className="h-3.5 w-3.5" />
              Table
            </button>
          </div>
        </div>

        {/* Stats */}
        <InvestmentStatsCards stats={stats} />

        {/* Content */}
        {viewMode === "cards" ? (
          <InvestmentCardView
            investments={filteredInvestments}
            onAction={handleAction}
          />
        ) : (
          <InvestmentTable
            investments={investments}
            loading={loading}
            filters={filters}
            onFiltersChange={setFilters}
            onAction={handleAction}
          />
        )}
      </div>
    </DashboardLayout>
  );
};

export default Investments;
