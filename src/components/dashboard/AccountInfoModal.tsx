"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Account, DEFAULT_ROUTING_NUMBER } from "@/lib/db";

interface AccountInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  user: any;
  accounts: Account[];
}

export default function AccountInfoModal({
  isOpen,
  onClose,
  user,
  accounts,
}: AccountInfoModalProps) {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => {
      setCopiedKey(null);
    }, 2000);
  };

  const fullName = `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "Account Holder";
  const defaultRouting = user?.routingNumber || DEFAULT_ROUTING_NUMBER;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white dark:bg-[#0E131F] text-slate-900 dark:text-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 dark:border-[#1E293B] max-h-[90vh] overflow-y-auto animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 dark:border-[#1E293B] pb-5">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-[#af0017]/10 dark:bg-[#af0017]/20 border border-[#af0017]/30 text-[#af0017] dark:text-[#E53935] flex items-center justify-center shrink-0">
              <span className="material-symbols-outlined text-2xl">account_balance</span>
            </div>
            <div>
              <h3 className="font-bold text-lg sm:text-xl text-slate-900 dark:text-white leading-tight">
                Account Information &amp; Routing
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Official institutional banking coordinates &amp; routing numbers
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-slate-100 dark:bg-[#1A2436] text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white flex items-center justify-center transition-colors shrink-0"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        {/* User Full Name & Beneficiary Card */}
        <div className="mt-5 p-4 rounded-2xl bg-gradient-to-r from-slate-50 to-slate-100 dark:from-[#131B2A] dark:to-[#172236] border border-slate-200/80 dark:border-slate-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Primary Account Holder / Full Name
              </span>
              <div className="text-base sm:text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                <span>{fullName}</span>
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  <span className="material-symbols-outlined text-[12px]">verified</span>
                  Verified
                </span>
              </div>
            </div>
            <div className="sm:text-right">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Registered Email / User ID
              </span>
              <div className="text-xs sm:text-sm font-mono text-slate-700 dark:text-slate-300 mt-0.5 break-all">
                {user?.email || user?.username || "N/A"}
              </div>
            </div>
          </div>
        </div>

        {/* Accounts List */}
        <div className="mt-6 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="font-bold text-sm text-slate-900 dark:text-white uppercase tracking-wider text-xs">
              Your Bank Accounts ({accounts.length})
            </h4>
            <span className="text-[11px] text-slate-500 dark:text-slate-400">
              ACH &amp; Wire eligible
            </span>
          </div>

          {accounts.length === 0 ? (
            <div className="p-8 text-center bg-slate-50 dark:bg-[#131B2A] rounded-2xl border border-dashed border-slate-300 dark:border-slate-800">
              <span className="material-symbols-outlined text-4xl text-slate-400">credit_card_off</span>
              <p className="text-sm font-semibold text-slate-600 dark:text-slate-400 mt-2">
                No active accounts found
              </p>
            </div>
          ) : (
            accounts.map((acc, index) => {
              const routing = acc.routingNumber || defaultRouting;
              const isChecking = acc.accountType === "checking";
              const isSavings = acc.accountType === "savings";
              const isLoan = acc.accountType === "loan";

              return (
                <div
                  key={acc.id || index}
                  className="p-5 rounded-2xl bg-white dark:bg-[#111927] border border-slate-200 dark:border-[#1E293B] shadow-sm hover:border-[#af0017]/40 dark:hover:border-[#af0017]/50 transition-all space-y-4"
                >
                  {/* Account Name & Type & Balance */}
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-[#1E293B] pb-3">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                          isChecking
                            ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                            : isSavings
                            ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                            : "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                        }`}
                      >
                        <span className="material-symbols-outlined text-xl">
                          {isChecking ? "account_balance_wallet" : isSavings ? "savings" : "payments"}
                        </span>
                      </div>
                      <div>
                        <div className="font-bold text-sm text-slate-900 dark:text-white">
                          {acc.accountName || `${acc.accountType.toUpperCase()} Account`}
                        </div>
                        <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {acc.accountType}
                        </span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs text-slate-500 dark:text-slate-400">Available Balance</div>
                      <div className="font-bold text-base text-slate-900 dark:text-white font-mono">
                        ${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Routing Number & Account Number details */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
                    {/* Routing Number */}
                    <div className="p-3 bg-slate-50 dark:bg-[#162132] rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Bank Routing Number (ABA)
                        </span>
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {routing}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(routing, `routing-${acc.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1F2E45] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                        title="Copy Routing Number"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedKey === `routing-${acc.id}` ? "check" : "content_copy"}
                        </span>
                        <span>{copiedKey === `routing-${acc.id}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>

                    {/* Account Number */}
                    <div className="p-3 bg-slate-50 dark:bg-[#162132] rounded-xl border border-slate-100 dark:border-slate-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                          Account Number
                        </span>
                        <span className="font-mono text-sm sm:text-base font-bold text-slate-900 dark:text-white">
                          {acc.accountNumber}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopy(acc.accountNumber, `acc-${acc.id}`)}
                        className="px-2.5 py-1.5 rounded-lg bg-white dark:bg-[#1F2E45] border border-slate-200 dark:border-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 flex items-center gap-1 transition-colors"
                        title="Copy Account Number"
                      >
                        <span className="material-symbols-outlined text-[14px]">
                          {copiedKey === `acc-${acc.id}` ? "check" : "content_copy"}
                        </span>
                        <span>{copiedKey === `acc-${acc.id}` ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Institution Wire & ACH Details */}
        <div className="mt-6 p-4 rounded-2xl bg-amber-500/5 dark:bg-amber-500/10 border border-amber-500/20 text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-900 dark:text-amber-300">
            <span className="material-symbols-outlined text-base">info</span>
            <span>Wire &amp; Direct Deposit Instructions</span>
          </div>
          <p className="leading-relaxed text-[11px] text-slate-600 dark:text-slate-400">
            Use the Routing Number and your respective Account Number above for incoming ACH payroll, direct deposits, domestic wires, and merchant settlements.
          </p>
          <div className="grid grid-cols-2 gap-2 pt-1 text-[11px] font-mono">
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">Bank Name:</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">Beacon Capital Trust &amp; Bank</span>
            </div>
            <div>
              <span className="text-slate-500 dark:text-slate-400 block">SWIFT/BIC (Wire):</span>
              <span className="font-bold text-slate-800 dark:text-slate-200">BCONUS33NYC</span>
            </div>
          </div>
        </div>

        {/* Modal Actions */}
        <div className="mt-6 pt-4 border-t border-slate-100 dark:border-[#1E293B] flex flex-col sm:flex-row items-center justify-between gap-3">
          <Link
            href="/dashboard/profile"
            onClick={onClose}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-200 font-bold text-xs transition-colors"
          >
            <span className="material-symbols-outlined text-base">badge</span>
            <span>View Full User Profile &amp; Address</span>
          </Link>

          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-primary text-white font-bold text-xs hover:bg-primary-container transition-colors shadow-sm"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
