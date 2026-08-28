"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export default function ConsumerLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [rememberId, setRememberId] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      if (data.role === "admin") {
        router.push("/admin/console");
      } else if (data.status === "Pending") {
        router.push("/pending");
      } else {
        router.push("/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <PublicHeader />

      {/* Main Content Area */}
      <main className="flex-1 py-16 px-margin-mobile flex flex-col items-center justify-center">
        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-surface-variant p-8 md:p-10 shadow-sm w-full max-w-[420px]">
          <div className="border-b border-surface-variant pb-4 mb-6">
            <h1 className="font-headline-lg text-2xl font-bold text-on-background">Client Portal Login</h1>
            <p className="font-body-md text-xs text-on-surface-variant mt-1">Institutional Account & Ledger Access</p>
          </div>

          {error && (
            <div className="bg-error-container border border-error text-error text-xs p-3 mb-4 flex items-center gap-2">
              <span className="material-symbols-outlined text-error text-base">
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {/* User ID Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs font-bold text-on-background" htmlFor="username">
                User ID / Registered Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  person
                </span>
                <input
                  className="w-full bg-surface-container-lowest border border-surface-variant pl-10 pr-3 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-colors"
                  id="username"
                  type="text"
                  placeholder="Enter User ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="font-label-sm text-xs font-bold text-on-background" htmlFor="password">
                Security Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-on-surface-variant text-base">
                  lock
                </span>
                <input
                  className="w-full bg-surface-container-lowest border border-surface-variant pl-10 pr-3 py-2.5 text-sm text-on-surface focus:border-primary outline-none transition-colors"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Remember & Forgot */}
            <div className="flex justify-between items-center text-xs">
              <label className="flex items-center gap-2 cursor-pointer text-on-surface-variant">
                <input
                  className="w-4 h-4 border-surface-variant text-primary focus:ring-primary bg-surface-container-lowest"
                  type="checkbox"
                  checked={rememberId}
                  onChange={(e) => setRememberId(e.target.checked)}
                />
                <span>Remember Credentials</span>
              </label>
              <span className="text-primary/60 cursor-not-allowed">Forgot password?</span>
            </div>

            {/* Submit Button */}
            <button
              className="mt-2 w-full bg-primary text-on-primary font-bold text-sm py-3 px-4 hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:opacity-50 shadow-sm"
              type="submit"
              disabled={loading}
            >
              {loading ? "Authenticating Session..." : "Log In Securely"}
              <span className="material-symbols-outlined text-base">
                arrow_forward
              </span>
            </button>
          </form>

          {/* Signup Link */}
          <div className="mt-6 pt-6 border-t border-surface-variant text-center">
            <p className="text-xs text-on-surface-variant">
              Don't have an institutional account yet?{" "}
              <Link href="/signup" className="text-primary font-bold hover:underline">
                Apply Online
              </Link>
            </p>
          </div>
        </div>

        {/* Security Badge */}
        <div className="mt-8 flex items-center gap-2 text-xs text-on-surface-variant">
          <span className="material-symbols-outlined text-primary text-base">
            verified_user
          </span>
          <span>256-bit SSL Encrypted Connection</span>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
