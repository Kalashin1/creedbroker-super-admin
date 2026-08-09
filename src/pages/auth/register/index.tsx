/* eslint-disable @typescript-eslint/no-explicit-any */
// src/pages/auth/CreateAccount.tsx
import React, { useState, useMemo, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import {
  User,
  Mail,
  Lock,
  Phone,
  Globe,
  Eye,
  EyeOff,
  ArrowRight,
  Check,
  Loader2,
  AlertCircle,
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
import { createAccount, AuthError } from "../../../services/auth.service";
import { SCREENS } from "../../../navigation/constants";

// ─────────────────────────────────────────────────────────────
// Types & Constants
// ─────────────────────────────────────────────────────────────
interface FormData {
  fullName: string;
  email: string;
  phone: string;
  country: string;
  password: string;
  confirmPassword: string;
  agreeTerms: boolean;
}
type FormErrors = Partial<Record<keyof FormData, string>>;

const COUNTRIES = [
  { code: "US", name: "United States" },
  { code: "GB", name: "United Kingdom" },
  { code: "DE", name: "Germany" },
  { code: "FR", name: "France" },
  { code: "CA", name: "Canada" },
  { code: "AU", name: "Australia" },
  { code: "SG", name: "Singapore" },
  { code: "JP", name: "Japan" },
  { code: "AE", name: "United Arab Emirates" },
  { code: "CH", name: "Switzerland" },
  { code: "NG", name: "Nigeria" },
  { code: "ZA", name: "South Africa" },
];

// ─────────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────────
const getPasswordStrength = (password: string) => {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 1) return { score, label: "Weak", color: "bg-red-500" };
  if (score <= 2) return { score, label: "Fair", color: "bg-orange-500" };
  if (score <= 3) return { score, label: "Good", color: "bg-yellow-500" };
  if (score <= 4) return { score, label: "Strong", color: "bg-emerald-500" };
  return { score, label: "Excellent", color: "bg-emerald-400" };
};

// ─────────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────────
const CreateAccount: React.FC = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState<FormData>({
    fullName: "",
    email: "",
    phone: "",
    country: "",
    password: "",
    confirmPassword: "",
    agreeTerms: false,
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [step, setStep] = useState<1 | 2>(1);

  const passwordStrength = useMemo(
    () => getPasswordStrength(formData.password),
    [formData.password],
  );

  useEffect(() => {
    if (
      formData.confirmPassword &&
      formData.password !== formData.confirmPassword
    ) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: "Passwords do not match",
      }));
    } else {
      setErrors((prev) => ({ ...prev, confirmPassword: undefined }));
    }
  }, [formData.password, formData.confirmPassword]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>,
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
    if (errors[name as keyof FormErrors]) {
      setErrors((prev) => ({ ...prev, [name]: undefined }));
    }
  };

  const validateStep1 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = "Full name is required";
    else if (formData.fullName.trim().length < 2)
      newErrors.fullName = "Name must be at least 2 characters";

    if (!formData.email.trim()) newErrors.email = "Email is required";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = "Please enter a valid email";

    if (!formData.country) newErrors.country = "Please select your country";

    if (!formData.phone.trim()) newErrors.phone = "Phone number is required";
    else if (!/^[0-9+\-\s()]{7,20}$/.test(formData.phone))
      newErrors.phone = "Please enter a valid phone number";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = (): boolean => {
    const newErrors: FormErrors = {};
    if (!formData.password) newErrors.password = "Password is required";
    else if (formData.password.length < 8)
      newErrors.password = "Password must be at least 8 characters";
    else if (passwordStrength.score < 3)
      newErrors.password = "Please choose a stronger password";

    if (!formData.confirmPassword)
      newErrors.confirmPassword = "Please confirm your password";
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = "Passwords do not match";

    if (!formData.agreeTerms)
      newErrors.agreeTerms = "You must agree to the terms";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

 const handleSubmit = async (e: React.FormEvent) => {
   e.preventDefault();
   if (!validateStep2()) return;

   setIsSubmitting(true);
   try {
     await createAccount({
       fullName: formData.fullName.trim(),
       email: formData.email.trim(),
       phone: formData.phone.trim(),
       country: formData.country,
       password: formData.password,
     });

     toast.success("Account created! Please verify your email.");
     navigate(SCREENS.DASHBOARD);
   } catch (err) {
     if (err instanceof AuthError) {
       // Map specific errors to inline field errors where appropriate
       if (err.code === "auth/email-already-in-use") {
         setErrors((prev) => ({ ...prev, email: err.message }));
       } else if (err.code === "auth/weak-password") {
         setErrors((prev) => ({ ...prev, password: err.message }));
       }
       toast.error(err.message);
     } else {
       toast.error("Failed to create account. Please try again.");
     }
   } finally {
     setIsSubmitting(false);
   }
 };

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
            Build wealth with{" "}
            <span className="bg-gradient-to-r from-emerald-400 to-cyan-400 bg-clip-text text-transparent">
              confidence
            </span>{" "}
            and precision.
          </>
        }
        description="Join over 120,000 investors worldwide who trust Vertex Capital for institutional-grade crypto and traditional asset management."
      />

      <main className="flex w-full lg:w-1/2 xl:w-[45%] items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md">
          <MobileLogo />

          <div className="mb-8">
            <h2 className="text-3xl font-bold tracking-tight text-white">
              Create your account
            </h2>
            <p className="mt-2 text-slate-400">
              Start your investment journey in under 2 minutes.
            </p>
          </div>

          {/* Step indicator */}
          <div className="mb-8 flex items-center gap-3">
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step >= 1
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                {step > 1 ? <Check className="h-4 w-4" /> : "1"}
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= 1 ? "text-white" : "text-slate-500"
                }`}
              >
                Personal info
              </span>
            </div>
            <div className="h-px flex-1 bg-slate-800" />
            <div className="flex items-center gap-2">
              <div
                className={`flex h-8 w-8 items-center justify-center rounded-full text-sm font-semibold transition-all ${
                  step >= 2
                    ? "bg-emerald-500 text-slate-950"
                    : "bg-slate-800 text-slate-500"
                }`}
              >
                2
              </div>
              <span
                className={`text-sm font-medium ${
                  step >= 2 ? "text-white" : "text-slate-500"
                }`}
              >
                Security
              </span>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5" noValidate>
            {step === 1 && (
              <>
                <Field
                  label="Full name"
                  icon={<User className="h-4 w-4" />}
                  error={errors.fullName}
                >
                  <input
                    type="text"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    placeholder="John Doe"
                    className={inputClass(!!errors.fullName)}
                  />
                </Field>

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
                    className={inputClass(!!errors.email)}
                  />
                </Field>

                <Field
                  label="Country of residence"
                  icon={<Globe className="h-4 w-4" />}
                  error={errors.country}
                >
                  <select
                    name="country"
                    value={formData.country}
                    onChange={handleChange}
                    className={inputClass(!!errors.country)}
                  >
                    <option value="">Select your country</option>
                    {COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </Field>

                <Field
                  label="Phone number"
                  icon={<Phone className="h-4 w-4" />}
                  error={errors.phone}
                >
                  <input
                    type="tel"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    placeholder="+1 555 000 0000"
                    className={inputClass(!!errors.phone)}
                  />
                </Field>

                <button
                  type="button"
                  onClick={handleNext}
                  className="group flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 hover:brightness-110"
                >
                  Continue
                  <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                </button>
              </>
            )}

            {step === 2 && (
              <>
                <Field
                  label="Password"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.password}
                  trailing={
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="text-slate-400 hover:text-white transition"
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
                    placeholder="Create a strong password"
                    className={inputClass(!!errors.password)}
                  />
                </Field>

                {formData.password && (
                  <div className="space-y-2 -mt-2">
                    <div className="flex gap-1.5">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-all ${
                            i <= passwordStrength.score
                              ? passwordStrength.color
                              : "bg-slate-800"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">
                        Strength:{" "}
                        <span className="text-white font-medium">
                          {passwordStrength.label}
                        </span>
                      </span>
                      <span className="text-slate-500">
                        {formData.password.length} characters
                      </span>
                    </div>
                  </div>
                )}

                <Field
                  label="Confirm password"
                  icon={<Lock className="h-4 w-4" />}
                  error={errors.confirmPassword}
                  trailing={
                    <button
                      type="button"
                      onClick={() =>
                        setShowConfirmPassword(!showConfirmPassword)
                      }
                      className="text-slate-400 hover:text-white transition"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="h-4 w-4" />
                      ) : (
                        <Eye className="h-4 w-4" />
                      )}
                    </button>
                  }
                >
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="confirmPassword"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    placeholder="Re-enter your password"
                    className={inputClass(!!errors.confirmPassword)}
                  />
                </Field>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <div className="relative mt-0.5">
                    <input
                      type="checkbox"
                      name="agreeTerms"
                      checked={formData.agreeTerms}
                      onChange={handleChange}
                      className="peer sr-only"
                    />
                    <div className="h-5 w-5 rounded-md border border-slate-700 bg-slate-900 transition peer-checked:border-emerald-500 peer-checked:bg-emerald-500 flex items-center justify-center">
                      {formData.agreeTerms && (
                        <Check
                          className="h-3 w-3 text-slate-950"
                          strokeWidth={3}
                        />
                      )}
                    </div>
                  </div>
                  <span className="text-sm text-slate-400 leading-relaxed">
                    I agree to the{" "}
                    <a
                      href="#"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a
                      href="#"
                      className="text-emerald-400 hover:text-emerald-300"
                    >
                      Privacy Policy
                    </a>
                    .
                  </span>
                </label>
                {errors.agreeTerms && (
                  <p className="text-xs text-red-400 flex items-center gap-1 -mt-3">
                    <AlertCircle className="h-3 w-3" />
                    {errors.agreeTerms}
                  </p>
                )}

                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="flex-1 rounded-xl border border-slate-800 bg-slate-900/50 px-6 py-3.5 text-sm font-semibold text-slate-300 transition hover:bg-slate-800 hover:text-white"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="group flex flex-[2] items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-emerald-500 to-cyan-500 px-6 py-3.5 text-sm font-semibold text-slate-950 shadow-lg shadow-emerald-500/20 transition hover:shadow-emerald-500/40 hover:brightness-110 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Creating account...
                      </>
                    ) : (
                      <>
                        Create account
                        <ArrowRight className="h-4 w-4 transition group-hover:translate-x-1" />
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </form>

          <div className="my-8 flex items-center gap-4">
            <div className="h-px flex-1 bg-slate-800" />
            <span className="text-xs uppercase tracking-wider text-slate-500">
              or continue with
            </span>
            <div className="h-px flex-1 bg-slate-800" />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <SocialButton label="Google" action="signup">
              <GoogleIcon />
            </SocialButton>
            <SocialButton label="Apple" action="signup">
              <AppleIcon />
            </SocialButton>
            <SocialButton label="GitHub" action="signup">
              <GitHubIcon />
            </SocialButton>
          </div>

          <p className="mt-10 text-center text-sm text-slate-400">
            Already have an account?{" "}
            <Link
              to={SCREENS.LOGIN}
              className="font-semibold text-emerald-400 hover:text-emerald-300 transition"
            >
              Sign in
            </Link>
          </p>
        </div>
      </main>
    </AuthLayout>
  );
};

export default CreateAccount;
