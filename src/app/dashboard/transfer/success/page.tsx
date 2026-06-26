"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function TransferSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse receipt query params
  const amount = searchParams.get("amount") || "1,250.00";
  const transferType = searchParams.get("type") || "Wire Transfer";
  const recipientName = searchParams.get("recipient") || "Global Holdings Inc.";
  const sendingAccount = searchParams.get("sourceAccount") || "Institutional Checking *8812";
  const dateFormatted = searchParams.get("date") || "Oct 24, 2023";
  const timeFormatted = searchParams.get("time") || "14:32:05 EST";
  const refNumber = searchParams.get("ref") || "TXN-9021-P";

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased pb-10">
      {/* Top Header */}
      <header className="bg-white border-b border-surface-variant w-full h-16 flex items-center justify-between px-margin-mobile md:px-margin-desktop sticky top-0 z-40 shadow-sm">
        <div className="flex items-center gap-3">
          <button className="text-on-surface-variant hover:text-on-surface p-1">
            <span className="material-symbols-outlined" style={{ fontSize: "24px" }}>menu</span>
          </button>
          <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight">Beacon Capital</span>
        </div>
        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant">
          {/* Mock Advisor / User Avatar */}
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>person</span>
        </div>
      </header>

      {/* Main Success Container */}
      <main className="flex-1 max-w-[480px] w-full mx-auto px-margin-mobile pt-lg flex flex-col items-center text-center gap-md">
        {/* Green Success Badge */}
        <div className="w-16 h-16 rounded-full bg-[#E8F5E9] border-2 border-white ring-4 ring-[#C8E6C9] flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-[#2E7D32] fill-1" style={{ fontSize: "36px" }}>
            check_circle
          </span>
        </div>

        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
            Transfer Successful
          </h2>
          <div className="mt-sm inline-flex items-center gap-1 border border-[#C8E6C9] bg-[#E8F5E9] px-2 py-0.5">
            <span className="w-2.5 h-2.5 bg-[#2E7D32] inline-block"></span>
            <span className="font-label-sm text-label-sm font-bold text-[#2E7D32] uppercase tracking-wider">
              Completed
            </span>
          </div>
        </div>

        {/* Amount Box */}
        <div className="bg-surface-container-lowest border border-[#ffdad6] p-md w-full relative">
          <div className="font-label-sm text-label-sm text-on-surface-variant uppercase tracking-wider mb-xs">
            Amount Transferred
          </div>
          <div className="font-display-lg text-display-lg text-on-surface font-bold">
            ${amount}
          </div>
        </div>

        {/* Receipt details table */}
        <div className="bg-surface-container-lowest border border-surface-dim w-full text-left divide-y divide-surface-variant">
          <div className="p-sm flex justify-between items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Transfer Type</span>
            <span className="font-body-md text-body-md font-bold text-on-surface">{transferType}</span>
          </div>
          <div className="p-sm flex justify-between items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Recipient Name</span>
            <span className="font-body-md text-body-md font-bold text-on-surface">{recipientName}</span>
          </div>
          <div className="p-sm flex justify-between items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Sending Account</span>
            <span className="font-body-md text-body-md font-bold text-on-surface text-right">{sendingAccount}</span>
          </div>
          <div className="p-sm flex justify-between items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Date and Time</span>
            <span className="font-body-md text-body-md text-on-surface text-right font-semibold">
              <div>{dateFormatted}</div>
              <div className="text-xs text-on-surface-variant mt-0.5">{timeFormatted}</div>
            </span>
          </div>
          <div className="p-sm flex justify-between items-center gap-sm">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase">Reference Number</span>
            <span className="font-body-md text-body-md font-bold text-on-surface">{refNumber}</span>
          </div>
        </div>

        {/* Actions */}
        <div className="w-full flex flex-col gap-sm mt-xs">
          <Link 
            href="/dashboard" 
            className="w-full btn-primary text-center font-label-sm text-label-sm uppercase tracking-wider py-sm font-semibold"
          >
            Back to Dashboard
          </Link>
          <button 
            type="button" 
            onClick={() => window.print()}
            className="w-full btn-secondary py-sm font-label-sm text-label-sm uppercase tracking-wider font-semibold flex items-center justify-center gap-xs"
          >
            <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>description</span>
            View Transfer Receipt
          </button>
        </div>

        {/* Footnotes */}
        <div className="w-full mt-lg pt-lg border-t border-surface-variant flex flex-col items-center justify-center text-on-surface-variant gap-xs">
          <div className="flex items-center gap-xs font-label-sm text-label-sm uppercase font-bold text-on-surface-variant/80 tracking-widest">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified_user</span>
            256-bit Encrypted Connection
          </div>
          <p className="font-body-md text-body-md text-[11px] mt-xs text-center leading-relaxed text-on-surface-variant/70">
            Funds transferred via wire are generally available within the same business day, subject to cut-off times and institutional verification. Beacon Capital is a member of FDIC and an Equal Housing Lender.
          </p>
          <div className="h-0.5 bg-primary w-8 mt-lg"></div>
          <div className="font-label-sm text-label-sm font-bold tracking-widest text-primary text-[10px] uppercase mt-sm">
            Beacon Capital Institutional
          </div>
        </div>
      </main>
    </div>
  );
}

export default function TransferSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">sync</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Generating Receipt...</p>
        </div>
      </div>
    }>
      <TransferSuccessContent />
    </Suspense>
  );
}
