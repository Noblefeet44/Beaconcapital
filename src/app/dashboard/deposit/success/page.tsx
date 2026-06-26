"use client";

import React, { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

function DepositSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Parse receipt query params
  const amount = searchParams.get("amount") || "250.00";
  const accountName = searchParams.get("accountName") || "Checking *8842";
  const dateFormatted = searchParams.get("date") || "Oct 24, 2023";
  const timeFormatted = searchParams.get("time") || "2:45 PM";
  const refNumber = searchParams.get("ref") || "REF-8293-X";

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased pb-10">
      {/* Top Header */}
      <header className="bg-white border-b border-surface-variant w-full h-16 flex items-center justify-between px-margin-mobile md:px-margin-desktop sticky top-0 z-40 shadow-sm">
        <span className="font-headline-md text-headline-md font-bold text-primary tracking-tight px-sm">
          Beacon Capital
        </span>
        <div className="w-9 h-9 rounded-full bg-surface-container flex items-center justify-center overflow-hidden border border-outline-variant mr-sm">
          <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "20px" }}>person</span>
        </div>
      </header>

      {/* Main Success Container */}
      <main className="flex-1 max-w-[480px] w-full mx-auto px-margin-mobile pt-lg flex flex-col items-center text-center gap-md">
        {/* Red Success Badge */}
        <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-white ring-4 ring-primary/20 flex items-center justify-center shadow-sm">
          <span className="material-symbols-outlined text-primary fill-1" style={{ fontSize: "36px" }}>
            check
          </span>
        </div>

        <div>
          <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg font-bold text-on-surface">
            Transaction Complete
          </h2>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
            Your request has been successfully processed.
          </p>
        </div>

        {/* Receipt Container */}
        <div className="bg-surface-container-lowest border border-surface-dim p-md w-full text-left space-y-md shadow-sm">
          {/* Amount */}
          <div className="border-b border-outline-variant pb-md flex justify-between items-end">
            <span className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold">Amount</span>
            <span className="font-display-lg text-display-lg text-primary font-bold">${amount}</span>
          </div>

          <div className="grid grid-cols-2 gap-md text-sm">
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold mb-xs">Type</div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">Mobile Deposit</div>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold mb-xs">Reference</div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">{refNumber}</div>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold mb-xs">To Account</div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">{accountName}</div>
            </div>
            <div>
              <div className="font-label-sm text-label-sm text-on-surface-variant uppercase font-bold mb-xs">Date &amp; Time</div>
              <div className="font-body-md text-body-md font-semibold text-on-surface">
                {dateFormatted} | {timeFormatted}
              </div>
            </div>
          </div>

          {/* Status Box */}
          <div className="bg-surface-container-low border border-outline-variant p-sm flex items-center gap-xs">
            <span className="w-2.5 h-2.5 bg-[#2E7D32] inline-block"></span>
            <span className="font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
              Status: Confirmed
            </span>
          </div>
        </div>

        {/* Action Buttons */}
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
            View Receipt
          </button>
          
          <Link
            href="/dashboard/deposit"
            className="font-label-sm text-label-sm text-on-surface-variant hover:text-primary uppercase tracking-widest font-bold mt-sm transition-colors"
          >
            Make Another Transaction
          </Link>
        </div>

        {/* Footnotes */}
        <div className="w-full mt-lg pt-lg border-t border-surface-variant flex flex-col items-center justify-center text-on-surface-variant gap-xs">
          <div className="flex items-center gap-xs font-label-sm text-label-sm uppercase font-bold text-on-surface-variant/80 tracking-widest">
            <span className="material-symbols-outlined" style={{ fontSize: "18px" }}>verified_user</span>
            256-bit Encrypted Connection
          </div>
          <p className="font-body-md text-body-md text-[11px] mt-xs text-center leading-relaxed text-on-surface-variant/70">
            Beacon Capital is a Member of FDIC and Equal Housing Lender. All transactions are subject to institutional verification.
          </p>
        </div>
      </main>
    </div>
  );
}

export default function DepositSuccessPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">sync</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Generating Receipt...</p>
        </div>
      </div>
    }>
      <DepositSuccessContent />
    </Suspense>
  );
}
