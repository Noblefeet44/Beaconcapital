"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
      {/* Top Banner */}
      <header className="bg-primary w-full h-40 flex flex-col items-center justify-center relative shadow-sm">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI4IiBoZWlnaHQ9IjgiPgo8cmVjdCB3aWR0aD0iOCIgaGVpZ2h0PSI4IiBmaWxsPSIjZmZmIiBmaWxsLW9wYWNpdHk9IjAuMDIiLz4KPHBhdGggZD0iTTAgMEw4IDhaTTAgOEw4IDBaIiBzdHJva2U9IiMwMDAiIHN0cm9rZS1vcGFjaXR5PSIwLjA1IiBzdHJva2Utd2lkdGg9IjEiLz4KPC9zdmc+')] opacity-50"></div>
        <div className="flex items-center gap-3 relative z-10">
          <span className="material-symbols-outlined text-on-primary" style={{ fontVariationSettings: "'FILL' 1", fontSize: "36px" }}>
            account_balance
          </span>
          <h1 className="font-headline-md text-headline-md font-bold text-on-primary tracking-tight">BEACON CAPITAL</h1>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 px-margin-mobile flex flex-col -mt-10 relative z-20">
        {/* Login Card */}
        <div className="bg-surface-container-lowest border border-surface-variant p-md shadow-[0px_4px_8px_rgba(0,0,0,0.04)] w-full max-w-[400px] mx-auto">
          <div className="border-b border-surface-variant pb-sm mb-lg">
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-background">Secure Access</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">Consumer Account Portal</p>
          </div>

          {error && (
            <div className="bg-error-container border border-error text-error text-sm p-sm mb-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontSize: "20px" }}>
                error
              </span>
              <span>{error}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="flex flex-col gap-md">
            {/* User ID Field */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-background" htmlFor="username">
                User ID / Email
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>
                  person
                </span>
                <input
                  className="w-full bg-surface-container-lowest border border-surface-variant pl-10 pr-sm py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors rounded-none placeholder:text-surface-dim"
                  id="username"
                  type="text"
                  placeholder="Enter your User ID"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-background" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>
                  lock
                </span>
                <input
                  className="w-full bg-surface-container-lowest border border-surface-variant pl-10 pr-sm py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors rounded-none placeholder:text-surface-dim"
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Secondary Actions */}
            <div className="flex justify-between items-center mt-xs">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  className="w-4 h-4 border-surface-variant text-primary focus:ring-primary rounded-none bg-surface-container-lowest"
                  type="checkbox"
                  checked={rememberId}
                  onChange={(e) => setRememberId(e.target.checked)}
                />
                <span className="font-label-sm text-label-sm text-on-surface-variant">Remember ID</span>
              </label>
              <span className="font-label-sm text-label-sm text-primary/60 cursor-not-allowed">Forgot credentials?</span>
            </div>

            {/* Primary Action */}
            <button
              className="mt-sm w-full bg-primary text-on-primary font-label-sm text-label-sm py-sm px-md rounded-none hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:bg-primary/50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Verifying connection..." : "Log In securely"}
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                arrow_forward
              </span>
            </button>
          </form>
        </div>

        {/* Signup redirection prompt */}
        <div className="mt-md text-center">
          <p className="font-body-md text-body-md text-on-surface-variant text-sm">
            Don't have an account?{" "}
            <Link href="/signup" className="text-primary font-bold hover:underline">
              Apply Securely
            </Link>
          </p>
        </div>

        {/* Security Badge */}
        <div className="mt-xl flex justify-center items-center gap-2 text-on-surface-variant">
          <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
            verified_user
          </span>
          <span className="font-label-sm text-label-sm">256-bit Encrypted Connection</span>
        </div>
      </main>

      {/* Bottom Footer / Admin Link */}
      <footer className="mt-auto py-lg flex justify-center items-center">
        <Link href="/admin" className="font-label-sm text-label-sm text-on-surface-variant/60 hover:text-on-surface-variant transition-colors flex items-center gap-1">
          <span className="material-symbols-outlined" style={{ fontSize: "14px" }}>
            admin_panel_settings
          </span>
          System Administrator Access
        </Link>
      </footer>
    </div>
  );
}
