"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";
import { Account, DEFAULT_ROUTING_NUMBER } from "@/lib/db";

export default function ProfilePage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [showIdNumber, setShowIdNumber] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Drawer state for mobile sidebar
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchProfileData = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to load profile session");
      }
      const data = await res.json();
      if (data.user?.status === "Pending") {
        router.push("/pending");
        return;
      }
      if (data.user?.status === "Rejected") {
        router.push("/login");
        return;
      }
      setUser(data.user);
      setAccounts(data.accounts || []);
    } catch (err) {
      console.error("Error loading profile:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfileData();
  }, []);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const formatDob = (dobStr?: string) => {
    if (!dobStr) return "N/A";
    try {
      const date = new Date(dobStr);
      if (isNaN(date.getTime())) return dobStr;
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    } catch {
      return dobStr;
    }
  };

  const formatMemberSince = (createdStr?: string) => {
    if (!createdStr) return "March 2024";
    try {
      const date = new Date(createdStr);
      if (isNaN(date.getTime())) return "March 2024";
      return date.toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
      });
    } catch {
      return "March 2024";
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">
            sync
          </span>
          <p className="font-body-md text-sm text-on-surface-variant mt-3">
            Loading Client Profile Vault...
          </p>
        </div>
      </div>
    );
  }

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Institutional Client";
  const userInitials = `${user?.firstName?.[0] || "B"}${user?.lastName?.[0] || "C"}`.toUpperCase();
  const routing = user?.routingNumber || DEFAULT_ROUTING_NUMBER;

  return (
    <div className="bg-background text-on-background min-h-screen flex flex-col antialiased pb-24 md:pb-12">
      {/* ── Mobile Top Header ── */}
      <header className="md:hidden sticky top-0 z-30 bg-[#af0017] text-white px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard"
            className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors"
          >
            <span className="material-symbols-outlined text-xl">arrow_back</span>
          </Link>
          <span className="font-headline-md font-bold text-base tracking-wider uppercase">
            Client Profile
          </span>
        </div>
        <button
          onClick={() => setDrawerOpen(true)}
          className="text-white p-1 hover:bg-white/10 rounded transition-colors"
          aria-label="Open Menu"
        >
          <span className="material-symbols-outlined text-2xl">menu</span>
        </button>
      </header>

      {/* ── Mobile Drawer ── */}
      {drawerOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[80vw] bg-surface-container-low h-full flex flex-col z-10 p-4 shadow-2xl border-r border-outline">
            <div className="flex items-center justify-between pb-4 border-b border-surface-dim">
              <span className="font-headline-md font-bold text-primary text-lg">
                BEACON CAPITAL
              </span>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-on-surface-variant p-1 rounded hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>
            <nav className="flex-1 py-4 space-y-1 overflow-y-auto">
              <Link
                href="/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">dashboard</span>
                <span className="font-body-md text-sm">Dashboard</span>
              </Link>
              <Link
                href="/dashboard/transfer"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">send_money</span>
                <span className="font-body-md text-sm">Transfer</span>
              </Link>
              <Link
                href="/dashboard/transactions"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">receipt_long</span>
                <span className="font-body-md text-sm">Transactions</span>
              </Link>
              <Link
                href="/dashboard/cards"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">credit_card</span>
                <span className="font-body-md text-sm">Cards</span>
              </Link>
              <Link
                href="/dashboard/profile"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded bg-primary/10 text-primary font-bold transition-colors"
              >
                <span className="material-symbols-outlined">person</span>
                <span className="font-body-md text-sm">Profile Details</span>
              </Link>
            </nav>
            <div className="pt-4 border-t border-surface-dim">
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors"
              >
                <span className="material-symbols-outlined">logout</span>
                <span className="font-body-md text-sm">Log Out</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Main Layout Container ── */}
      <div className="flex flex-1 relative max-w-[1240px] mx-auto w-full md:px-6 md:py-6">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col h-[calc(100vh-48px)] sticky top-6 bg-surface-container-low w-72 rounded-3xl border border-outline p-6 shadow-sm mr-6">
          <div className="pb-6 border-b border-outline mb-6">
            <div className="font-headline-md font-bold text-primary text-xl tracking-tight">
              BEACON CAPITAL
            </div>
            <p className="text-[11px] text-on-surface-variant mt-0.5">Private Wealth Management</p>
          </div>

          <nav className="flex-1 space-y-1.5">
            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">dashboard</span>
              <span>Dashboard</span>
            </Link>
            <Link
              href="/dashboard/transfer"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">send_money</span>
              <span>Transfer</span>
            </Link>
            <Link
              href="/dashboard/transactions"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">receipt_long</span>
              <span>Transactions</span>
            </Link>
            <Link
              href="/dashboard/cards"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl text-on-surface hover:bg-surface-container-high transition-all text-sm font-medium"
            >
              <span className="material-symbols-outlined text-on-surface-variant text-xl">credit_card</span>
              <span>Cards</span>
            </Link>
            <Link
              href="/dashboard/profile"
              className="flex items-center gap-3 px-4 py-3 rounded-2xl bg-primary/10 text-primary font-bold transition-all text-sm"
            >
              <span className="material-symbols-outlined text-xl">person</span>
              <span>Profile Details</span>
            </Link>
          </nav>

          <div className="pt-4 border-t border-outline">
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-600 hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors text-sm font-medium"
            >
              <span className="material-symbols-outlined text-xl">logout</span>
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 w-full max-w-4xl px-4 md:px-0 space-y-6">
          {/* Breadcrumb / Top bar */}
          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs text-on-surface-variant">
              <Link href="/dashboard" className="hover:text-primary transition-colors">
                Dashboard
              </Link>
              <span>/</span>
              <span className="text-on-background font-semibold">User Profile &amp; KYC</span>
            </div>
            <Link
              href="/dashboard"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
            >
              <span className="material-symbols-outlined text-sm">arrow_back</span>
              <span>Back to Dashboard</span>
            </Link>
          </div>

          {/* Profile Hero Header Card */}
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1C0006] via-[#35020B] to-[#0A0D14] p-6 sm:p-8 text-white shadow-xl border border-red-950/40">
            <div className="absolute right-0 top-0 translate-x-12 -translate-y-12 w-72 h-72 rounded-full bg-[#af0017]/20 blur-3xl pointer-events-none" />

            <div className="relative z-10 flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-3xl bg-gradient-to-tr from-[#af0017] to-[#e63946] border-2 border-white/20 shadow-2xl flex items-center justify-center font-bold text-2xl sm:text-3xl text-white shrink-0">
                  {userInitials}
                </div>
                <div>
                  <div className="flex items-center gap-2.5">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
                      {fullName}
                    </h1>
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2.5 py-0.5 rounded-full">
                      <span className="material-symbols-outlined text-[13px]">verified</span>
                      Active Client
                    </span>
                  </div>
                  <p className="text-xs sm:text-sm text-white/70 font-mono mt-1">
                    {user?.email || user?.username}
                  </p>
                  <div className="flex flex-wrap items-center gap-3 mt-2 text-[11px] text-white/60">
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">shield</span>
                      Tier 1 Institutional KYC
                    </span>
                    <span>•</span>
                    <span className="flex items-center gap-1">
                      <span className="material-symbols-outlined text-[13px]">calendar_today</span>
                      Member Since {formatMemberSince(user?.createdAt)}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between sm:justify-center border-t sm:border-t-0 border-white/10 pt-3 sm:pt-0">
                <div className="text-left sm:text-right">
                  <span className="text-[10px] uppercase font-bold text-white/50 tracking-wider block">
                    Security Session
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-400 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    5-Min Guard Active
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* Grid of Profile Sections */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {/* Section 1: Personal Details */}
            <div className="bg-surface-container-lowest border border-surface-dim rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-surface-dim pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl">person</span>
                  <h2 className="font-bold text-sm uppercase tracking-wider text-on-background">
                    Personal Information
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Verified
                </span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    First Name
                  </span>
                  <span className="font-semibold text-on-background">{user?.firstName || "N/A"}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Last Name
                  </span>
                  <span className="font-semibold text-on-background">{user?.lastName || "N/A"}</span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Registered Email (User ID)
                  </span>
                  <div className="flex items-center justify-between font-semibold text-on-background mt-0.5">
                    <span className="break-all">{user?.email || user?.username || "N/A"}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(user?.email || user?.username, "email")}
                      className="text-xs text-primary hover:underline ml-2 shrink-0 font-medium"
                    >
                      {copiedKey === "email" ? "Copied" : "Copy"}
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Mobile Phone Number
                  </span>
                  <div className="flex items-center justify-between font-semibold text-on-background mt-0.5">
                    <span>{user?.phone || "N/A"}</span>
                    {user?.phone && (
                      <button
                        type="button"
                        onClick={() => handleCopy(user?.phone, "phone")}
                        className="text-xs text-primary hover:underline ml-2 shrink-0 font-medium"
                      >
                        {copiedKey === "phone" ? "Copied" : "Copy"}
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Date of Birth
                  </span>
                  <span className="font-semibold text-on-background">{formatDob(user?.dob)}</span>
                </div>
              </div>
            </div>

            {/* Section 2: Residential Address & Jurisdiction */}
            <div className="bg-surface-container-lowest border border-surface-dim rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-surface-dim pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl">home_pin</span>
                  <h2 className="font-bold text-sm uppercase tracking-wider text-on-background">
                    Address &amp; Jurisdiction
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  Primary
                </span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Residential Address / Issuance State
                  </span>
                  <span className="font-semibold text-on-background block leading-relaxed mt-0.5">
                    {user?.address || user?.issuance || "Beacon Capital Plaza, 100 Financial District, NY 10005"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Issuing Jurisdiction / State
                  </span>
                  <span className="font-semibold text-on-background">
                    {user?.issuance || "United States (US)"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Country of Residence
                  </span>
                  <span className="font-semibold text-on-background">United States (US)</span>
                </div>

                <div className="p-3.5 rounded-2xl bg-surface-container-low border border-surface-dim text-xs text-on-surface-variant space-y-1">
                  <div className="font-bold text-on-surface flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-sm text-primary">verified</span>
                    <span>Proof of Address Verified</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">
                    Institutional KYC regulatory documentation on file. Contact private wealth desk to modify legal address.
                  </p>
                </div>
              </div>
            </div>

            {/* Section 3: Identity Verification & KYC */}
            <div className="bg-surface-container-lowest border border-surface-dim rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-surface-dim pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl">badge</span>
                  <h2 className="font-bold text-sm uppercase tracking-wider text-on-background">
                    Identity Verification
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                  Approved
                </span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Government ID Document
                  </span>
                  <span className="font-semibold text-on-background capitalize">
                    {user?.idType === "dl"
                      ? "Driver's License"
                      : user?.idType === "passport"
                      ? "Official Passport"
                      : user?.idType === "state_id"
                      ? "State ID Card"
                      : user?.idType || "Driver's License"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Identification Document Number
                  </span>
                  <div className="flex items-center justify-between mt-0.5">
                    <span className="font-mono font-semibold text-on-background">
                      {showIdNumber
                        ? user?.idNumber || "A49302198"
                        : user?.idNumber
                        ? `••••••••${user.idNumber.slice(-4)}`
                        : "••••••••4981"}
                    </span>
                    <button
                      type="button"
                      onClick={() => setShowIdNumber((prev) => !prev)}
                      className="text-xs text-primary hover:underline font-medium flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-sm">
                        {showIdNumber ? "visibility_off" : "visibility"}
                      </span>
                      <span>{showIdNumber ? "Hide" : "Reveal"}</span>
                    </button>
                  </div>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Document Expiration Date
                  </span>
                  <span className="font-semibold text-on-background">
                    {user?.expiry ? formatDob(user.expiry) : "Valid / Current"}
                  </span>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Compliance Status
                  </span>
                  <span className="inline-flex items-center gap-1 font-semibold text-emerald-600 dark:text-emerald-400 text-xs">
                    <span className="material-symbols-outlined text-sm">check_circle</span>
                    Full CIP / KYC / AML Screening Cleared
                  </span>
                </div>
              </div>
            </div>

            {/* Section 4: Security & Session Guard */}
            <div className="bg-surface-container-lowest border border-surface-dim rounded-3xl p-6 shadow-sm space-y-4">
              <div className="flex items-center justify-between border-b border-surface-dim pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="material-symbols-outlined text-primary text-xl">security</span>
                  <h2 className="font-bold text-sm uppercase tracking-wider text-on-background">
                    Session &amp; Security Settings
                  </h2>
                </div>
                <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-surface-container text-on-surface-variant">
                  High Security
                </span>
              </div>

              <div className="space-y-3.5 text-sm">
                <div className="p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-xs text-amber-900 dark:text-amber-200 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-base">timer</span>
                      5-Minute Inactivity Auto-Logout
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-800 dark:text-amber-300">
                      Enabled
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1.5 leading-relaxed">
                    For your financial safety, accounts are automatically logged out after 5 minutes of inactivity or tab absence.
                  </p>
                </div>

                <div>
                  <span className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant block">
                    Data Encryption
                  </span>
                  <span className="font-semibold text-on-background flex items-center gap-1.5 mt-0.5">
                    <span className="material-symbols-outlined text-emerald-600 text-base">lock</span>
                    256-Bit TLS / AES Banking Grade Encryption
                  </span>
                </div>

                <div className="pt-2 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={handleLogout}
                    className="w-full py-2.5 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs transition-colors flex items-center justify-center gap-2 shadow-sm"
                  >
                    <span className="material-symbols-outlined text-base">logout</span>
                    <span>Sign Out of Current Session</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Section 5: Linked Accounts & Routing Numbers Summary */}
          <div className="bg-surface-container-lowest border border-surface-dim rounded-3xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between border-b border-surface-dim pb-3">
              <div className="flex items-center gap-2.5">
                <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                <h2 className="font-bold text-sm uppercase tracking-wider text-on-background">
                  Registered Bank Accounts &amp; Routing
                </h2>
              </div>
              <span className="text-xs text-on-surface-variant font-mono">
                Routing: {routing}
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div
                  key={acc.id}
                  className="p-4 rounded-2xl bg-surface-container-low border border-surface-dim space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-sm text-on-background">
                      {acc.accountName || `${acc.accountType.toUpperCase()} Account`}
                    </span>
                    <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
                      {acc.accountType}
                    </span>
                  </div>

                  <div className="flex items-center justify-between text-xs pt-1">
                    <span className="text-on-surface-variant font-mono">Account #{acc.accountNumber}</span>
                    <button
                      type="button"
                      onClick={() => handleCopy(acc.accountNumber, `acc-${acc.id}`)}
                      className="text-primary hover:underline font-medium"
                    >
                      {copiedKey === `acc-${acc.id}` ? "Copied" : "Copy"}
                    </button>
                  </div>

                  <div className="flex items-center justify-between text-xs border-t border-surface-dim pt-2 mt-1">
                    <span className="text-on-surface-variant">Available Balance:</span>
                    <span className="font-mono font-bold text-on-background">
                      ${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>

      {/* ── Mobile Bottom Navigation Bar ── */}
      <MobileBottomNav
        user={user}
        primaryAccount={accounts[0]}
      />
    </div>
  );
}
