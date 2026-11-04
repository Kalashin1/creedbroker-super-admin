/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/Login.tsx
import React, { useState } from "react";
import {
  logLoginActivity,
  createSession,
  fetchSecuritySettings,
  sendEmailOTP,
  verifyEmailOTP,
} from "../../../services/security.service";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Check,
  Loader2,
  Fingerprint,
  KeyRound,
  ShieldCheck,
} from "lucide-react";

import {
  AuthLayout,
  BrandingPanel,
  MobileLogo,
  Field,
  SocialButton,
  GoogleIcon,
  AppleIcon,
  GitHubIcon,
  inputClass,
} from "../components/";
import { triggerSecurityAlert } from "../../../services/alert.service";
import { signIn, AuthError } from "../../../services/auth.service";
import { SCREENS } from "../../../navigation/constants";
import { useNotifications } from "../../../context/NotificationContext";

// ─────────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────────
interface FormData {
  email: string;
  password: string;
  rememberMe: boolean;
}
type FormErrors = Partial<Record<keyof FormData, string>>;

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const Login: React.FC = () => {
  const navigate = useNavigate();
  // const location = useLocation();
  const { sendNotification } = useNotifications();
  const redirectTo = "/dashboard";
  // || (location.state as any)?.from?.pathname

  // ─── Initial Login State ───
  const [formData, setFormData] = useState<FormData>({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // ─── 2FA State ───
  const [show2FA, setShow2FA] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [isVerifyingOTP, setIsVerifyingOTP] = useState(false);
  const [tempUserId, setTempUserId] = useState<string | null>(null);
  const [tempEmail, setTempEmail] = useState<string>("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      // 🆕 Step 1: Authenticate user
      const user = await signIn(formData.email.trim(), formData.password);

      // 🆕 Step 2: Check if 2FA is enabled
      const securitySettings = await fetchSecuritySettings(user.uid);

      if (securitySettings.twoFactorEnabled) {
        // Pause login, show OTP screen, send code
        setTempUserId(user.uid);
        setTempEmail(user.email || formData.email.trim());
        await sendEmailOTP(user.uid, user.email || formData.email.trim());
        setShow2FA(true);
        toast.info("Verification code sent to your email");
      } else {
        // Normal login flow - no 2FA
        await triggerSecurityAlert(user.uid, "login", "Successful login", {
          email: user.email,
          userAgent: navigator.userAgent,
        });
        await logLoginActivity(user.uid, "success");
        await createSession(user.uid);
        await sendNotification({
          title: "New Login Detected",
          message: `You successfully signed in from a new device or browser.`,
          category: "security",
          type: "info",
          priority: "normal",
          actionUrl: "/dashboard/security",
          sendEmail: false, // Set to true if you have email Cloud Functions set up
        });

        toast.success("Welcome back!");
        navigate(redirectTo, { replace: true });
      }
    } catch (err) {
      if (err instanceof AuthError) {
        if (
          err.code === "auth/invalid-credential" ||
          err.code === "auth/wrong-password" ||
          err.code === "auth/user-not-found"
        ) {
          setErrors({ password: err.message });
        } else if (err.code === "auth/user-disabled") {
          setErrors({ email: err.message });
        }
        toast.error(err.message);
      } else {
        toast.error("Failed to sign in. Please try again.");
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // ─── 2FA Handlers ───
  const handleVerifyOTP = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tempUserId) return;
    if (otpCode.length !== 6) {
      toast.error("Please enter the full 6-digit code");
      return;
    }

    setIsVerifyingOTP(true);
    try {
      const isValid = await verifyEmailOTP(tempUserId, otpCode);
      if (isValid) {
        await logLoginActivity(tempUserId, "success");
        await createSession(tempUserId);
        toast.success("Welcome back!");
        navigate(redirectTo, { replace: true });
      } else {
        toast.error("Invalid verification code");
      }
    } catch (err: any) {
      console.error(err);
      if (err.message === "OTP expired") {
        toast.error("Code expired. Please request a new one.");
      } else if (err.message === "Too many attempts") {
        toast.error("Too many failed attempts. Please log in again.");
        handleBackToLogin();
      } else {
        toast.error("Verification failed. Please try again.");
      }
    } finally {
      setIsVerifyingOTP(false);
    }
  };

  const handleResendOTP = async () => {
    if (!tempUserId || !tempEmail) return;
    try {
      await sendEmailOTP(tempUserId, tempEmail);
      toast.success("New verification code sent");
    } catch (err) {
      toast.error("Failed to resend code");
    }
  };

  const handleBackToLogin = () => {
    setShow2FA(false);
    setTempUserId(null);
    setTempEmail("");
    setOtpCode("");
  };

  // ─── 2FA Verification Screen ───
  if (show2FA) {
    return (
      <AuthLayout>
        <BrandingPanel
          badge={
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-500/20 bg-cyan-500/10 px-4 py-1.5 text-xs font-medium text-cyan-300">
              <ShieldCheck className="h-3.5 w-3.5" />
              Two-Factor Authentication Active
            </div>
          }
          headline={
            <>
              Verify your{" "}
              <span className="bg-linear-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">
                identity
              </span>{" "}
              to continue.
            </>
          }
          description="We've sent a secure 6-digit code to your email address. This extra step keeps your account safe from unauthorized access."
        />

        <main className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center p-6 sm:p-10">
          <div className="w-full max-w-md">
            <MobileLogo />

            {/* Back button */}
            <button
              onClick={handleBackToLogin}
              className="mb-6 flex items-center gap-1.5 text-sm font-medium text-slate-400 hover:text-white transition"
            >
              <ArrowLeft className="h-3.5 w-3.5" />
              Back to login
            </button>

            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/20 to-blue-500/20 border border-cyan-500/30">
                  <ShieldCheck className="h-6 w-6 text-cyan-400" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white">
                    Two-Factor Authentication
                  </h2>
                  <p className="text-xs text-slate-400">
                    Verify your identity to continue
                  </p>
                </div>
              </div>
            </div>

            {/* Email notification banner */}
            <div className="mb-6 rounded-xl border border-cyan-500/20 bg-cyan-500/5 p-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-cyan-400 mt-0.5 shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-white">
                    Check Your Email
                  </p>
                  <p className="mt-1 text-xs text-slate-400 leading-relaxed">
                    We've sent a 6-digit verification code to{" "}
                    <span className="font-mono text-cyan-300">{tempEmail}</span>
                    . The code expires in 10 minutes.
                  </p>
                </div>
              </div>
            </div>

            <form onSubmit={handleVerifyOTP} className="space-y-5" noValidate>
              <Field
                label="Verification Code"
                icon={<KeyRound className="h-4 w-4" />}
              >
                <input
                  type="text"
                  value={otpCode}
                  onChange={(e) =>
                    setOtpCode(e.target.value.replace(/\D/g, "").slice(0, 6))
                  }
                  placeholder="000000"
                  className={`${inputClass(false)} text-center text-2xl font-mono tracking-widest`}
                  maxLength={6}
                  autoFocus
                  autoComplete="one-time-code"
                  inputMode="numeric"
                />
              </Field>

              <button
                type="submit"
                disabled={isVerifyingOTP || otpCode.length !== 6}
                className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-cyan-500 to-blue-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-cyan-500/20 transition hover:shadow-cyan-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {isVerifyingOTP ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  <>
                    Verify & Continue
                    <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={handleResendOTP}
                disabled={isVerifyingOTP}
                className="w-full text-sm font-medium text-cyan-400 hover:text-cyan-300 transition disabled:opacity-50"
              >
                Didn't receive the code?{" "}
                <span className="underline">Resend</span>
              </button>
            </form>

            <div className="mt-8 flex items-start gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20">
              <Fingerprint className="h-4 w-4 text-amber-400 mt-0.5 shrink-0" />
              <p className="text-xs text-slate-400 leading-relaxed">
                Never share your verification code with anyone. CreedMarket
                support will never ask for it.
              </p>
            </div>
          </div>
        </main>
      </AuthLayout>
    );
  }

  // ─── Initial Login Screen ───
  return (
    <AuthLayout>
      <BrandingPanel
        badge={
          <div className="inline-flex items-center gap-2 rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-1.5 text-xs font-medium text-emerald-300">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-emerald-400" />
            </span>
            Markets open · +2.4% today
          </div>
        }
        headline={
          <>
            Welcome back to{" "}
            <span className="bg-linear-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              precision
            </span>{" "}
            investing.
          </>
        }
        description="Pick up right where you left off. Your portfolio, insights, and opportunities are one sign-in away."
      />

      <main className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <MobileLogo />

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Sign in to your account
            </h2>
            <p className="mt-2 text-slate-400">
              Enter your credentials to access your dashboard.
            </p>
          </div>

          <div className="mb-6 flex items-center gap-2 rounded-lg border border-emerald-500/20 bg-emerald-500/5 px-3 py-2 text-xs text-emerald-300">
            <Fingerprint className="h-3.5 w-3.5" />
            <span>Protected by 256-bit SSL encryption</span>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            <Field
              label="Email address"
              icon={<Mail className="h-4 w-4" />}
              error={errors.email}
            >
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                className={inputClass(!!errors.email)}
              />
            </Field>

            <Field
              label="Password"
              icon={<Lock className="h-4 w-4" />}
              error={errors.password}
              trailing={
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-slate-400 hover:text-white transition"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              }
            >
              <input
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Enter your password"
                autoComplete="current-password"
                className={inputClass(!!errors.password)}
              />
            </Field>

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2.5 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    name="rememberMe"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="peer sr-only"
                  />
                  <div className="h-4.5 w-4.5 rounded-md border border-slate-700 bg-slate-900 transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center">
                    {formData.rememberMe && (
                      <Check
                        className="h-3 w-3 text-slate-950"
                        strokeWidth={3}
                      />
                    )}
                  </div>
                </div>
                <span className="text-sm text-slate-400 group-hover:text-slate-300 transition">
                  Remember me
                </span>
              </label>

              <Link
                to="/auth/forgot-password"
                className="text-sm font-medium text-emerald-400 hover:text-emerald-300 transition"
              >
                Forgot password?
              </Link>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="group flex w-full items-center justify-center gap-2 rounded-xl bg-linear-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                <>
                  Sign in
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </>
              )}
            </button>
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SocialButton label="Google" action="signin">
              <GoogleIcon />
            </SocialButton>
            <SocialButton label="Apple" action="signin">
              <AppleIcon />
            </SocialButton>
            <SocialButton label="GitHub" action="signin">
              <GitHubIcon />
            </SocialButton>
          </div>

          <p className="mt-10 text-center text-sm text-slate-400">
            Don't have an account?{" "}
            <Link
              to={SCREENS.REGISTER}
              className="font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Create one
            </Link>
          </p>

          <p className="mt-6 text-center text-[11px] text-slate-600">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </p>
        </div>
      </main>
    </AuthLayout>
  );
};

export default Login;
