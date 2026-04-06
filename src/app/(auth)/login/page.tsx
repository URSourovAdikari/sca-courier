"use client";

import { useState, useEffect } from "react";
import { signIn, getSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Link from "next/link";
import { motion, AnimatePresence } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import { Eye, EyeOff, ArrowUpRight, Mail, Lock, LogIn } from "lucide-react";

// ─── Font ─────────────────────────────────────────────────────────────────────

const instrumentSerif = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["italic"],
});

// ─── Schema ───────────────────────────────────────────────────────────────────

const signInSchema = z.object({
  identifier: z
    .string()
    .min(3, "Must be at least 3 characters")
    .refine((val) => {
      if (val.includes("@")) {
        return z.string().email().safeParse(val).success;
      } else {
        return /^[a-zA-Z0-9_]+$/.test(val);
      }
    }, {
      message: "Enter a valid email or username"
    }),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

type SignInValues = z.infer<typeof signInSchema>;

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

// ─── Or Divider ───────────────────────────────────────────────────────────────

const OrDivider = () => (
  <div className="flex items-center gap-3">
    <div className="flex-1 h-px bg-neutral-900/10 dark:bg-white/10" />
    <span className="text-xs font-medium text-neutral-500 dark:text-neutral-400 whitespace-nowrap">
      or continue with
    </span>
    <div className="flex-1 h-px bg-neutral-900/10 dark:bg-white/10" />
  </div>
);

// ─── OAuth Buttons ────────────────────────────────────────────────────────────

const OAuthButtons = ({ isAnyLoading, handleGoogleSignIn, handleGitHubSignIn }: any) => (
  <div className="grid grid-cols-2 gap-4">
    <motion.button
      type="button"
      disabled={isAnyLoading}
      whileHover={!isAnyLoading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isAnyLoading ? { scale: 0.97 } : {}}
      onClick={handleGoogleSignIn}
      className="group relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-lg text-neutral-800 dark:text-neutral-200 text-sm font-medium hover:bg-white/40 dark:hover:bg-white/10 hover:border-white/50 dark:hover:border-white/20 hover:shadow-[0_0_20px_rgba(66,133,244,0.3)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden="true" className="relative z-10 transition-transform group-hover:scale-110 duration-300">
        <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/>
        <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
        <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
        <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
      </svg>
      <span className="relative z-10">Google</span>
    </motion.button>

    <motion.button
      type="button"
      disabled={isAnyLoading}
      whileHover={!isAnyLoading ? { scale: 1.02, y: -1 } : {}}
      whileTap={!isAnyLoading ? { scale: 0.97 } : {}}
      onClick={handleGitHubSignIn}
      className="group relative flex items-center justify-center gap-2.5 px-4 py-3 rounded-2xl border border-white/30 dark:border-white/10 bg-white/20 dark:bg-white/5 backdrop-blur-lg text-neutral-800 dark:text-neutral-200 text-sm font-medium hover:bg-white/40 dark:hover:bg-white/10 hover:border-white/50 dark:hover:border-white/20 hover:shadow-[0_0_20px_rgba(0,0,0,0.2)] dark:hover:shadow-[0_0_20px_rgba(255,255,255,0.2)] transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed overflow-hidden"
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/40 to-white/0 dark:from-white/10 dark:to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true" className="relative z-10 transition-transform group-hover:scale-110 duration-300">
        <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z"/>
      </svg>
      <span className="relative z-10">GitHub</span>
    </motion.button>
  </div>
);

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function SignInPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isGitHubLoading, setIsGitHubLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [inlineError, setInlineError] = useState("");
  const [modalOpen, setModalOpen] = useState(false);
  const [modalTitle, setModalTitle] = useState("");
  const [modalMessage, setModalMessage] = useState("");

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) });

  const isAnyLoading = isLoading || isGitHubLoading || isGoogleLoading;

  useEffect(() => {
    async function checkSession() {
      const session = await getSession();
      if (session) router.push("/");
    }
    checkSession();
  }, [router]);

  const onSubmit = async (data: SignInValues) => {
    if (isAnyLoading) return;
    setIsLoading(true);
    setInlineError("");

    try {
      const result = await signIn("credentials", {
        identifier: data.identifier,
        password: data.password,
        redirect: false,
      });

      if (result?.error) {
        if (result.error.toLowerCase().includes("verify your email")) {
          setModalTitle("Email Not Verified");
          const sentNew = result.error.toLowerCase().includes("new verification link");
          setModalMessage(
            sentNew
              ? "✅ A new verification link has been sent to your email.\nPlease check your inbox."
              : "🕓 A verification link has already been sent earlier.\nPlease check your inbox."
          );
          setModalOpen(true);
          reset();
        } else {
          setInlineError(result.error);
        }
      } else if (result?.ok) {
        reset();
        router.push("/");
        router.refresh();
      }
    } catch (error) {
      setInlineError("Something went wrong. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  async function handleGitHubSignIn() {
    setIsGitHubLoading(true);
    try {
      await signIn("github");
    } catch {
      setIsGitHubLoading(false);
    }
  }

  async function handleGoogleSignIn() {
    setIsGoogleLoading(true);
    try {
      await signIn("google");
    } catch {
      setIsGoogleLoading(false);
    }
  }

  return (
    <>
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
          {/* Card */}
          <div className="relative rounded-[2rem] border border-white/60 dark:border-white/10
            bg-white/40 dark:bg-neutral-900/30 backdrop-blur-[60px] shadow-2xl
            shadow-[0_8px_40px_0_rgba(31,38,135,0.15)] dark:shadow-[0_8px_40px_0_rgba(0,0,0,0.6)] overflow-hidden">

            <div className="absolute -top-16 -right-16 w-52 h-52 rounded-full
              bg-gradient-to-br from-indigo-400/10 via-violet-400/8 to-transparent
              dark:from-indigo-500/15 dark:to-transparent blur-2xl pointer-events-none" />

            {/* Header */}
            <div className="px-8 pt-8 pb-6 border-b border-neutral-100 dark:border-neutral-800">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full
                border border-indigo-200 dark:border-indigo-500/30
                bg-indigo-50/80 dark:bg-indigo-500/10
                text-indigo-700 dark:text-indigo-300
                text-xs font-semibold tracking-widest uppercase mb-4">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 dark:bg-indigo-400 animate-pulse" />
                Welcome Back
              </div>
              <h1 className="text-3xl font-medium tracking-tight text-neutral-900 dark:text-white">
                Sign in to{" "}
                <span className={`${instrumentSerif.className} bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent`}>
                  your account
                </span>
              </h1>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-2">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200">
                  Sign up free →
                </Link>
              </p>
            </div>

            {/* Body */}
            <div className="px-8 py-7 flex flex-col gap-5">

              {/* OAuth */}
              <OAuthButtons 
                isAnyLoading={isAnyLoading} 
                handleGoogleSignIn={handleGoogleSignIn} 
                handleGitHubSignIn={handleGitHubSignIn} 
              />
              <OrDivider />

              {/* Inline Error */}
              {inlineError && (
                <div className="p-3 rounded-lg text-red-600 dark:text-red-400 text-sm bg-red-500/10 border border-red-500/20">
                  {inlineError}
                </div>
              )}

              {/* Credentials form */}
              <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-5" noValidate>

                {/* Identifier */}
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                    Email or Username <span className="text-indigo-500">*</span>
                  </label>
                  <div className="relative">
                    <Mail size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("identifier")}
                      type="text"
                      disabled={isAnyLoading}
                      placeholder="john@example.com or johndoe"
                      autoComplete="username"
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
                </div>

                {/* Password */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
                      Password <span className="text-indigo-500">*</span>
                    </label>
                    <Link href="/forgot-password"
                      className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors duration-200">
                      Forgot password?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 dark:text-neutral-500 pointer-events-none" />
                    <input
                      {...register("password")}
                      type={showPassword ? "text" : "password"}
                      disabled={isAnyLoading}
                      placeholder="••••••••"
                      autoComplete="current-password"
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
                </div>

                {/* Submit */}
                <motion.button type="submit" disabled={isAnyLoading}
                  whileHover={!isAnyLoading ? { scale: 1.02 } : {}} whileTap={!isAnyLoading ? { scale: 0.98 } : {}}
                  className="relative flex items-center justify-center gap-2.5 w-full px-6 py-3.5 rounded-xl
                    bg-gradient-to-r from-indigo-500 via-violet-500 to-fuchsia-500 text-white text-sm font-semibold overflow-hidden
                    shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:shadow-[0_0_30px_rgba(99,102,241,0.6)] transition-all duration-300
                    disabled:opacity-60 disabled:cursor-not-allowed group border border-white/20 dark:border-white/10">
                  <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
                  <AnimatePresence mode="wait">
                    {isLoading ? (
                      <motion.span key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2">
                        <motion.span animate={{ rotate: 360 }} transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
                          className="w-4 h-4 border-2 border-white/30 border-t-white dark:border-neutral-900/30 dark:border-t-neutral-900 rounded-full" />
                        Signing in…
                      </motion.span>
                    ) : (
                      <motion.span key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="relative flex items-center gap-2">
                        <LogIn size={15} />
                        Sign In
                        <ArrowUpRight size={14} className="group-hover:rotate-12 transition-transform duration-300" />
                      </motion.span>
                    )}
                  </AnimatePresence>
                </motion.button>
              </form>
            </div>
          </div>

          <p className="text-center text-xs text-neutral-400 dark:text-neutral-600 mt-6">
            By signing in you agree to our{" "}
            <Link href="/privacy" className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors duration-200">Privacy Policy</Link>
            {" "}and{" "}
            <Link href="/terms" className="underline underline-offset-2 hover:text-neutral-600 dark:hover:text-neutral-400 transition-colors duration-200">Terms of Service</Link>.
          </p>
        </motion.div>
      </div>

      {/* Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
          <div className="bg-white/30 dark:bg-black/30 backdrop-blur-2xl text-card-foreground shadow-2xl border border-white/40 dark:border-white/10 p-6 rounded-3xl max-w-md w-full text-center animate-in fade-in zoom-in duration-200 z-50">
            <h2 className="text-xl font-semibold mb-3 text-neutral-900 dark:text-white">
              {modalTitle}
            </h2>
            <p className="text-sm text-neutral-800 dark:text-neutral-200 leading-relaxed mb-3" style={{ whiteSpace: "pre-line" }}>{modalMessage}</p>
            {(modalTitle.includes("Email Not Verified") || modalMessage.includes("verification")) && (
              <div className="mb-5 p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg">
                <p className="text-xs text-neutral-800 dark:text-neutral-200 font-medium">
                  📝 <span className="font-semibold">Note:</span> You'll need to enter your password when verifying your email.
                </p>
              </div>
            )}
            <button
              onClick={() => setModalOpen(false)}
              className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 border border-transparent transition-all mt-5 px-6 py-2 rounded-full text-sm font-medium w-full max-w-[200px]"
            >
              Close
            </button>
          </div>
        </div>
      )}
    </>
  );
}
