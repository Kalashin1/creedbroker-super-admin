// src/components/auth/RequireAuth.tsx
import React, { useEffect } from "react";
import { Navigate, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { TrendingUp } from "lucide-react";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface RequireAuthProps {
  children: React.ReactNode;
  /** If true, redirects unverified users to the verify-email page */
  requireEmailVerification?: boolean;
  /** Optional role requirement (e.g., 'admin') */
  requiredRole?: "client" | "admin";
}

// ─────────────────────────────────────────────────────────────
// Loading Screen (extracted to keep main component clean)
// ─────────────────────────────────────────────────────────────
const AuthLoadingScreen: React.FC = () => (
  <div className="flex h-screen items-center justify-center bg-slate-950">
    <div className="flex flex-col items-center gap-4">
      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/20">
        <TrendingUp className="h-7 w-7 text-slate-950" strokeWidth={2.5} />
      </div>

      <div className="relative">
        <div className="h-10 w-10 animate-spin rounded-full border-2 border-slate-800 border-t-emerald-400" />
      </div>

      <div className="text-center">
        <p className="text-sm font-medium text-white">Securing your session</p>
        <p className="mt-1 text-xs text-slate-500">Please wait a moment...</p>
      </div>
    </div>
  </div>
);

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const RequireAuth: React.FC<RequireAuthProps> = ({
  children,
  requireEmailVerification = false,
  requiredRole,
}) => {
  // ✅ ALL HOOKS AT THE TOP — before any conditional logic
  const { user, profile, loading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Reload user to get fresh emailVerified state if needed
  useEffect(() => {
    if (user && requireEmailVerification && !user.emailVerified) {
      user.reload().then(() => {
        if (!user.emailVerified) {
          navigate("/auth/verify-email", { replace: true });
        }
      });
    }
  }, [user, requireEmailVerification, navigate]);

  // ✅ NOW do conditional rendering — after all hooks
  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    console.log("no user")
    return (
      <Navigate
        to="/login"
        state={{ from: location.pathname + location.search }}
        replace
      />
    );
  }

  if (requireEmailVerification && !user.emailVerified) {
    return <Navigate to="/verify-email" replace />;
  }

  if (requiredRole && profile?.role !== requiredRole) {
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
};

export default RequireAuth;
