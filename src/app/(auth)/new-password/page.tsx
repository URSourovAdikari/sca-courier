"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import {
  Lock, KeyRound, Eye, EyeOff, ArrowUpRight, ShieldCheck, ArrowLeft, Loader2, CheckCircle2
} from "lucide-react";

// ─── Font ─────────────────────────────────────────────────────────────────────

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"], weight: ["400"], style: ["italic"],
});

// ─── Schema ───────────────────────────────────────────────────────────────────

const newPasswordSchema = z.object({
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
  confirmPassword: z.string().min(1, "Confirm Password is required"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type NewPasswordValues = z.infer<typeof newPasswordSchema>;

// ─── Field Error ──────────────────────────────────────────────────────────────

const FieldError = ({ message }: { message?: string }) => (
  <AnimatePresence>
    {message && (
      <motion.p
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -6 }}
        transition={{ duration: 0.2 }}
        className="text-xs text-red-500 dark:text-red-400 mt-1 flex items-center gap-1"
      >
        <span className="w-1 h-1 rounded-full bg-red-500 dark:bg-red-400 flex-shrink-0" />
        {message}
      </motion.p>
    )}
  </AnimatePresence>
);

// ─── Password Strength ────────────────────────────────────────────────────────

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const checks = [
    { label: "8+ characters",     pass: password.length >= 8          },
    { label: "Uppercase letter",  pass: /[A-Z]/.test(password)        },
    { label: "Number",            pass: /[0-9]/.test(password)        },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score   = checks.filter((c) => c.pass).length;
  const labels  = ["Weak", "Fair", "Good", "Strong"];
  const barClrs = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const txtClrs = ["text-red-500", "text-orange-500", "text-yellow-500", "text-emerald-500"];

  return (
    <motion.div
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: "auto" }}
      className="mt-2 flex flex-col gap-2"
    >
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1 h-1.5">
          {[0,1,2,3].map((i) => (
            <div key={i}
              className={`flex-1 rounded-full transition-colors duration-300
                ${i < score ? barClrs[score - 1] : "bg-neutral-200 dark:bg-neutral-700"}`}
            />
          ))}
        </div>
        <span className={`text-[11px] font-semibold min-w-[40px] text-right ${txtClrs[score - 1] ?? "text-neutral-400"}`}>
          {labels[score - 1] ?? ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(({ label, pass }) => (
          <div key={label} className={`flex items-center gap-1 text-[11px] transition-colors duration-200
            ${pass ? "text-emerald-500 dark:text-emerald-400" : "text-neutral-400 dark:text-neutral-500"}`}>
            <CheckCircle2 size={10} className="flex-shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
};

// ─── Component ──────────────────────────────────────────────────────────────────

function NewPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email");
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"verifying" | "valid" | "invalid" | "submitting" | "success" | "logging-in" | "error">("verifying");
  const [message, setMessage] = useState<string>("Verifying reset token...");
  const [redirectTimer, setRedirectTimer] = useState<number>(5);
  const [formError, setFormError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) router.push("/");
    }
    checkSession();
  }, [router]);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<NewPasswordValues>({
    resolver: zodResolver(newPasswordSchema),
    mode: "onChange",
  });

  const passwordValue = watch("password", "");

  const isSubmitting = status === "submitting" || status === "logging-in";

  // Verify token
  useEffect(() => {
    if (!email || !token) {
      setStatus("invalid");
      setMessage("Invalid reset link.");
      return;
    }

    async function verifyToken() {
      try {
        const res = await fetch("/api/auth/reset-password", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, token, action: "verify" }),
        });
        const data = await res.json();
        if (data.valid) setStatus("valid");
        else {
          setStatus("invalid");
          setMessage(data.message || "Reset link is invalid or expired.");
        }
      } catch (err: unknown) {
        setStatus("invalid");
        setMessage(err instanceof Error ? err.message : "Failed to verify token.");
      }
    }

    verifyToken();
  }, [email, token]);

  // Redirect after success
  useEffect(() => {
    if (status === "success") {
      if (redirectTimer <= 0) {
        router.push("/");
        return;
      }
      const timerId = setTimeout(() => setRedirectTimer((prev) => prev - 1), 1000);
      return () => clearTimeout(timerId);
    }
  }, [status, redirectTimer, router]);

  async function onSubmit(data: NewPasswordValues) {
    if (!email || !token) {
      setStatus("error");
      setMessage("Missing email or token.");
      return;
    }

    setStatus("submitting");
    setFormError(null);

    try {
      const resetRes = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password: data.password, action: "reset" }),
      });

      if (!resetRes.ok) {
        const errorData = await resetRes.json();
        throw new Error(errorData.error || "Failed to reset password");
      }

      setStatus("logging-in");
      setMessage("Password updated! Logging you in...");

      const result = await signIn("credentials", {
        identifier: email,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        setStatus("error");
        setMessage("Password updated successfully, but automatic login failed. Please log in manually.");
        setTimeout(() => router.push("/login"), 3000);
      } else if (result?.ok) {
        setStatus("success");
        setMessage("Password updated! Redirecting to dashboard...");
        setRedirectTimer(3);
      } else {
        setStatus("error");
        setMessage("An unexpected error occurred. Please log in manually.");
        setTimeout(() => router.push("/login"), 3000);
      }
    } catch (err: unknown) {
      const serverError = err instanceof Error ? err.message : "Failed to reset password.";
      setFormError(serverError);
      setStatus("valid");
    }
  }

  // ── While verifying: show only spinner, not the card ──────────────────────
  if (status === "verifying") {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{message}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-fuchsia-50 dark:from-indigo-950/50 dark:via-neutral-950 dark:to-fuchsia-950/50 flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      {/* Blobs */}
      <div aria-hidden="true" className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute -top-1/4 -right-1/4 w-[80vw] max-w-[800px] aspect-square rounded-full
          bg-gradient-to-bl from-indigo-300/60 via-violet-300/40 to-transparent
          dark:from-indigo-600/40 dark:via-violet-600/20 dark:to-transparent blur-[120px]" />
        <div className="absolute -bottom-1/4 -left-1/4 w-[80vw] max-w-[800px] aspect-square rounded-full
          bg-gradient-to-tr from-fuchsia-300/60 via-rose-300/30 to-transparent
          dark:from-fuchsia-600/40 dark:via-rose-600/20 dark:to-transparent blur-[120px]" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[60vw] max-w-[600px] aspect-square rounded-full
          bg-gradient-to-r from-blue-200/40 to-cyan-200/40
          dark:from-blue-600/20 dark:to-cyan-600/20 blur-[100px]" />
        <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05]"
          style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='300' height='300'%3E%3Cfilter id='a'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.75' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='300' height='300' filter='url(%23a)' opacity='1'/%3E%3C/svg%3E")` }} />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 32 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="relative w-full max-w-md z-10"
      >
        <div className="relative rounded-[2rem] border border-white/60 dark:border-white/10
          bg-white/40 dark:bg-neutral-900/30 backdrop-blur-[60px] shadow-2xl
          shadow-[0_8px_40px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">

          <div className="absolute -bottom-16 -right-16 w-52 h-52 rounded-full
            bg-gradient-to-tl from-indigo-400/10 via-violet-400/8 to-transparent
            dark:from-indigo-500/15 dark:to-transparent blur-2xl pointer-events-none" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center mb-4
              bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500
              shadow-lg shadow-indigo-500/20">
              <KeyRound size={20} className="text-white" />
            </div>
            
            {(status === "valid" || status === "submitting" || status === "logging-in") && (
              <>
                <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                  Set new{" "}
                  <span className={`${instrumentSerif.className} bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent`}>
                    password
                  </span>
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Please enter a strong password below.
                </p>
              </>
            )}
            {(status === "success") && (
              <>
                <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                  Password{" "}
                  <span className={`${instrumentSerif.className} bg-gradient-to-r from-emerald-500 to-emerald-400 bg-clip-text text-transparent`}>
                    updated!
                  </span>
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  Your password has been successfully reset.
                </p>
              </>
            )}
            {(status === "invalid" || status === "error") && (
              <>
                <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                  Invalid{" "}
                  <span className={`${instrumentSerif.className} text-red-500`}>
                    link
                  </span>
                </h1>
                <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                  The password reset link is invalid or expired.
                </p>
              </>
            )}
          </div>

          {/* Body */}
          <div className="px-8 py-7 flex flex-col gap-5">

            {(status === "invalid" || status === "error") && (
              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-xl text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20 text-center">
                  {message}
                </div>
                <Link href="/forgot-password"
                  className="relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-full
                    bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold overflow-hidden
                    shadow-lg shadow-neutral-900/10 dark:shadow-white/10 hover:shadow-xl transition-all duration-300 group">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <span className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                    Request New Link
                    <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                  </span>
                </Link>
              </div>
            )}

            {status === "success" && (
              <div className="flex flex-col gap-6">
                <div className="p-4 rounded-xl text-emerald-600 dark:text-emerald-400 text-sm bg-emerald-500/10 border border-emerald-500/20 text-center">
                  {message}
                  <div className="mt-2 text-xs font-semibold">Redirecting in {redirectTimer}s...</div>
                </div>
                <Link href="/login"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full
                    bg-white dark:bg-neutral-900 text-neutral-900 dark:text-white border border-neutral-200 dark:border-neutral-700
                    text-sm font-semibold hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-300">
                  Go to Sign In
                </Link>
              </div>
            )}

            {(status === "valid" || status === "submitting" || status === "logging-in") && (
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>
                {/* Form Error */}
                {formError && (
                  <div className="p-3 rounded-lg text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20">
                    {formError}
                  </div>
                )}

                {/* Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    New Password <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      disabled={isSubmitting}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition-all duration-300
                        bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                        placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 disabled:opacity-50
                        ${errors.password
                          ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      disabled={isSubmitting}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200 disabled:opacity-50">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={showPassword ? "hide" : "show"}
                          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }} className="flex">
                          {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                  <FieldError message={errors.password?.message} />
                  <PasswordStrength password={passwordValue} />
                </div>

                {/* Confirm Password Input */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Confirm Password <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("confirmPassword")}
                      type={showConfirmPassword ? "text" : "password"}
                      disabled={isSubmitting}
                      placeholder="••••••••"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition-all duration-300
                        bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                        placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 disabled:opacity-50
                        ${errors.confirmPassword
                          ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                    />
                    <button type="button" onClick={() => setShowConfirmPassword((v) => !v)}
                      disabled={isSubmitting}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors duration-200 disabled:opacity-50">
                      <AnimatePresence mode="wait" initial={false}>
                        <motion.span key={showConfirmPassword ? "hide" : "show"}
                          initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
                          transition={{ duration: 0.15 }} className="flex">
                          {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                        </motion.span>
                      </AnimatePresence>
                    </button>
                  </div>
                  <FieldError message={errors.confirmPassword?.message} />
                </div>

                {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isSubmitting}
                    whileHover={!isSubmitting ? { scale: 1.02 } : {}}
                    whileTap={!isSubmitting ? { scale: 0.98 } : {}}
                    className="relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl
                      bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold overflow-hidden
                      shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300
                      disabled:opacity-60 disabled:cursor-not-allowed group mt-2 border border-white/20 dark:border-white/10"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <AnimatePresence mode="wait">
                    {isSubmitting ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-inherit rounded-full" />
                        {status === "logging-in" ? "Logging in..." : "Updating..."}
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                        <ShieldCheck size={15} />
                        Reset Password
                        <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            )}

          </div>

          <div className="px-8 pb-8 flex justify-center border-t border-neutral-100 dark:border-neutral-800 pt-6">
            <Link href="/login"
              className="flex items-center gap-1.5 text-xs font-semibold
                text-neutral-400 dark:text-neutral-600
                hover:text-neutral-700 dark:hover:text-neutral-300
                transition-colors duration-200 group">
              <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
              Back to Sign In
            </Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function NewPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
        </div>
      }
    >
      <NewPasswordContent />
    </Suspense>
  );
}

