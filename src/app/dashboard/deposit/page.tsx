"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Account } from "@/lib/db";

export default function MobileDepositPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Deposit form states
  const [targetAccountId, setTargetAccountId] = useState("");
  const [amount, setAmount] = useState("");
  const [flashOn, setFlashOn] = useState(false);

  // Capture check photo simulation states
  const [frontCaptured, setFrontCaptured] = useState(false);
  const [backCaptured, setBackCaptured] = useState(false);
  const [capturingSide, setCapturingSide] = useState<"front" | "back" | null>(null);

  const [formError, setFormError] = useState("");
  const [formLoading, setFormLoading] = useState(false);

  const fetchProfile = async () => {
    try {
      const res = await fetch("/api/auth/me");
      if (!res.ok) {
        router.push("/login");
        return;
      }
      const data = await res.json();
      setUser(data.user);
      setAccounts(data.accounts);
      if (data.accounts.length > 0) {
        // Default select checking account
        const checking = data.accounts.find((a: Account) => a.accountType === "checking");
        setTargetAccountId(checking ? checking.id : data.accounts[0].id);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Simulate snapping photo in camera viewport
  const handleSnapPhoto = () => {
    if (capturingSide === "front") {
      setFrontCaptured(true);
    } else if (capturingSide === "back") {
      setBackCaptured(true);
    }
    setCapturingSide(null);
  };

  const handleSubmitDeposit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isFrozen) {
      setFormError(`Declined: Your account has been frozen. Reason: ${user.frozenReason}`);
      return;
    }
    setFormError("");

    if (!frontCaptured || !backCaptured) {
      setFormError("Please capture photos of both the front and back of the check.");
      return;
    }

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid check amount.");
      return;
    }

    if (parsedAmount > 5000.00) {
      setFormError("Amount exceeds daily check deposit limit of $5,000.00.");
      return;
    }

    setFormLoading(true);

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: "deposit",
          targetAccountId,
          amount,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Deposit failed");
      }

      // Redirect to Mobile Deposit success page
      const params = new URLSearchParams({
        amount: data.details.amount.toFixed(2),
        accountName: data.details.targetAccountName,
        accountMask: data.details.targetAccountMask,
        date: data.details.date,
        time: data.details.time,
        ref: data.referenceNumber,
      });

      router.push(`/dashboard/deposit/success?${params.toString()}`);
    } catch (err: any) {
      setFormError(err.message || "An unexpected error occurred");
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">sync</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Opening Secure Camera Feed...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="text-on-background bg-background min-h-screen flex flex-col pt-16 pb-20 md:pb-0 md:pt-0">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed top-0 w-full z-50 flex justify-between items-center bg-primary text-on-primary px-margin-mobile h-16 border-b border-outline">
        <button aria-label="Menu" className="p-2 -ml-2 text-on-primary">
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-headline-md text-headline-md font-bold text-on-primary">BEACON CAPITAL</div>
        <button onClick={handleLogout} className="p-2 -mr-2 text-on-primary">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <div className="flex flex-1 max-w-[1200px] mx-auto w-full md:px-margin-desktop md:py-margin-desktop">
        {/* NavigationDrawer Desktop */}
        <aside className="hidden md:flex flex-col h-screen sticky top-0 bg-surface-container-low w-80 left-0 border-r border-outline mr-gutter">
          <div className="p-6 border-b border-outline">
            <div className="font-headline-md text-headline-md font-bold text-primary mb-6">BEACON CAPITAL</div>
            <div className="font-label-sm text-label-sm font-bold text-primary text-xs uppercase tracking-wider">CLIENT PORTAL</div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            <Link className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="/dashboard">
              <span className="material-symbols-outlined mr-3">dashboard</span>
              <span className="font-body-md text-body-md">Dashboard</span>
            </Link>
            <Link className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="/dashboard/transactions">
              <span className="material-symbols-outlined mr-3">account_balance_wallet</span>
              <span className="font-body-md text-body-md">Ledger Management</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200">
              <span className="material-symbols-outlined mr-3">logout</span>
              <span className="font-body-md text-body-md">Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col gap-md px-margin-mobile md:px-0 mt-6 md:mt-0 max-w-[480px] mx-auto">
          {user?.isFrozen && (
            <div className="bg-[#FFEBEE] border-2 border-[#D32F2F] text-[#D32F2F] p-4 rounded-none flex items-start gap-3">
              <span className="material-symbols-outlined text-[#D32F2F] mt-0.5">warning</span>
              <div>
                <h4 className="font-bold text-[#C62828] uppercase tracking-wider text-sm">Account Frozen</h4>
                <p className="text-sm mt-0.5 font-semibold">Reason: {user.frozenReason}</p>
                <p className="text-xs text-[#E53935] mt-1">All check deposits are disabled.</p>
              </div>
            </div>
          )}
          {/* Back button */}
          <div>
            <Link href="/dashboard" className="inline-flex items-center gap-xs font-label-sm text-label-sm text-on-surface hover:text-primary transition-colors uppercase tracking-wider font-semibold">
              <span className="material-symbols-outlined" style={{ fontSize: "16px" }}>arrow_back</span>
              Back to Accounts
            </Link>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background font-bold mt-sm">
              Mobile Deposit
            </h1>
          </div>

          {formError && (
            <div className="bg-error-container border border-error text-error text-sm p-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontSize: "20px" }}>error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Camera feed simulator / Check capture box */}
          {capturingSide ? (
            /* ACTIVE CAMERA SIMULATION */
            <div className="relative aspect-[16/9] w-full bg-[#1A1C1C] border border-outline-variant flex flex-col items-center justify-center p-md text-white select-none">
              {/* Corner focus brackets */}
              <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-white"></div>
              <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-white"></div>
              <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-white"></div>
              <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-white"></div>

              {/* Inner target box */}
              <div className="w-[85%] h-[65%] border-2 border-dashed border-white/60 flex flex-col items-center justify-center bg-white/5 backdrop-blur-xs">
                <span className="font-label-sm text-label-sm tracking-wider uppercase opacity-80">
                  Align {capturingSide} of check
                </span>
              </div>

              {/* Camera control button overlays */}
              <div className="absolute bottom-6 flex justify-between items-center w-full px-lg z-20">
                <button 
                  type="button"
                  onClick={() => setFlashOn(!flashOn)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                    flashOn ? "bg-secondary-container text-primary border-primary" : "bg-black/40 text-white border-white/40"
                  }`}
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: flashOn ? "'FILL' 1" : "'FILL' 0" }}>
                    flash_on
                  </span>
                </button>
                <button
                  type="button"
                  onClick={handleSnapPhoto}
                  className="w-14 h-14 bg-white rounded-full flex items-center justify-center border-4 border-black/20 hover:scale-105 active:scale-95 transition-transform"
                >
                  <div className="w-10 h-10 bg-primary rounded-full"></div>
                </button>
                <button
                  type="button"
                  onClick={() => setCapturingSide(null)}
                  className="px-sm py-xs font-label-sm text-label-sm bg-black/40 border border-white/40 uppercase font-semibold"
                >
                  Cancel
                </button>
              </div>
            </div>
          ) : (
            /* CAMERA PREVIEW VIEWER */
            <div className="relative aspect-[16/9] w-full bg-[#37474F] border border-outline flex flex-col items-center justify-center select-none shadow-inner">
              <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1554415707-6e8cfc93fe23?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-25"></div>
              <div className="relative z-10 border border-dashed border-white/30 p-sm text-center max-w-[280px]">
                <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-white/40"></div>
                <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-white/40"></div>
                <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-white/40"></div>
                <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-white/40"></div>
                
                <span className="material-symbols-outlined text-white/50 text-[36px] mb-xs">photo_camera</span>
                <p className="font-label-sm text-label-sm text-white/80 uppercase tracking-widest font-semibold">
                  Secure Camera Viewport
                </p>
              </div>
            </div>
          )}

          {/* Info Banner block */}
          <div className="bg-surface-container-low border-l-4 border-primary p-sm flex gap-sm items-start">
            <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>info</span>
            <p className="font-body-md text-body-md text-xs text-on-surface-variant leading-relaxed">
              Center your check within the frame and ensure it's well-lit.
            </p>
          </div>

          {/* Capture grid */}
          <div className="grid grid-cols-2 gap-sm">
            {/* Front Check Slot */}
            <button
              type="button"
              onClick={() => { setCapturingSide("front"); setFormError(""); }}
              className={`p-md border flex flex-col items-center justify-center text-center transition-all min-h-[120px] ${
                frontCaptured 
                  ? "border-[#2E7D32] bg-[#E8F5E9]/30" 
                  : "border-primary bg-primary/5 hover:bg-primary/10"
              }`}
            >
              {frontCaptured ? (
                <>
                  <span className="material-symbols-outlined text-[#2E7D32] text-[28px] mb-xs fill-1">check_circle</span>
                  <span className="font-label-sm text-label-sm text-[#2E7D32] uppercase font-bold">Front Captured</span>
                  <span className="text-[10px] text-on-surface-variant mt-xs hover:underline text-primary">Retake Photo</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-primary text-[28px] mb-xs">photo_camera</span>
                  <span className="font-label-sm text-label-sm text-primary uppercase font-bold">Front of Check</span>
                  <span className="text-[10px] text-on-surface-variant mt-xs">Required</span>
                </>
              )}
            </button>

            {/* Back Check Slot */}
            <button
              type="button"
              onClick={() => { setCapturingSide("back"); setFormError(""); }}
              className={`p-md border flex flex-col items-center justify-center text-center transition-all min-h-[120px] ${
                backCaptured 
                  ? "border-[#2E7D32] bg-[#E8F5E9]/30" 
                  : "border-outline-variant bg-surface-container-low hover:bg-surface-container-high"
              }`}
            >
              {backCaptured ? (
                <>
                  <span className="material-symbols-outlined text-[#2E7D32] text-[28px] mb-xs fill-1">check_circle</span>
                  <span className="font-label-sm text-label-sm text-[#2E7D32] uppercase font-bold">Back Captured</span>
                  <span className="text-[10px] text-on-surface-variant mt-xs hover:underline text-primary">Retake Photo</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-on-surface-variant text-[28px] mb-xs">photo_camera</span>
                  <span className="font-label-sm text-label-sm text-on-surface uppercase font-bold">Back of Check</span>
                  <span className="text-[10px] text-on-surface-variant mt-xs">Not Captured</span>
                </>
              )}
            </button>
          </div>

          {/* Form parameters */}
          <div className="bg-surface-container-lowest border border-surface-dim p-md shadow-sm">
            <form onSubmit={handleSubmitDeposit} className="space-y-md">
              {/* Target Account */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
                  Deposit To
                </label>
                <select
                  className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                  value={targetAccountId}
                  onChange={(e) => setTargetAccountId(e.target.value)}
                  required
                >
                  {accounts.filter(a => a.accountType !== "credit").map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (*{a.accountNumber.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount input */}
              <div className="flex flex-col gap-xs pt-xs">
                <div className="flex justify-between items-center">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
                    Check Amount
                  </label>
                  <span className="font-label-sm text-label-sm text-on-surface-variant">
                    Daily Limit Remaining: <span className="font-bold text-on-surface">$5,000.00</span>
                  </span>
                </div>
                <div className="relative border border-outline-variant bg-surface">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-sm font-headline-lg text-headline-lg text-on-surface">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    max={5000}
                    className="w-full bg-transparent pl-8 pr-sm py-md font-headline-lg text-headline-lg font-bold text-on-surface focus:outline-none border-none ring-0 placeholder:text-surface-dim"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Security notice box */}
              <div className="border border-outline-variant p-sm bg-surface-container-low flex flex-col gap-xs">
                <div className="flex items-center gap-xs font-label-sm text-label-sm font-bold text-on-surface uppercase tracking-wider">
                  <span className="material-symbols-outlined text-[16px]">verified_user</span>
                  Security Notice
                </div>
                <p className="font-body-md text-body-md text-xs text-on-surface-variant leading-relaxed">
                  Ensure the back of the check is endorsed and marked <strong>"For Mobile Deposit Only at Beacon Capital"</strong>. Funds are typically available within 1-2 business days.
                </p>
              </div>

              {/* Submit button */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-primary text-on-primary font-headline-md font-bold py-md px-md rounded-none hover:bg-primary-container transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm disabled:bg-primary/50"
              >
                <span className="material-symbols-outlined text-[20px] font-bold">input</span>
                {formLoading ? "Uploading secure capture..." : "Submit Deposit"}
              </button>
            </form>
          </div>
        </main>
      </div>

      {/* BottomNavBar Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface px-2 py-3 border-t border-outline text-primary font-label-sm text-label-sm shadow-none">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-full" href="/dashboard">
          <span className="material-symbols-outlined mb-1">account_balance</span>
          <span>Accounts</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary font-bold p-2 w-full" href="/dashboard/transfer">
          <span className="material-symbols-outlined mb-1">payments</span>
          <span>Pay &amp; Transfer</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-full" href="/dashboard/transactions">
          <span className="material-symbols-outlined mb-1">trending_up</span>
          <span>Brokerage</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center text-on-surface-variant p-2 w-full">
          <span className="material-symbols-outlined mb-1">logout</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}
