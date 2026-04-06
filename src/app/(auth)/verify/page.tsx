"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { signIn, getSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, CheckCircle2, XCircle, Info, Lock, ArrowUpRight, ShieldCheck } from "lucide-react";
import { Instrument_Serif } from "next/font/google";

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"], weight: ["400"], style: ["italic"],
});

type StatusType = "loading" | "success" | "error" | "info" | "password";

type StatusMessageProps = {
  status: StatusType;
  message: string;
  title?: string;
  countdown?: number;
  onActionClick?: () => void;
  actionLabel?: string;
  passwordProps?: {
    password: string;
    onPasswordChange: (value: string) => void;
    onPasswordSubmit: (e: React.FormEvent) => void;
    error?: string;
    isSubmitting?: boolean;
  };
};

function StatusMessage({
  status,
  message,
  title,
  countdown,
  onActionClick,
  actionLabel,
  passwordProps,
}: StatusMessageProps) {
  
  const getIcon = () => {
    switch (status) {
      case "loading": return <Loader2 size={28} className="text-white animate-spin" />;
      case "success": return <CheckCircle2 size={28} className="text-white" />;
      case "error":   return <XCircle size={28} className="text-white" />;
      case "password":return <Lock size={28} className="text-white" />;
      default:        return <Info size={28} className="text-white" />;
    }
  };

  const getIconBg = () => {
    switch (status) {
      case "loading": return "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-indigo-500/30";
      case "success": return "bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-emerald-500/30";
      case "error":   return "bg-gradient-to-br from-red-400 to-red-600 shadow-red-500/30";
      case "password":return "bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 shadow-indigo-500/30";
      default:        return "bg-gradient-to-br from-neutral-400 to-neutral-600 shadow-neutral-500/30";
    }
  };

  const getTextColor = () => {
    switch (status) {
      case "success": return "text-emerald-600 dark:text-emerald-400";
      case "error":   return "text-red-600 dark:text-red-400";
      default:        return "text-neutral-900 dark:text-white";
    }
  };

  return (
    <motion.div
      key={status}
      initial={{ opacity: 0, scale: 0.95, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 1.05, y: -10 }}
      transition={{ duration: 0.4, type: "spring", stiffness: 300, damping: 25 }}
      className="relative w-full max-w-md"
    >
      <div className="relative rounded-[2rem] border border-white/60 dark:border-white/10
        bg-white/40 dark:bg-neutral-900/30 backdrop-blur-[60px] shadow-2xl
        shadow-[0_8px_40px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">
        
        <div className="absolute -top-16 -left-16 w-52 h-52 rounded-full bg-gradient-to-br from-violet-400/10 via-fuchsia-400/8 to-transparent dark:from-violet-500/15 dark:to-transparent blur-2xl pointer-events-none" />

        <div className="px-8 py-10 flex flex-col items-center text-center">
            
            {/* Icon */}
            <motion.div 
              initial={{ scale: 0 }} 
              animate={{ scale: 1 }} 
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 shadow-lg ${getIconBg()}`}
            >
                {getIcon()}
             </motion.div>
             
             {/* Text */}
             <h2 className={`text-2xl tracking-tight font-medium mb-3 ${getTextColor()}`}>
                {title || (status === "password" ? "Verify Email" : "Verification")}
             </h2>
             <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6 leading-relaxed">
                {message}
             </p>

             {/* Password Form */}
             {status === "password" && passwordProps && (
                <form className="w-full flex flex-col gap-4" onSubmit={passwordProps.onPasswordSubmit} noValidate>
                    {passwordProps.error && (
                        <motion.div initial={{ opacity: 0, y: -5 }} animate={{ opacity: 1, y: 0 }}
                          className="p-3 rounded-lg text-red-600 dark:text-red-400 text-xs bg-red-500/10 border border-red-500/20 text-left">
                            {passwordProps.error}
                        </motion.div>
                    )}
                    <div className="relative text-left">
                        <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                        <input
                            type="password"
                            value={passwordProps.password}
                            onChange={(e) => passwordProps.onPasswordChange(e.target.value)}
                            placeholder="Enter your security password"
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all duration-300
                              bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                              placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                              focus:outline-none focus:ring-2 disabled:opacity-50
                              border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30
                              focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"
                            disabled={passwordProps.isSubmitting}
                            autoFocus
                        />
                    </div>
                    <motion.button
                        type="submit"
                        disabled={passwordProps.isSubmitting || !passwordProps.password || passwordProps.password.length < 6}
                        whileHover={!(passwordProps.isSubmitting || !passwordProps.password || passwordProps.password.length < 6) ? { scale: 1.02 } : {}}
                        whileTap={!(passwordProps.isSubmitting || !passwordProps.password || passwordProps.password.length < 6) ? { scale: 0.98 } : {}}
                        className="relative flex items-center justify-center gap-2 w-full px-6 py-3.5 rounded-xl
                          bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold overflow-hidden
                          shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300
                          disabled:opacity-60 disabled:cursor-not-allowed group mt-2 border border-white/20 dark:border-white/10"
                    >
                        <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                        <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                            {passwordProps.isSubmitting ? (
                                <><Loader2 size={15} className="animate-spin" /> Verifying...</>
                            ) : (
                                <><ShieldCheck size={15} /> Verify & Log In</>
                            )}
                        </span>
                    </motion.button>
                </form>
             )}

             {/* Success Countdown */}
             {status === "success" && typeof countdown === "number" && countdown > 0 && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-2 px-5 py-2.5 rounded-full bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-200 dark:border-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-semibold flex items-center justify-center gap-2">
                   <Loader2 size={13} className="animate-spin" />
                   Redirecting in {countdown}...
                </motion.div>
             )}

             {/* Error/Action Button */}
             {onActionClick && actionLabel && status !== "password" && (
              <motion.button
                 whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}
                 onClick={onActionClick}
                 className="mt-6 relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl
                   bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold overflow-hidden
                   shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300
                   group border border-white/20 dark:border-white/10"
              >
                 <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                 <span className="relative z-10 flex items-center gap-2 group-hover:text-white transition-colors duration-300">
                   {actionLabel} <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                 </span>
              </motion.button>
             )}
        </div>
      </div>
    </motion.div>
  );
}

function VerifyContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");
  const email = searchParams.get("email");

  const [status, setStatus] = useState<StatusType>("loading");
  const [title, setTitle] = useState<string>("Authenticating");
  const [message, setMessage] = useState<string>("Validating verification link...");
  const [password, setPassword] = useState<string>("");
  const [passwordError, setPasswordError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [redirectTimer, setRedirectTimer] = useState<number>(3);

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) router.push("/");
    }
    checkSession();
  }, [router]);

  // Validate token on load
  useEffect(() => {
    if (!token || !email) {
      setStatus("error");
      setTitle("Invalid Link");
      setMessage("Missing verification token or email. Please check the link in your inbox again.");
      return;
    }

    async function validateToken() {
      try {
        const res = await fetch(
          `/api/auth/verify?email=${encodeURIComponent(email as string)}&token=${encodeURIComponent(token as string)}`
        );
        const data = await res.json();

        if (!res.ok) throw new Error(data.error || "Verification link is invalid or has expired.");

        setStatus("password");
        setTitle("Final Step");
        setMessage(data.message || "Please enter your password to confirm your identity and verify your email.");
      } catch (err: unknown) {
        setStatus("error");
        setTitle("Verification Failed");
        setMessage(err instanceof Error ? err.message : "Verification link is invalid.");
      }
    }

    validateToken();
  }, [email, token]);

  // Auto-clear password error
  useEffect(() => {
    if (passwordError) setPasswordError("");
  }, [password]);

  // Handle redirect after success
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

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || password.length < 6) {
      setPasswordError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/auth/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, token, password }),
      });
      const data = await res.json();

      if (!res.ok) {
        setPasswordError(data.error || "Verification failed.");
        setIsSubmitting(false);
        return;
      }

      const result = await signIn("credentials", { identifier: email, password, redirect: false });

      if (result?.error) {
        setPasswordError("Verification succeeded, but login failed. Please try logging in manually.");
        setIsSubmitting(false);
      } else if (result?.ok) {
        setStatus("success");
        setTitle("Email Verified!");
        setMessage("Your account has been successfully verified. You are now logged in.");
        setRedirectTimer(3);
      } else {
        setPasswordError("An unexpected error occurred. Please try logging in manually.");
        setIsSubmitting(false);
      }
    } catch {
      setPasswordError("An unexpected error occurred on the server. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <AnimatePresence mode="wait">
      <StatusMessage
        status={status}
        title={title}
        message={message}
        countdown={redirectTimer}
        actionLabel={status === "error" ? "Back to Sign In" : undefined}
        onActionClick={status === "error" ? () => router.push("/login") : undefined}
        passwordProps={status === "password" ? {
          password,
          onPasswordChange: setPassword,
          onPasswordSubmit: handlePasswordSubmit,
          error: passwordError,
          isSubmitting,
        } : undefined}
      />
    </AnimatePresence>
  );
}

export default function VerifyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-sky-50 to-fuchsia-50 dark:from-indigo-950/50 dark:via-neutral-950 dark:to-fuchsia-950/50 flex items-center justify-center px-4 pt-24 pb-12 relative overflow-hidden">
      
      {/* Background Blobs (same as global auth aesthetic) */}
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

      <Suspense
        fallback={
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex flex-col items-center gap-4 text-neutral-500">
             <Loader2 size={24} className="animate-spin text-indigo-500" />
             <p className="text-sm font-medium">Loading secure environment...</p>
          </motion.div>
        }
      >
        <VerifyContent />
      </Suspense>
    </div>
  );
}
