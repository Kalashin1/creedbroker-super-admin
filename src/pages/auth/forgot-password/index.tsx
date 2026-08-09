/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/ForgotPassword.tsx
import React, { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  ArrowRight,
  ArrowLeft,
  Loader2,
  Check,
  Lock,
  ShieldCheck,
  Inbox,
  ChevronDown,
  RefreshCw,
} from "lucide-react";

import {
  AuthLayout,
  BrandingPanel,
  MobileLogo,
  Field,
  inputClass,
} from "../components";
import { forgotPassword, AuthError } from "../../../services/auth.service";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
type FlowState = "idle" | "submitting" | "success";

interface FormErrors {
  email?: string;
}

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const maskEmail = (email: string): string => {
  const [local, domain] = email.split("@");
  if (!domain) return email;
  if (local.length <= 2) return `${local[0]}***@${domain}`;
  return `${local[0]}${"•".repeat(Math.min(local.length - 2, 5))}${local.slice(-1)}@${domain}`;
};

const RESEND_COOLDOWN = 60; // seconds

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const ForgotPassword: React.FC = () => {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState<FormErrors>({});
  const [flowState, setFlowState] = useState<FlowState>("idle");
  const [cooldown, setCooldown] = useState(0);
  const [showTips, setShowTips] = useState(false);

  // Cooldown timer
  useEffect(() => {
    if (cooldown <= 0) return;
    const timer = setInterval(() => {
      setCooldown((c) => (c > 0 ? c - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [cooldown]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEmail(e.target.value);
    if (errors.email) setErrors({});
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
      newErrors.email = "Please enter a valid email address";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setFlowState("submitting");
    const ok = await sendResetEmail();
    if (ok) {
      setFlowState("success");
      setCooldown(RESEND_COOLDOWN);
      toast.success("Reset link sent! Check your inbox.");
    } else {
      setFlowState("idle");
    }
  };

 const sendResetEmail = useCallback(async (): Promise<boolean> => {
   try {
     await forgotPassword(email.trim());
     return true;
   } catch (err) {
     if (err instanceof AuthError) {
       if (err.code === "auth/user-not-found") {
         setErrors({ email: err.message });
       } else if (err.code === "auth/invalid-email") {
         setErrors({ email: err.message });
       } else if (err.code === "auth/invalid-recipient-email") {
         setErrors({ email: err.message });
       }
       toast.error(err.message);
     } else {
       toast.error("Failed to send reset email. Please try again.");
     }
     return false;
   }
 }, [email]);

  const handleResend = async () => {
    if (cooldown > 0) return;
    setCooldown(RESEND_COOLDOWN);
    toast.info("Sending a new reset link...");
    const ok = await sendResetEmail();
    if (ok) toast.success("A new reset link has been sent.");
  };

  return (
    <AuthLayout>
      <BrandingPanel
        badge={
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
            <ShieldCheck className="h-3.5 w-3.5" />
            Secure account recovery
          </div>
        }
        headline={
          <>
            Happens to the{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              best of us.
            </span>
          </>
        }
        description="Enter your email and we'll send you a secure, time-limited link to reset your password. Your account and assets stay protected."
      />

      <main className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <MobileLogo />

          {/* Header */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              {flowState === "success"
                ? "Check your inbox"
                : "Reset your password"}
            </h2>
            <p className="mt-2 text-slate-400">
              {flowState === "success"
                ? "We've sent a secure link to get you back in."
                : "No worries — we'll email you a link to create a new one."}
            </p>
          </div>

          {/* ───────────── Idle / Submitting State ───────────── */}
          {flowState !== "success" && (
            <form onSubmit={handleSubmit} className="space-y-5" noValidate>
              {/* Info banner */}
              <div className="flex items-start gap-3 rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10 border border-emerald-500/20">
                  <Lock className="h-4 w-4 text-emerald-400" />
                </div>
                <div className="text-sm text-slate-300 leading-relaxed">
                  For your security, the reset link will expire in{" "}
                  <span className="font-semibold text-white">15 minutes</span>{" "}
                  and can only be used once.
                </div>
              </div>

              <Field
                label="Email address"
                icon={<Mail className="h-4 w-4" />}
                error={errors.email}
              >
                <input
                  type="email"
                  name="email"
                  value={email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  autoComplete="email"
                  autoFocus
                  disabled={flowState === "submitting"}
                  className={inputClass(!!errors.email)}
                />
              </Field>

              <button
                type="submit"
                disabled={flowState === "submitting"}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {flowState === "submitting" ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sending reset link...
                  </>
                ) : (
                  <>
                    Send reset link
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ───────────── Success State ───────────── */}
          {flowState === "success" && (
            <div className="space-y-6 animate-[fadeIn_0.4s_ease-out]">
              {/* Success icon */}
              <div className="flex justify-center">
                <div className="relative">
                  <div className="absolute inset-0 rounded-full bg-emerald-500/30 blur-xl" />
                  <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-emerald-400 to-cyan-500 shadow-lg shadow-emerald-500/30">
                    <Check
                      className="h-10 w-10 text-slate-950"
                      strokeWidth={3}
                    />
                  </div>
                </div>
              </div>

              {/* Email confirmation */}
              <div className="rounded-xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-center">
                <div className="flex items-center justify-center gap-2 text-sm text-emerald-300">
                  <Inbox className="h-4 w-4" />
                  <span>Reset link sent to</span>
                </div>
                <div className="mt-1.5 font-mono text-sm font-semibold text-white tracking-wide">
                  {maskEmail(email)}
                </div>
              </div>

              {/* Next steps */}
              <div className="space-y-2.5 text-sm text-slate-300">
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-400">
                    1
                  </span>
                  <span>Open your email and click the reset link.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-400">
                    2
                  </span>
                  <span>Create a new, strong password.</span>
                </div>
                <div className="flex items-start gap-2.5">
                  <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-slate-800 text-[11px] font-semibold text-emerald-400">
                    3
                  </span>
                  <span>Sign in to your dashboard — you're all set.</span>
                </div>
              </div>

              {/* Resend */}
              <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div className="text-sm text-slate-300">
                    Didn't get the email?
                  </div>
                  <button
                    type="button"
                    onClick={handleResend}
                    disabled={cooldown > 0}
                    className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-slate-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {cooldown > 0 ? (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        Resend in {cooldown}s
                      </>
                    ) : (
                      <>
                        <RefreshCw className="h-3 w-3" />
                        Resend email
                      </>
                    )}
                  </button>
                </div>

                {/* Troubleshooting toggle */}
                <button
                  type="button"
                  onClick={() => setShowTips(!showTips)}
                  className="mt-3 flex w-full items-center justify-between text-xs text-slate-400 hover:text-slate-200 transition"
                >
                  <span>Still having trouble?</span>
                  <ChevronDown
                    className={`h-3.5 w-3.5 transition-transform ${
                      showTips ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {showTips && (
                  <ul className="mt-3 space-y-2 border-t border-slate-800 pt-3 text-xs text-slate-400">
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      Check your spam or promotions folder.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      Make sure the email matches the one you signed up with.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      Wait a few minutes — email delivery can sometimes be
                      delayed.
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="mt-1 h-1 w-1 shrink-0 rounded-full bg-slate-600" />
                      If you used a social login (Google, Apple), password reset
                      won't apply.
                    </li>
                  </ul>
                )}
              </div>

              {/* Back to login */}
              <Link
                to="/auth/login"
                className="group flex w-full items-center justify-center gap-2 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
              >
                <ArrowLeft className="h-4 w-4 transition group-hover:-translate-x-1" />
                Back to sign in
              </Link>
            </div>
          )}

          {/* Footer links (only in idle/submitting state) */}
          {flowState !== "success" && (
            <>
              <div className="mt-8 text-center">
                <Link
                  to="/auth/login"
                  className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition"
                >
                  <ArrowLeft className="h-3.5 w-3.5" />
                  Remember your password?{" "}
                  <span className="text-emerald-400">Sign in</span>
                </Link>
              </div>

              <p className="mt-10 text-center text-sm text-slate-400">
                Don't have an account?{" "}
                <Link
                  to="/auth/create-account"
                  className="font-semibold text-emerald-400 hover:text-emerald-300 transition"
                >
                  Create one
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      {/* Fade-in keyframe for success state */}
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(8px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </AuthLayout>
  );
};

export default ForgotPassword;
