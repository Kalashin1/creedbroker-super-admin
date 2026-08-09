import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import DashboardLayout from "./components/Layout";
import type {
  AdminUser,
  UserAction,
  UserFilters,
} from "../../types/admin.types";
import {
  fetchAllUsers,
  updateUserKYC,
  updateUserStatus,
} from "../../services/admin.service";
import { toast } from "react-toastify";
import { createNotification } from "../../services/notification.service";
import Header from "./components/Header";
import StatCard from "./components/StatCard";
import UserTable from "./components/UserTable";
import { SCREENS } from "../../navigation/constants";
import { useNavigate } from "react-router-dom";

const Home = () => {
  const { user } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState<UserFilters>({
    search: "",
    role: "all",
    status: "all",
    kyc: "all",
  });

  const navigate = useNavigate()

  const loadUsers = async () => {
    setLoading(true);
    try {
      const data = await fetchAllUsers();
      setUsers(data);
    } catch (err) {
      console.error(err);
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const handleAction = async (action: UserAction, user: AdminUser) => {
    try {
      switch (action) {
        case "view":
            navigate(SCREENS.USER_PROFILE(user.id))
          break;

        case "verify_kyc":
          if (
            window.confirm(
              `Verify KYC for ${user.fullName}? This grants them full platform access.`,
            )
          ) {
            await updateUserKYC(user.id, "verified");
            await createNotification(user.id, {
              title: "KYC Verification Approved",
              message:
                "Your identity has been successfully verified. You now have full access to all platform features.",
              category: "account",
              type: "success",
              priority: "high",
              actionUrl: "/dashboard/profile",
              sendEmail: true,
            });
            toast.success(`${user.fullName}'s KYC has been verified`);
            loadUsers();
          }
          break;

        case "reject_kyc":
          if (
            window.confirm(
              `Reject KYC for ${user.fullName}? They will need to resubmit.`,
            )
          ) {
            await updateUserKYC(user.id, "rejected");
            await createNotification(user.id, {
              title: "KYC Verification Rejected",
              message:
                "Your KYC application was rejected. Please review the requirements and resubmit.",
              category: "account",
              type: "error",
              priority: "high",
              actionUrl: "/dashboard/kyc",
              sendEmail: true,
            });
            toast.success(`${user.fullName}'s KYC has been rejected`);
            loadUsers();
          }
          break;

        case "restrict":
          if (
            window.confirm(
              `Restrict ${user.fullName}'s account? They will have limited access to withdrawals and trading.`,
            )
          ) {
            await updateUserStatus(user.id, "restricted");
            await createNotification(user.id, {
              title: "Account Restricted",
              message:
                "Your account has been temporarily restricted. Please contact support for more information.",
              category: "security",
              type: "warning",
              priority: "high",
              actionUrl: "/dashboard/support",
              sendEmail: true,
            });
            toast.success(`${user.fullName}'s account has been restricted`);
            loadUsers();
          }
          break;

        case "unrestrict":
          if (
            window.confirm(
              `Remove restriction from ${user.fullName}'s account?`,
            )
          ) {
            await updateUserStatus(user.id, "active");
            await createNotification(user.id, {
              title: "Account Restriction Removed",
              message:
                "Your account is now fully active. All features have been restored.",
              category: "account",
              type: "success",
              priority: "normal",
              sendEmail: true,
            });
            toast.success(`${user.fullName}'s account is now active`);
            loadUsers();
          }
          break;

        case "block":
          if (
            window.confirm(
              `Block ${user.fullName}'s account? They will be unable to log in.`,
            )
          ) {
            await updateUserStatus(user.id, "blocked");
            await createNotification(user.id, {
              title: "Account Blocked",
              message:
                "Your account has been blocked due to a violation of our terms of service. Contact support for assistance.",
              category: "security",
              type: "error",
              priority: "urgent",
              sendEmail: true,
            });
            toast.success(`${user.fullName}'s account has been blocked`);
            loadUsers();
          }
          break;

        case "unblock":
          if (window.confirm(`Unblock ${user.fullName}'s account?`)) {
            await updateUserStatus(user.id, "active");
            await createNotification(user.id, {
              title: "Account Unblocked",
              message:
                "Your account has been unblocked. You can now log in and access all features.",
              category: "account",
              type: "success",
              priority: "high",
              sendEmail: true,
            });
            toast.success(`${user.fullName}'s account has been unblocked`);
            loadUsers();
          }
          break;

        case "send_notification":
          const message = prompt(
            `Send a notification to ${user.fullName}:`,
            "Hello! We have an important update regarding your account.",
          );
          if (message) {
            await createNotification(user.id, {
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

        case "delete":
          if (
            window.confirm(
              `⚠️ Permanently delete ${user.fullName}'s account? This action cannot be undone.`,
            )
          ) {
            const confirmText = prompt(
              `Type "DELETE" to confirm permanent deletion of ${user.fullName}:`,
            );
            if (confirmText === "DELETE") {
              await updateUserStatus(user.id, "deleted");
              toast.success(`${user.fullName}'s account has been deleted`);
              loadUsers();
            } else {
              toast.error("Deletion cancelled");
            }
          }
          break;
      }
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Action failed");
    }
  };

  // Stats
  const stats = {
    total: users.length,
    active: users.filter((u) => u.accountStatus === "active").length,
    pendingKYC: users.filter((u) => u.kycStatus === "pending").length,
    blocked: users.filter((u) => u.accountStatus === "blocked").length,
  };
  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Page header */}
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-white sm:text-3xl">
            Welcome back, {user?.displayName} Admin 👋
          </h1>
          <p className="mt-1 text-sm text-slate-400">Check on your clients.</p>
        </div>
      </div>

      <Header />
      <StatCard stats={stats} />
      <UserTable
        onFiltersChange={setFilters}
        filters={filters}
        loading={loading}
        onAction={handleAction}
        users={users}
      />
    </DashboardLayout>
  );
};

export default Home;
