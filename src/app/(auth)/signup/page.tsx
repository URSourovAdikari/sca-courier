"use client";

import { useState, useEffect, useRef } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import {
  Eye, EyeOff, ArrowUpRight, Sparkles,
  Mail, Lock, User, AtSign,
  CheckCircle2, XCircle, Loader2,
  UserPlus, X, Send,
} from "lucide-react";

// ─── Font ─────────────────────────────────────────────────────────────────────

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

// ─── Schema ───────────────────────────────────────────────────────────────────

const signUpSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(60, "Name is too long")
    .regex(/^[a-zA-Z\s'-]+$/, "Only letters, spaces, hyphens and apostrophes"),
  email: z
    .string()
    .min(1, "Email is required")
    .email("Please enter a valid email address"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(20, "Username must be 20 characters or less")
    .regex(/^[a-z0-9_]+$/, "Only lowercase letters, numbers and underscores"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/[A-Z]/, "Must contain at least one uppercase letter")
    .regex(/[0-9]/, "Must contain at least one number")
    .regex(/[^a-zA-Z0-9]/, "Must contain at least one special character"),
});

type SignUpValues = z.infer<typeof signUpSchema>;
type CheckStatus = "idle" | "checking" | "available" | "taken";

// ─── Helpers ──────────────────────────────────────────────────────────────────

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

// Icon-only availability indicator — just the animated icon, no text
const AvailIcon = ({ status }: { status: CheckStatus }) => {
  if (status === "idle") return null;
  return (
    <AnimatePresence mode="wait">
      <motion.span
        key={status}
        initial={{ opacity: 0, scale: 0.6 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.6 }}
        transition={{ duration: 0.18 }}
        className="absolute right-3.5 top-1/2 -translate-y-1/2 flex items-center pointer-events-none"
      >
        {status === "checking"  && <Loader2  size={15} className="animate-spin text-neutral-400 dark:text-neutral-500" />}
        {status === "available" && <CheckCircle2 size={15} className="text-emerald-500 dark:text-emerald-400" />}
        {status === "taken"     && <XCircle  size={15} className="text-red-500 dark:text-red-400" />}
      </motion.span>
    </AnimatePresence>
  );
};

// ─── Password Strength ────────────────────────────────────────────────────────

const PasswordStrength = ({ password }: { password: string }) => {
  if (!password) return null;
  const checks = [
    { label: "6+ characters",     pass: password.length >= 6          },
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

// ─── Or Divider ───────────────────────────────────────────────────────────────

const OrDivider = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
    <span className="text-xs font-medium text-neutral-400 dark:text-neutral-600 whitespace-nowrap">
      or continue with
    </span>
    <div className="flex-1 h-px bg-neutral-200 dark:bg-neutral-800" />
  </div>
);

// ─── OAuth Buttons ────────────────────────────────────────────────────────────

const OAuthButtons = ({ isAnyLoading, handleGoogleSignUp, handleGitHubSignUp }: any) => (
  <div className="grid grid-cols-2 gap-3">
      <motion.button
        type="button"
        disabled={isAnyLoading}
        whileHover={!isAnyLoading ? { scale: 1.02, y: -1 } : {}}
        whileTap={!isAnyLoading ? { scale: 0.97 } : {}}
        onClick={handleGoogleSignUp}
        className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-black/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
      >
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      Google
    </motion.button>

    <motion.button
      type="button"
      disabled={isAnyLoading}
      whileHover={!isAnyLoading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isAnyLoading ? { scale: 0.97 } : {}}
      onClick={handleGitHubSignUp}
      className="flex items-center justify-center gap-2.5 px-4 py-3 rounded-xl border border-white/60 dark:border-white/10 bg-white/60 dark:bg-black/40 backdrop-blur-xl text-neutral-700 dark:text-neutral-300 text-sm font-semibold hover:shadow-lg hover:shadow-indigo-500/10 dark:hover:shadow-black/40 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
      GitHub
    </motion.button>
  </div>
);

// ─── Success Modal ────────────────────────────────────────────────────────────

const SuccessModal = ({ name, email, onClose }: { name: string; email: string; onClose: () => void }) => (
  <motion.div
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    className="fixed inset-0 z-[80] flex items-center justify-center px-4"
  >
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 bg-black/40 backdrop-blur-sm"
      onClick={onClose}
    />
    <motion.div
      initial={{ opacity: 0, scale: 0.88, y: 24 }}
      animate={{ opacity: 1, scale: 1,    y: 0  }}
      exit={{   opacity: 0, scale: 0.88,  y: 24 }}
      transition={{ type: "spring", stiffness: 320, damping: 28 }}
      className="relative w-full max-w-sm rounded-3xl overflow-hidden
        bg-white dark:bg-neutral-900
        border border-neutral-200 dark:border-neutral-700
        shadow-2xl shadow-black/20"
    >
      <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full
        bg-gradient-to-br from-indigo-400/20 via-violet-400/15 to-fuchsia-400/10
        dark:from-indigo-500/25 dark:via-violet-500/20 dark:to-fuchsia-500/15
        blur-2xl pointer-events-none" />
      <button onClick={onClose} aria-label="Close"
        className="absolute top-4 right-4 p-1.5 rounded-full z-10
          text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300
          hover:bg-neutral-100 dark:hover:bg-white/5 transition-all duration-200">
        <X size={15} />
      </button>
      <div className="relative p-8 flex flex-col items-center text-center gap-5">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.15 }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center
            bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500
            shadow-lg shadow-indigo-500/30"
        >
          <CheckCircle2 size={28} className="text-white" />
        </motion.div>
        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Account created!</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            Welcome aboard, <span className="font-semibold text-neutral-700 dark:text-neutral-200">{name}</span>! 🎉
          </p>
        </div>
        <div className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl
          bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
          <Send size={15} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-left">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Check your inbox</p>
            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70 break-all">
              We sent a verification link to <span className="font-semibold">{email}</span>.
            </p>
          </div>
        </div>
        <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} className="w-full">
          <Link href="/login"
            className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full
              bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold
              shadow-lg shadow-neutral-900/10 hover:shadow-xl transition-all duration-300 group">
            Go to Sign In
            <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
          </Link>
        </motion.div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignUpPage() {
  const router = useRouter();

  const [showPassword,   setShowPassword]   = useState(false);
  const [isLoading,      setIsLoading]      = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const [showSuccess,    setShowSuccess]    = useState(false);
  const [submittedName,  setSubmittedName]  = useState("");
  const [submittedEmail, setSubmittedEmail] = useState("");
  
  const [emailStatus,    setEmailStatus]    = useState<CheckStatus>("idle");
  const [usernameStatus, setUsernameStatus] = useState<CheckStatus>("idle");
  const [inlineError,    setInlineError]    = useState("");

  const emailTimer    = useRef<NodeJS.Timeout | undefined>(undefined);
  const usernameTimer = useRef<NodeJS.Timeout | undefined>(undefined);

  const isAnyLoading = isLoading || isGitHubLoading || isGoogleLoading;

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema), mode: "onChange" });

  const passwordValue = watch("password", "");
  const emailValue    = watch("email",    "");
  const usernameValue = watch("username", "");

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) router.push("/");
    }
    checkSession();
  }, [router]);

  // Email availability check
  useEffect(() => {
    clearTimeout(emailTimer.current);
    if (!emailValue || errors.email) { setEmailStatus("idle"); return; }
    setEmailStatus("checking");
    emailTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-email?email=${encodeURIComponent(emailValue)}`);
        const data = await res.json();
        setEmailStatus(data.available ? "available" : "taken");
      } catch {
        setEmailStatus("idle");
      }
    }, 600);
    return () => clearTimeout(emailTimer.current);
  }, [emailValue, errors.email]);

  // Username availability check
  useEffect(() => {
    clearTimeout(usernameTimer.current);
    if (!usernameValue || usernameValue.length < 3 || errors.username) { setUsernameStatus("idle"); return; }
    setUsernameStatus("checking");
    usernameTimer.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/check-username?username=${encodeURIComponent(usernameValue)}`);
        const data = await res.json();
        setUsernameStatus(data.available ? "available" : "taken");
      } catch {
        setUsernameStatus("idle");
      }
    }, 600);
    return () => clearTimeout(usernameTimer.current);
  }, [usernameValue, errors.username]);

  const onSubmit = async (data: SignUpValues) => {
    if (isAnyLoading || emailStatus === "taken" || usernameStatus === "taken") return;
    
    setIsLoading(true);
    setInlineError("");

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        // Notice we map 'name' to 'fullName' to match our backend API hook.
        body: JSON.stringify({
          fullName: data.name,
          email: data.email,
          username: data.username,
          password: data.password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData?.error || "Registration failed");
      }

      setSubmittedName(data.name.split(" ")[0]);
      setSubmittedEmail(data.email);
      setShowSuccess(true);
    } catch (error: any) {
      setInlineError(error.message || "Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGitHubSignUp() {
    setIsGitHubLoading(true);
    await signIn("github", { callbackUrl: "/" });
  }

  async function handleGoogleSignUp() {
    setIsGoogleLoading(true);
    await signIn("google", { callbackUrl: "/" });
  }

  // Border color helper
  const inputBorder = (err: boolean, status?: CheckStatus) => {
    if (err) return "border-red-400 dark:border-red-500 focus:border-red-400";
    if (status === "available") return "border-emerald-400 dark:border-emerald-500 focus:border-emerald-400";
    if (status === "taken")     return "border-red-400 dark:border-red-500 focus:border-red-400";
    return "border-neutral-200 dark:border-neutral-700 focus:border-indigo-400 dark:focus:border-indigo-500";
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal
            name={submittedName}
            email={submittedEmail}
            onClose={() => setShowSuccess(false)}
          />
        )}
      </AnimatePresence>

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
          className="relative w-full max-w-md"
        >
            <div className="relative rounded-[2rem] border border-white/60 dark:border-white/10
              bg-white/40 dark:bg-neutral-900/30 backdrop-blur-[60px] shadow-2xl
              shadow-[0_8px_40px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">

            <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full
              bg-gradient-to-br from-violet-400/10 via-fuchsia-400/8 to-transparent
              dark:from-violet-500/15 dark:to-transparent blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                border border-violet-200 dark:border-violet-500/30
                bg-violet-50/80 dark:bg-violet-500/10
                text-violet-700 dark:text-violet-300
                text-xs font-semibold tracking-widest uppercase mb-4">
                <Sparkles size={10} className="text-violet-500 dark:text-violet-400" />
                Create Account
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                Join{" "}
                <span className={`${instrumentSerif.className} bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent`}>
                  SCA Universe
                </span>
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Already have an account?{" "}
                <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200">
                  Sign in →
                </Link>
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-7 flex flex-col gap-5">

              {/* OAuth */}
              <OAuthButtons
                isAnyLoading={isAnyLoading}
                handleGoogleSignUp={handleGoogleSignUp}
                handleGitHubSignUp={handleGitHubSignUp}
              />
              <OrDivider />

              {/* Inline Error */}
              {inlineError && (
                <div className="p-3 rounded-lg text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20">
                  {inlineError}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

                {/* Full name */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Full Name <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("name")}
                      type="text"
                      disabled={isAnyLoading}
                      placeholder="John Doe"
                      autoComplete="name"
                      className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all duration-300
                        bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                        placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 disabled:opacity-50
                        ${errors.name
                          ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                    />
                  </div>
                  <FieldError message={errors.name?.message} />
                </div>

                {/* Email */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Email Address <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("email")}
                      type="email"
                      disabled={isAnyLoading}
                      placeholder="john@example.com"
                      autoComplete="email"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm border transition-all duration-300
                        bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                        placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 disabled:opacity-50
                        ${errors.email || emailStatus === "taken"
                          ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : emailStatus === "available"
                          ? "border-emerald-400/50 dark:border-emerald-500/50 focus:ring-emerald-500/30 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                    />
                    {/* Icon-only indicator */}
                    <AvailIcon status={emailStatus} />
                  </div>
                  <FieldError message={
                    emailStatus === "taken"
                      ? "This email is already registered"
                      : errors.email?.message
                  } />
                </div>

                {/* Username */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Username <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <AtSign size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("username")}
                      type="text"
                      disabled={isAnyLoading}
                      placeholder="johndoe_99"
                      autoComplete="username"
                      className={`w-full pl-10 pr-10 py-3 rounded-xl text-sm border transition-all duration-300
                        bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                        placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 disabled:opacity-50
                        ${errors.username || usernameStatus === "taken"
                          ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : usernameStatus === "available"
                          ? "border-emerald-400/50 dark:border-emerald-500/50 focus:ring-emerald-500/30 focus:shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                          : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                    />
                    {/* Icon-only indicator */}
                    <AvailIcon status={usernameStatus} />
                  </div>
                  <FieldError message={
                    usernameStatus === "taken"
                      ? "This username is already taken"
                      : errors.username?.message
                  } />
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Password <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      disabled={isAnyLoading}
                      placeholder="••••••••"
                      autoComplete="new-password"
                      className={`w-full pl-10 pr-11 py-3 rounded-xl text-sm border transition-all duration-300
                        bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                        placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                        focus:outline-none focus:ring-2 disabled:opacity-50
                        ${errors.password
                          ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                          : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                    />
                    <button type="button" onClick={() => setShowPassword((v) => !v)}
                      disabled={isAnyLoading}
                      aria-label={showPassword ? "Hide password" : "Show password"}
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

                {/* Submit */}
                  <motion.button
                    type="submit"
                    disabled={isAnyLoading || emailStatus === "taken" || usernameStatus === "taken"}
                    whileHover={!(isAnyLoading || emailStatus === "taken" || usernameStatus === "taken") ? { scale: 1.02 } : {}}
                    whileTap={!(isAnyLoading || emailStatus === "taken" || usernameStatus === "taken") ? { scale: 0.98 } : {}}
                    className="relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl
                      bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold overflow-hidden
                      shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300
                      disabled:opacity-60 disabled:cursor-not-allowed group mt-1 border border-white/20 dark:border-white/10"
                  >
                    <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full" />
                        Creating account…
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2">
                        <UserPlus size={15} />
                        Sign up
                        <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
            By creating an account you agree to our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors duration-200">Privacy Policy</Link>
            {" "}and{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors duration-200">Terms of Service</Link>.
          </p>
        </motion.div>
      </div>
    </>
  );
}
