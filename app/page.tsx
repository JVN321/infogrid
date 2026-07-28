"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Lock,
  Tv,
  ArrowRight,
  Sparkles,
  ShieldCheck,
  RefreshCw,
  AlertCircle,
  Layers,
  Calendar,
  Newspaper,
  CheckCircle2,
} from "lucide-react";

export default function LandingPage() {
  const router = useRouter();
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState("");
  const [isAlreadyAuthenticated, setIsAlreadyAuthenticated] = useState(false);

  useEffect(() => {
    async function checkExistingAuth() {
      try {
        const res = await fetch("/api/auth/login");
        const data = await res.json();
        if (data.authenticated) {
          setIsAlreadyAuthenticated(true);
        }
      } catch (err) {
        // ignore
      }
    }
    checkExistingAuth();
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthLoading(true);
    setAuthError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        router.push("/admin");
      } else {
        setAuthError(data.error || "Invalid username or password");
      }
    } catch (err) {
      setAuthError("Failed to connect to authentication server");
    } finally {
      setAuthLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col justify-between p-4 sm:p-6 lg:p-10 relative overflow-hidden selection:bg-blue-600 selection:text-white">
      {/* Decorative Glow Background Orbs */}
      <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-blue-600/15 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[500px] h-[500px] bg-purple-600/15 rounded-full blur-[120px] pointer-events-none"></div>

      {/* Header Bar */}
      <header className="max-w-7xl mx-auto w-full flex items-center justify-between z-10 pb-6 border-b border-slate-800/80">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20">
            <Layers className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-black tracking-tight text-white uppercase">MITS INFOGRID</h1>
            <p className="text-[11px] text-slate-400 font-semibold">Campus Media & Digital Signage Portal</p>
          </div>
        </div>

        <Link
          href="/display"
          className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-extrabold text-xs sm:text-sm rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
        >
          <Tv className="w-4 h-4" />
          <span>Launch Campus Display</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </header>

      {/* Main Content Hero & Login Section */}
      <main className="max-w-7xl mx-auto w-full my-auto py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center z-10">
        {/* Left Column: Hero & Launch Banner */}
        <div className="lg:col-span-7 space-y-6">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/80 border border-blue-800/60 text-blue-400 text-xs font-bold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>MITS Media Club & Campus Portal Hub</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-none">
            Muthoot Institute Campus Media Portal
          </h2>

          <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl font-medium">
            Welcome to the centralized MITS InfoGrid platform. Manage live campus news, track college achievements, and sync automated event feeds directly from Convex API.
          </p>

          {/* Action Button Card pointing to Display Page */}
          <div className="p-6 bg-gradient-to-br from-slate-900/90 to-blue-950/40 border border-slate-800/90 rounded-3xl backdrop-blur-md shadow-xl space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-blue-500/10 text-blue-400 rounded-2xl">
                  <Tv className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-black text-white text-base">Campus Display Screen</h3>
                  <p className="text-xs text-slate-400">View real-time news, looping events carousel, and achievements</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2 text-xs font-bold text-slate-300">
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <Newspaper className="w-4 h-4 text-blue-400" />
                <span>Campus News</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <Calendar className="w-4 h-4 text-sky-400" />
                <span>Convex Events</span>
              </div>
              <div className="flex items-center gap-1.5 bg-slate-950/60 p-2.5 rounded-xl border border-slate-800/60">
                <ShieldCheck className="w-4 h-4 text-emerald-400" />
                <span>9:16 Optimized</span>
              </div>
            </div>

            <Link
              href="/display"
              className="w-full py-3.5 bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-xl shadow-blue-600/25 transition-all flex items-center justify-center gap-2 uppercase tracking-wider group"
            >
              <span>Go to Display Page</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>

        {/* Right Column: Admin Login Card */}
        <div className="lg:col-span-5">
          <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl backdrop-blur-xl relative">
            <div className="flex flex-col items-center text-center mb-6">
              <div className="w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/25 mb-3">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">Admin Console Access</h3>
              <p className="text-xs text-slate-400 mt-1">Sign in to manage news & sync Convex events</p>
            </div>

            {isAlreadyAuthenticated && (
              <div className="mb-4 p-3 bg-emerald-950/60 border border-emerald-800/80 text-emerald-300 text-xs font-bold rounded-xl flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>You are logged in</span>
                </div>
                <Link href="/admin" className="underline hover:text-white">
                  Open Console &rarr;
                </Link>
              </div>
            )}

            {authError && (
              <div className="mb-4 p-3 bg-rose-950/60 border border-rose-800/80 text-rose-200 text-xs font-semibold rounded-xl flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-400 flex-shrink-0" />
                <span>{authError}</span>
              </div>
            )}

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Username</label>
                <input
                  type="text"
                  required
                  placeholder="Enter admin username"
                  value={usernameInput}
                  onChange={(e) => setUsernameInput(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Password</label>
                <input
                  type="password"
                  required
                  placeholder="Enter admin password"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  className="w-full text-xs p-3.5 bg-slate-950 border border-slate-800 rounded-xl text-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <button
                type="submit"
                disabled={authLoading}
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-500 disabled:bg-blue-800 text-white text-xs font-black rounded-xl shadow-lg shadow-blue-600/20 transition-all flex items-center justify-center gap-2 uppercase tracking-wider mt-2"
              >
                {authLoading ? (
                  <RefreshCw className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <Lock className="w-4 h-4" />
                    <span>Login to Admin Console</span>
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center border-t border-slate-800/60 pt-4">
              <Link href="/admin" className="text-xs font-semibold text-slate-400 hover:text-blue-400 transition-colors">
                Go directly to Admin Console &rarr;
              </Link>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full pt-6 border-t border-slate-800/60 text-center text-slate-500 text-xs font-medium z-10">
        &copy; {new Date().getFullYear()} Muthoot Institute of Technology & Science (MITS). InfoGrid Media System.
      </footer>
    </div>
  );
}
