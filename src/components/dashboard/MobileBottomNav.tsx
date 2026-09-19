"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

interface MobileBottomNavProps {
  user?: any;
  primaryAccount?: any;
  onOpenProfile?: () => void;
}

export default function MobileBottomNav({
  user,
  primaryAccount,
  onOpenProfile,
}: MobileBottomNavProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Logout error:", err);
    }
  };

  return (
    <>
      {/* ── Fixed Mobile Bottom Navigation Bar ── */}
      <nav
        aria-label="Mobile Navigation"
        className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0E131F]/95 backdrop-blur-lg border-t border-slate-200 dark:border-[#1E293B] shadow-[0_-4px_20px_rgba(0,0,0,0.08)] px-2 py-1.5 flex items-center justify-around select-none"
      >
        {/* Tab 1: Home */}
        <Link
          href="/dashboard"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            pathname === "/dashboard"
              ? "text-[#af0017] dark:text-[#E53935] font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={pathname === "/dashboard" ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            home
          </span>
          <span className="text-[10px] tracking-wide mt-0.5">Home</span>
        </Link>

        {/* Tab 2: History */}
        <Link
          href="/dashboard/transactions"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            pathname.startsWith("/dashboard/transactions")
              ? "text-[#af0017] dark:text-[#E53935] font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={pathname.startsWith("/dashboard/transactions") ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            receipt_long
          </span>
          <span className="text-[10px] tracking-wide mt-0.5">History</span>
        </Link>

        {/* Center Elevated Action Button (Banking Menu) */}
        <div className="relative -top-3 flex flex-col items-center">
          <button
            type="button"
            onClick={() => setMenuOpen((prev) => !prev)}
            aria-label="Open Banking Menu"
            className="w-[52px] h-[52px] rounded-2xl bg-[#0F1E19] dark:bg-[#131F1A] hover:bg-[#162C25] text-[#22C55E] border-2 border-[#22C55E]/40 shadow-xl flex items-center justify-center transition-transform active:scale-95 group"
          >
            <span className="material-symbols-outlined text-[28px] text-[#22C55E] group-hover:rotate-45 transition-transform duration-200">
              grid_view
            </span>
          </button>
        </div>

        {/* Tab 3: Cards */}
        <Link
          href="/dashboard/cards"
          className={`flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
            pathname.startsWith("/dashboard/cards")
              ? "text-[#af0017] dark:text-[#E53935] font-bold"
              : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
          }`}
        >
          <span
            className="material-symbols-outlined text-[24px]"
            style={pathname.startsWith("/dashboard/cards") ? { fontVariationSettings: "'FILL' 1" } : {}}
          >
            credit_card
          </span>
          <span className="text-[10px] tracking-wide mt-0.5">Cards</span>
        </Link>

        {/* Tab 4: Profile */}
        <button
          type="button"
          onClick={onOpenProfile}
          className="flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
        >
          <span className="material-symbols-outlined text-[24px]">person</span>
          <span className="text-[10px] tracking-wide mt-0.5">Profile</span>
        </button>
      </nav>

      {/* ── Banking Menu Modal (Frame 00:05 Reference) ── */}
      {menuOpen && (
        <div
          className="md:hidden fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4 animate-in fade-in duration-200"
          onClick={() => setMenuOpen(false)}
        >
          <div
            className="w-full max-w-lg bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white rounded-t-3xl sm:rounded-3xl p-6 shadow-2xl border border-slate-200 dark:border-[#1E293B] space-y-6 max-h-[90vh] overflow-y-auto animate-in slide-in-from-bottom-6 duration-300"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header: User details & close */}
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-[#af0017]/10 dark:bg-[#af0017]/20 border border-[#af0017]/30 text-[#af0017] flex items-center justify-center font-bold text-lg">
                  {user?.firstName?.[0] || "B"}
                  {user?.lastName?.[0] || "C"}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 dark:text-white leading-tight">
                    {user?.firstName} {user?.lastName}
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                    Account: {primaryAccount?.accountNumber || "026014881"}
                  </p>
                  <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20 mt-1">
                    <span className="material-symbols-outlined text-[12px]">verified</span>
                    Verified
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#1E293B] text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white flex items-center justify-center transition-colors"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {/* Menu Title */}
            <div className="text-center">
              <h4 className="font-bold text-lg text-slate-900 dark:text-white">Banking Menu</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Select an option to continue
              </p>
            </div>

            {/* 3x3 Grid of colorful banking options (as in video) */}
            <div className="grid grid-cols-3 gap-3">
              {/* Home */}
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-emerald-50 dark:bg-emerald-950/30 hover:bg-emerald-100 dark:hover:bg-emerald-900/40 border border-emerald-200 dark:border-emerald-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 dark:bg-emerald-500/20 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">home</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Home</span>
              </Link>

              {/* History */}
              <Link
                href="/dashboard/transactions"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 hover:bg-amber-100 dark:hover:bg-amber-900/40 border border-amber-200 dark:border-amber-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 dark:bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">receipt_long</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">History</span>
              </Link>

              {/* Cards */}
              <Link
                href="/dashboard/cards"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-blue-50 dark:bg-blue-950/30 hover:bg-blue-100 dark:hover:bg-blue-900/40 border border-blue-200 dark:border-blue-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-blue-500/10 dark:bg-blue-500/20 text-blue-600 dark:text-blue-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">credit_card</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Cards</span>
              </Link>

              {/* Transfer */}
              <Link
                href="/dashboard/transfer"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-orange-50 dark:bg-orange-950/30 hover:bg-orange-100 dark:hover:bg-orange-900/40 border border-orange-200 dark:border-orange-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-orange-500/10 dark:bg-orange-500/20 text-orange-600 dark:text-orange-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">send_money</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Transfer</span>
              </Link>

              {/* Deposit */}
              <Link
                href="/dashboard/deposit"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-teal-50 dark:bg-teal-950/30 hover:bg-teal-100 dark:hover:bg-teal-900/40 border border-teal-200 dark:border-teal-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-teal-500/10 dark:bg-teal-500/20 text-teal-600 dark:text-teal-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">add_circle</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Deposit</span>
              </Link>

              {/* Loans */}
              <Link
                href="/dashboard/loans"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-purple-50 dark:bg-purple-950/30 hover:bg-purple-100 dark:hover:bg-purple-900/40 border border-purple-200 dark:border-purple-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-purple-500/10 dark:bg-purple-500/20 text-purple-600 dark:text-purple-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">account_balance</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Loans</span>
              </Link>

              {/* Settings */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  if (onOpenProfile) onOpenProfile();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-slate-200 dark:border-slate-700/40 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-slate-500/10 dark:bg-slate-500/20 text-slate-600 dark:text-slate-300 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">settings</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Settings</span>
              </button>

              {/* Support */}
              <a
                href="mailto:support@mail.beaconcapital.site"
                onClick={() => setMenuOpen(false)}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-indigo-50 dark:bg-indigo-950/30 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 border border-indigo-200 dark:border-indigo-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">headset_mic</span>
                </div>
                <span className="text-xs font-semibold text-slate-800 dark:text-slate-200">Support</span>
              </a>

              {/* Logout */}
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                className="flex flex-col items-center justify-center p-3.5 rounded-2xl bg-red-50 dark:bg-red-950/30 hover:bg-red-100 dark:hover:bg-red-900/40 border border-red-200 dark:border-red-800/30 transition-transform active:scale-95 group"
              >
                <div className="w-10 h-10 rounded-xl bg-red-500/10 dark:bg-red-500/20 text-red-600 dark:text-red-400 flex items-center justify-center mb-1.5">
                  <span className="material-symbols-outlined text-2xl">logout</span>
                </div>
                <span className="text-xs font-semibold text-red-600 dark:text-red-400">Logout</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
