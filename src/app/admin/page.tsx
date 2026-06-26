"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function AdminAccessPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
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
        throw new Error(data.error || "Authentication failed");
      }

      if (data.role !== "admin") {
        throw new Error("Access Forbidden: Insufficient permissions");
      }

      router.push("/admin/console");
      router.refresh();
    } catch (err: any) {
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-surface-container-low min-h-screen flex items-center justify-center p-margin-mobile md:p-margin-desktop relative overflow-hidden antialiased">
      {/* Ambient background texture */}
      <div 
        className="absolute inset-0 opacity-5 pointer-events-none" 
        style={{ 
          backgroundImage: "radial-gradient(circle at 50% 50%, #1a1c1c 1px, transparent 1px)", 
          backgroundSize: "24px 24px" 
        }}
      ></div>

      <main className="w-full max-w-[480px] bg-surface-container-lowest border border-surface-dim shadow-architectural z-10 relative">
        {/* Top Accent Line */}
        <div className="h-1 bg-primary w-full"></div>

        <div className="p-md">
          {/* Header */}
          <div className="border-b border-surface-variant pb-sm mb-lg text-center">
            <div className="flex justify-center items-center gap-2 text-primary mb-2">
              <span className="material-symbols-outlined" style={{ fontSize: "28px" }}>
                gavel
              </span>
              <span className="font-headline-md text-headline-md font-bold tracking-wider">BEACON CAPITAL</span>
            </div>
            <h2 className="font-headline-lg-mobile text-headline-lg-mobile text-on-surface">Admin Gate</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Institutional Ledger Override Console
            </p>
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
            {/* Admin ID Field */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface" htmlFor="username">
                Administrator ID
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>
                  admin_panel_settings
                </span>
                <input
                  className="w-full bg-surface-container-lowest border border-surface-variant pl-10 pr-sm py-sm font-body-md text-body-md text-on-surface focus:border-primary focus:ring-0 outline-none transition-colors rounded-none placeholder:text-surface-dim"
                  id="username"
                  type="text"
                  placeholder="Enter Admin credentials"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Token/Password Field */}
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface" htmlFor="password">
                Authorization Token / Password
              </label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>
                  vpn_key
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

            {/* Primary Action */}
            <button
              className="mt-sm w-full bg-primary text-on-primary font-label-sm text-label-sm py-sm px-md rounded-none hover:bg-primary-container transition-colors flex items-center justify-center gap-2 disabled:bg-primary/50"
              type="submit"
              disabled={loading}
            >
              {loading ? "Authenticating Authority..." : "Authenticate Gate"}
              <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>
                verified_user
              </span>
            </button>
          </form>

          {/* Links back */}
          <div className="mt-lg text-center pt-md border-t border-surface-variant/30">
            <Link href="/login" className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary transition-colors flex items-center justify-center gap-1">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>
                arrow_back
              </span>
              Return to Consumer Portal
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}
