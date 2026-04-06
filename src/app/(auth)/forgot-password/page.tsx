"use client";

import { useState, useEffect } from "react";
import { getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import {
  ArrowUpRight, Mail, Send,
  ArrowLeft, CheckCircle2, X, KeyRound,
} from "lucide-react";

// ─── Font ─────────────────────────────────────────────────────────────────────

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

// ─── Schema ───────────────────────────────────────────────────────────────────

const forgotSchema = z.object({
  identifier: z
    .string()
    .min(1, "Email or username is required")
    .refine(
      (val) =>
        val.includes("@")
          ? z.string().email().safeParse(val).success
          : val.length >= 3 && /^[a-zA-Z0-9_]+$/.test(val),
      "Enter a valid email or username"
    ),
});

type ForgotValues = z.infer<typeof forgotSchema>;

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

// ─── Success Modal ────────────────────────────────────────────────────────────

const SuccessModal = ({ identifier, onClose }: { identifier: string; onClose: () => void }) => (
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
          <Send size={26} className="text-white" />
        </motion.div>

        <div className="flex flex-col gap-1.5">
          <h2 className="text-xl font-semibold text-neutral-900 dark:text-white">Check your inbox</h2>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">
            If{" "}
            <span className="font-semibold text-neutral-700 dark:text-neutral-200 break-all">{identifier}</span>
            {" "}is linked to an account, you'll receive a reset link shortly.
          </p>
        </div>

        <div className="w-full flex items-start gap-3 px-4 py-3.5 rounded-2xl
          bg-indigo-50 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20">
          <CheckCircle2 size={15} className="text-indigo-500 dark:text-indigo-400 flex-shrink-0 mt-0.5" />
          <div className="flex flex-col gap-0.5 text-left">
            <p className="text-xs font-semibold text-indigo-700 dark:text-indigo-300">Didn't receive it?</p>
            <p className="text-xs text-indigo-600/70 dark:text-indigo-400/70">
              Check your spam folder. The link expires in 30 minutes.
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-2 w-full">
          <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
            <Link href="/login"
              className="flex items-center justify-center gap-2 w-full px-6 py-3 rounded-full
                bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold
                shadow-lg shadow-neutral-900/10 hover:shadow-xl transition-all duration-300 group">
              Back to Sign In
              <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
            </Link>
          </motion.div>
          <button onClick={onClose}
            className="text-xs text-neutral-400 dark:text-neutral-600 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors duration-200 py-1">
            Try a different email or username
          </button>
        </div>
      </div>
    </motion.div>
  </motion.div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ForgotPasswordPage() {
  const router = useRouter();

  const [isLoading,   setIsLoading]   = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [submittedId, setSubmittedId] = useState("");
  const [inlineError, setInlineError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<ForgotValues>({ resolver: zodResolver(forgotSchema) });

  const identifierValue = watch("identifier", "");

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) router.push("/");
    }
    checkSession();
  }, [router]);

  const onSubmit = async (data: ForgotValues) => {
    setIsLoading(true);
    setInlineError("");

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: data.identifier }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result?.error || "Something went wrong");
      }

      setSubmittedId(data.identifier);
      setShowSuccess(true);
    } catch (error: any) {
      setInlineError(error.message || "Failed to send reset link.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <AnimatePresence>
        {showSuccess && (
          <SuccessModal identifier={submittedId} onClose={() => setShowSuccess(false)} />
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
          {/* Card */}
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
              <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                Reset your{" "}
                <span className={`${instrumentSerif.className} bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent`}>
                  password
                </span>
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2 leading-relaxed">
                Enter your email or username and we'll send you a reset link.
              </p>
            </div>

            {/* Body */}
            <form onSubmit={handleSubmit(onSubmit)} className="px-8 py-7 flex flex-col gap-5" noValidate>

              {inlineError && (
                <div className="p-3 rounded-lg text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20">
                  {inlineError}
                </div>
              )}

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                  Email or Username <span className="text-indigo-500">*</span>
                </label>
                <div className="relative">
                  <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                  <input
                    {...register("identifier")}
                    type="text"
                    placeholder="john@example.com or johndoe"
                    autoComplete="email username"
                    className={`w-full pl-10 pr-4 py-3 rounded-xl text-sm border transition-all duration-300
                      bg-white/60 dark:bg-black/40 backdrop-blur-xl shadow-inner text-neutral-900 dark:text-white
                      placeholder:text-neutral-500 dark:placeholder:text-neutral-500
                      focus:outline-none focus:ring-2 disabled:opacity-50
                      ${errors.identifier
                        ? "border-red-400/50 dark:border-red-500/50 focus:ring-red-500/30 focus:shadow-[0_0_15px_rgba(239,68,68,0.3)]"
                        : "border-white/60 dark:border-white/10 focus:border-indigo-400 focus:ring-indigo-500/30 focus:shadow-[0_0_20px_rgba(99,102,241,0.4)] dark:focus:border-indigo-500"}`}
                  />
                </div>
                <FieldError message={errors.identifier?.message} />
                {!errors.identifier && identifierValue.length > 0 && (
                  <p className="text-[11px] text-neutral-400 dark:text-neutral-600">
                    We'll only send a link if this matches a registered account.
                  </p>
                )}
              </div>

              {/* Submit */}
              <motion.button
                type="submit"
                disabled={isLoading}
                whileHover={!isLoading ? { scale: 1.02 } : {}}
                whileTap={!isLoading ? { scale: 0.98 } : {}}
                className="relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl
                  bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold overflow-hidden
                  shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300
                  disabled:opacity-60 disabled:cursor-not-allowed group border border-white/20 dark:border-white/10"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                <AnimatePresence mode="wait">
                  {isLoading ? (
                    <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2">
                      <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                        className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full" />
                      Sending reset link…
                    </motion.span>
                  ) : (
                    <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2">
                      <Send size={15} />
                      Send Reset Link
                      <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>

              {/* Back link */}
              <div className="flex justify-center pt-1">
                <Link href="/login"
                  className="flex items-center gap-1.5 text-xs font-semibold
                    text-neutral-400 dark:text-neutral-600
                    hover:text-neutral-700 dark:hover:text-neutral-300
                    transition-colors duration-200 group">
                  <ArrowLeft size={13} className="group-hover:-translate-x-0.5 transition-transform duration-200" />
                  Back to Sign In
                </Link>
              </div>

            </form>
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
            Remember your password?{" "}
            <Link href="/login" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200">
              Sign in instead →
            </Link>
          </p>
        </motion.div>
      </div>
    </>
  );
}
