"use client";

import { useAuth } from "@/components/AuthProvider";
import { signOut, useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Instrument_Serif } from "next/font/google";
import {
  User, Mail, Shield, Calendar, LogOut, Edit3, Lock, Eye, EyeOff,
  CheckCircle2, X, Loader2, Package, Truck, LayoutDashboard, Users,
  KeyRound, ChevronRight, AlertCircle,
} from "lucide-react";

// ─── Font ─────────────────────────────────────────────────────────────────────
const instrumentSerif = Instrument_Serif({
  subsets: ["latin"], weight: ["400"], style: ["italic"],
});

// ─── Password Strength ────────────────────────────────────────────────────────
function PasswordStrength({ password }: { password: string }) {
  if (!password) return null;
  const checks = [
    { label: "6+ characters",     pass: password.length >= 6 },
    { label: "Uppercase letter",  pass: /[A-Z]/.test(password) },
    { label: "Number",            pass: /[0-9]/.test(password) },
    { label: "Special character", pass: /[^a-zA-Z0-9]/.test(password) },
  ];
  const score = checks.filter((c) => c.pass).length;
  const barClrs = ["bg-red-400", "bg-orange-400", "bg-yellow-400", "bg-emerald-500"];
  const txtClrs = ["text-red-500", "text-orange-500", "text-yellow-500", "text-emerald-500"];
  const labels = ["Weak", "Fair", "Good", "Strong"];

  return (
    <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} className="mt-2 flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 flex gap-1 h-1.5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={`flex-1 rounded-full transition-colors duration-300 ${i < score ? barClrs[score - 1] : "bg-neutral-200 dark:bg-neutral-700"}`} />
          ))}
        </div>
        <span className={`text-[11px] font-semibold min-w-[40px] text-right ${txtClrs[score - 1] ?? "text-neutral-400"}`}>
          {labels[score - 1] ?? ""}
        </span>
      </div>
      <div className="grid grid-cols-2 gap-x-4 gap-y-1">
        {checks.map(({ label, pass }) => (
          <div key={label} className={`flex items-center gap-1 text-[11px] transition-colors duration-200 ${pass ? "text-emerald-500" : "text-neutral-400 dark:text-neutral-500"}`}>
            <CheckCircle2 size={10} className="flex-shrink-0" />
            {label}
          </div>
        ))}
      </div>
    </motion.div>
  );
}

// ─── Modal Backdrop ───────────────────────────────────────────────────────────
function Modal({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center px-4"
      >
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 16 }}
          transition={{ duration: 0.25, ease: "easeOut" }}
          className="relative w-full max-w-md bg-white dark:bg-neutral-900 rounded-3xl border border-neutral-200 dark:border-neutral-800 shadow-2xl shadow-black/20 overflow-hidden"
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

// ─── Edit Name Modal ──────────────────────────────────────────────────────────
function EditNameModal({ currentName, onClose, onSuccess, session, update }: {
  currentName: string;
  onClose: () => void;
  onSuccess: (newName: string) => void;
  session: any;
  update: any;
}) {
  const [name, setName] = useState(currentName);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmedName = name.trim();
    if (trimmedName.length < 2) { setError("Name must be at least 2 characters."); return; }
    if (trimmedName === currentName) { onClose(); return; }
    
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "update-name", fullName: trimmedName }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update name.");
      
      // Update the local session data IMMEDIATELY
      await update({
        ...session,
        user: { ...session?.user, name: trimmedName },
      });

      // Notify the parent common state
      onSuccess(trimmedName);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal onClose={onClose}>
      {/* Header — matches ChangePasswordModal exactly */}
      <div className="px-7 pt-7 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <User size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">Update Name</h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">How should we call you?</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          <X size={18} />
        </button>
      </div>

      {/* Body — same padding, gap, input & button style as ChangePasswordModal */}
      <div className="px-7 py-6">
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
              className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle size={14} className="flex-shrink-0" />
              {error}
            </motion.div>
          )}

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">
              Full Name <span className="text-indigo-500">*</span>
            </label>
            <div className="relative">
              <User size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                disabled={loading}
                placeholder="Your full name"
                autoFocus
                className="w-full pl-10 pr-4 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 disabled:opacity-50"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} disabled={loading}
              className="flex-1 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50">
              Cancel
            </button>
            <button type="submit" disabled={loading || name.trim() === currentName}
              className="flex-1 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 hover:shadow-xl">
              <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
              </span>
            </button>
          </div>
        </form>
      </div>
    </Modal>
  );
}

// ─── Change Password Modal ────────────────────────────────────────────────────
function ChangePasswordModal({ onClose }: { onClose: () => void }) {
  const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" });
  const [show, setShow] = useState({ current: false, new: false, confirm: false });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) { setError("Passwords do not match."); return; }
    setLoading(true); setError(null);
    try {
      const res = await fetch("/api/user/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "change-password", currentPassword: form.currentPassword, newPassword: form.newPassword }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to change password.");
      setSuccess(true);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full pl-10 pr-11 py-3 rounded-xl text-sm border border-neutral-200 dark:border-neutral-700 bg-white dark:bg-neutral-900/60 text-neutral-900 dark:text-white placeholder:text-neutral-400 dark:placeholder:text-neutral-600 focus:outline-none focus:ring-2 focus:ring-indigo-400/20 focus:border-indigo-400 dark:focus:border-indigo-500 transition-all duration-200 disabled:opacity-50";

  return (
    <Modal onClose={onClose}>
      <div className="px-7 pt-7 pb-3 border-b border-neutral-100 dark:border-neutral-800 flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-fuchsia-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <KeyRound size={16} className="text-white" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-neutral-900 dark:text-white tracking-tight">Change Password</h2>
            <p className="text-xs text-neutral-400 dark:text-neutral-500">Keep your account secure</p>
          </div>
        </div>
        <button onClick={onClose} className="mt-1 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
          <X size={18} />
        </button>
      </div>

      <div className="px-7 py-6">
        {success ? (
          <div className="flex flex-col items-center gap-4 py-6 text-center">
            <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
              <CheckCircle2 size={32} className="text-emerald-500" />
            </div>
            <div>
              <h3 className="text-base font-semibold text-neutral-900 dark:text-white">Password Updated!</h3>
              <p className="text-sm text-neutral-500 dark:text-neutral-400 mt-1">Your password has been changed successfully.</p>
            </div>
            <button onClick={onClose} className="mt-2 px-8 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
              Done
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle size={14} className="flex-shrink-0" />
                {error}
              </div>
            )}

            {/* Current Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Current Password <span className="text-indigo-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input type={show.current ? "text" : "password"} value={form.currentPassword}
                  onChange={(e) => setForm((f) => ({ ...f, currentPassword: e.target.value }))}
                  disabled={loading} placeholder="••••••••" className={inputClass} />
                <button type="button" onClick={() => setShow((s) => ({ ...s, current: !s.current }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                  {show.current ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
            </div>

            {/* New Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">New Password <span className="text-indigo-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input type={show.new ? "text" : "password"} value={form.newPassword}
                  onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
                  disabled={loading} placeholder="••••••••" className={inputClass} />
                <button type="button" onClick={() => setShow((s) => ({ ...s, new: !s.new }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                  {show.new ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              <PasswordStrength password={form.newPassword} />
            </div>

            {/* Confirm Password */}
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-neutral-500 dark:text-neutral-400">Confirm New Password <span className="text-indigo-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-neutral-400 pointer-events-none" />
                <input type={show.confirm ? "text" : "password"} value={form.confirmPassword}
                  onChange={(e) => setForm((f) => ({ ...f, confirmPassword: e.target.value }))}
                  disabled={loading} placeholder="••••••••" className={inputClass} />
                <button type="button" onClick={() => setShow((s) => ({ ...s, confirm: !s.confirm }))}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-neutral-400 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors">
                  {show.confirm ? <EyeOff size={14} /> : <Eye size={14} />}
                </button>
              </div>
              {form.confirmPassword && form.newPassword !== form.confirmPassword && (
                <p className="text-xs text-red-500 dark:text-red-400 mt-0.5">Passwords do not match.</p>
              )}
            </div>

            <div className="flex gap-3 pt-1">
              <button type="button" onClick={onClose} disabled={loading}
                className="flex-1 py-3 rounded-full border border-neutral-200 dark:border-neutral-700 text-sm font-semibold text-neutral-600 dark:text-neutral-400 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-all duration-200 disabled:opacity-50">
                Cancel
              </button>
              <button type="submit" disabled={loading || !form.currentPassword || !form.newPassword || !form.confirmPassword}
                className="flex-1 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold relative overflow-hidden group disabled:opacity-50 disabled:cursor-not-allowed shadow-lg transition-all duration-300 hover:shadow-xl">
                <span className="absolute inset-0 bg-gradient-to-r from-indigo-600 via-violet-600 to-fuchsia-600 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <span className="relative flex items-center justify-center gap-2 group-hover:text-white transition-colors duration-300">
                  {loading ? (
                  <>
                    <Loader2 size={14} className="animate-spin" />
                    Updating...
                  </>
                ) : (
                  "Update"
                )}
                </span>
              </button>
            </div>
          </form>
        )}
      </div>
    </Modal>
  );
}


// ─── Info Row ─────────────────────────────────────────────────────────────────
function InfoRow({ icon, label, value, action, onAction }: {
  icon: React.ReactNode;
  label: string;
  value: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 rounded-2xl bg-neutral-50 dark:bg-neutral-800/60 border border-neutral-100 dark:border-neutral-700/50 group">
      <div className="w-9 h-9 rounded-xl bg-white dark:bg-neutral-800 border border-neutral-200 dark:border-neutral-700 flex items-center justify-center text-neutral-500 dark:text-neutral-400 flex-shrink-0 shadow-sm">
        {icon}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-[10px] font-semibold text-neutral-400 dark:text-neutral-500 uppercase tracking-wider">{label}</p>
        <p className="text-sm font-semibold text-neutral-800 dark:text-neutral-200 truncate mt-0.5">{value}</p>
      </div>
      {action && onAction && (
        <button onClick={onAction}
          className="flex items-center gap-1 text-xs font-semibold text-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
          {action} <ChevronRight size={12} />
        </button>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────
export default function ProfilePage() {
  const { session, status, isAdmin } = useAuth();
  const { update } = useSession();
  const router = useRouter();
  const [modal, setModal] = useState<"name" | "password" | null>(null);
  const [displayName, setDisplayName] = useState<string | null>(null);

  // ── Loading ──────────────────────────────────────────────────────────────
  if (status === "loading") {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-10 h-10 text-indigo-500 animate-spin" />
          <p className="text-sm text-neutral-500 dark:text-neutral-400">Loading profile...</p>
        </div>
      </div>
    );
  }

  // ── Unauthenticated ──────────────────────────────────────────────────────
  if (status === "unauthenticated" || !session?.user) {
    return (
      <div className="min-h-screen bg-white dark:bg-neutral-950 flex items-center justify-center px-4">
        <div className="max-w-sm w-full text-center">
          <div className="w-16 h-16 mx-auto mb-6 rounded-2xl bg-red-50 dark:bg-red-500/10 flex items-center justify-center">
            <Shield size={28} className="text-red-500" />
          </div>
          <h1 className="text-2xl font-bold text-neutral-900 dark:text-white mb-2">Access Denied</h1>
          <p className="text-sm text-neutral-500 dark:text-neutral-400 mb-6">Please sign in to view your profile.</p>
          <button onClick={() => router.push("/login")}
            className="px-8 py-3 rounded-full bg-neutral-900 dark:bg-white text-white dark:text-neutral-900 text-sm font-semibold shadow-lg hover:shadow-xl transition-all duration-300">
            Sign In
          </button>
        </div>
      </div>
    );
  }

  const user = session.user;
  const name = displayName ?? user.name ?? "User";
  const initials = name.split(" ").map((w: string) => w[0]).join("").slice(0, 2).toUpperCase();
  const memberSince = new Date().getFullYear(); // fallback; ideally from DB

  const adminLinks = [
    { label: "Dashboard",     icon: <LayoutDashboard size={16} />, path: "/admin" },
    { label: "Manage Users",  icon: <Users size={16} />,           path: "/admin/students" },
    { label: "Pricing",       icon: <Package size={16} />,         path: "/admin/pricing" },
  ];


  return (
  <>
    {/* ── Modals ── */}
    {modal === "name" && (
      <EditNameModal
        currentName={name}
        session={session}
        update={update}
        onClose={() => setModal(null)}
        onSuccess={async (newName) => {
          setDisplayName(newName);
          // Wait for session to update completely
          await update({
            ...session,
            user: { ...session?.user, name: newName },
          });
          setModal(null);
        }}
      />
    )}
    {modal === "password" && (
      <ChangePasswordModal onClose={() => setModal(null)} />
    )}

    {/* ── Page ── */}
    <div className="min-h-screen relative overflow-hidden px-4 py-16
      bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.12),transparent_40%)]
      dark:bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.25),transparent_40%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.18),transparent_40%)]
    ">

      {/* Grain */}
      <div className="absolute inset-0 opacity-[0.035] mix-blend-overlay pointer-events-none"
        style={{ backgroundImage: "url('https://grainy-gradients.vercel.app/noise.svg')" }}
      />

      {/* Blobs */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[400px] rounded-full
          bg-gradient-to-b from-indigo-400/20 via-violet-400/10 to-transparent blur-3xl" />
        <div className="absolute -bottom-32 -right-32 w-96 h-96 rounded-full
          bg-gradient-to-tl from-fuchsia-400/20 to-transparent blur-3xl" />
      </div>

      <div className="relative z-10 max-w-6xl mx-auto">

        {/* Header */}
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="mb-12">
          <div className="flex items-center gap-2 text-xs font-semibold text-neutral-400 uppercase tracking-widest mb-3">
            <Truck size={13} />
            SCA Courier
          </div>

          <h1 className="text-4xl md:text-5xl font-semibold tracking-tight
            bg-gradient-to-br from-neutral-900 to-neutral-600
            dark:from-white dark:to-neutral-300 bg-clip-text text-transparent">
            My{" "}
            <span className={`${instrumentSerif.className} bg-gradient-to-r from-indigo-600 via-violet-500 to-fuchsia-500 bg-clip-text text-transparent`}>
              Profile
            </span>
          </h1>

          <p className="text-neutral-500 dark:text-neutral-400 text-sm mt-3">
            Manage your account, security and preferences.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* LEFT */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="flex flex-col gap-6">

            {/* Avatar Card */}
            <div className="rounded-3xl backdrop-blur-2xl
              bg-white/60 dark:bg-white/[0.04]
              border border-white/40 dark:border-white/10
              shadow-[0_10px_40px_rgba(0,0,0,0.12)]
              dark:shadow-[0_10px_40px_rgba(0,0,0,0.7)]
              overflow-hidden">

              <div className="h-28 bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500" />

              <div className="px-6 pb-6">

                <div className="flex justify-center -mt-14 mb-4">
                  <div className="w-24 h-24 rounded-full border-4 border-white dark:border-neutral-900
                    bg-gradient-to-br from-indigo-500 via-violet-500 to-fuchsia-500
                    flex items-center justify-center shadow-xl">
                    {user.image ? (
                      <img src={user.image} className="w-full h-full object-cover rounded-full" />
                    ) : (
                      <span className="text-2xl font-bold text-white">{initials}</span>
                    )}
                  </div>
                </div>

                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-neutral-900 dark:text-white">{name}</h2>
                  <p className="text-xs text-neutral-400 mt-1">{user.email}</p>
                </div>

                {/* Buttons */}
                <div className="flex flex-col gap-3">

                  <button onClick={() => setModal("name")}
                    className="py-3 rounded-xl bg-white/70 dark:bg-white/[0.05]
                    border border-white/40 dark:border-white/10
                    hover:border-indigo-400 transition-all font-semibold text-sm">
                    Edit Name
                  </button>

                  <button onClick={() => setModal("password")}
                    className="py-3 rounded-xl bg-white/70 dark:bg-white/[0.05]
                    border border-white/40 dark:border-white/10
                    hover:border-violet-400 transition-all font-semibold text-sm">
                    Change Password
                  </button>

                  <button onClick={() => signOut({ callbackUrl: "/" })}
                    className="py-3 rounded-xl border border-red-200 dark:border-red-500/20
                    text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 transition-all text-sm font-semibold">
                    Sign Out
                  </button>

                </div>
              </div>
            </div>

            {/* Security Badge */}
            <div className="rounded-2xl px-5 py-4 flex items-center gap-4
              bg-emerald-500/10 border border-emerald-500/20 backdrop-blur-xl">
              <CheckCircle2 className="text-emerald-500" />
              <div>
                <p className="text-xs font-bold text-emerald-500">Account Verified</p>
                <p className="text-[10px] text-neutral-500">Secure & trusted</p>
              </div>
            </div>
          </motion.div>

          {/* RIGHT */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Info Card */}
            <div className="rounded-3xl backdrop-blur-2xl
              bg-white/60 dark:bg-white/[0.04]
              border border-white/40 dark:border-white/10
              shadow-xl p-6">

              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <User size={16} className="text-indigo-500" />
                Account Info
              </h3>

              <div className="flex flex-col gap-3">
                <InfoRow icon={<User size={14} />} label="Name" value={name} />
                <InfoRow icon={<Mail size={14} />} label="Email" value={user.email ?? "-"} />
                <InfoRow icon={<Shield size={14} />} label="Role" value={user.role ?? "User"} />
                <InfoRow icon={<Calendar size={14} />} label="Member Since" value={`${memberSince}`} />
              </div>
            </div>

            {/* Security */}
            <div className="rounded-3xl backdrop-blur-2xl
              bg-white/60 dark:bg-white/[0.04]
              border border-white/40 dark:border-white/10
              shadow-xl p-6">

              <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                <Lock size={16} className="text-violet-500" />
                Security
              </h3>

              <button onClick={() => setModal("password")}
                className="w-full flex justify-between items-center p-4 rounded-xl
                bg-white/70 dark:bg-white/[0.05]
                border border-white/40 dark:border-white/10
                hover:border-indigo-400 transition-all">

                <span>Password</span>
                <ChevronRight size={14} />
              </button>
            </div>

            {/* Admin */}
            {isAdmin && (
              <div className="rounded-3xl backdrop-blur-2xl
                bg-white/60 dark:bg-white/[0.04]
                border border-white/40 dark:border-white/10
                shadow-xl p-6">

                <h3 className="text-sm font-bold mb-4 flex items-center gap-2">
                  <LayoutDashboard size={16} className="text-fuchsia-500" />
                  Admin
                </h3>

                <div className="grid grid-cols-3 gap-3">
                  {adminLinks.map((link) => (
                    <button key={link.path}
                      onClick={() => router.push(link.path)}
                      className="p-4 rounded-xl bg-white/70 dark:bg-white/[0.05]
                      border border-white/40 dark:border-white/10
                      hover:border-indigo-400 transition-all text-xs font-semibold">
                      {link.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  </>
);
}
