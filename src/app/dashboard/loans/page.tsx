"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Account } from "@/lib/db";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function LoansPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [routingNumber, setRoutingNumber] = useState("026014881");
  const [loading, setLoading] = useState(true);

  // Loan Modal states
  const [activeLoanModal, setActiveLoanModal] = useState<"pay" | "apply" | null>(null);
  const [loanLoading, setLoanLoading] = useState(false);
  const [loanError, setLoanError] = useState("");
  const [loanSuccess, setLoanSuccess] = useState("");
  const [loanFormData, setLoanFormData] = useState({
    loanAccountId: "",
    sourceAccountId: "",
    amount: "",
    loanName: "",
    termMonths: "60",
    purpose: "Commercial Real Estate",
  });

  const fetchLoanData = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) router.push("/login");
        throw new Error("Failed to load session");
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
      if (data.routingNumber) setRoutingNumber(data.routingNumber);

      const nonLoanAccs = (data.accounts || []).filter((a: any) => a.accountType !== "loan");
      const defaultSource = nonLoanAccs[0] || (data.accounts || [])[0];
      const loanAcc = (data.accounts || []).find((a: any) => a.accountType === "loan");

      if (loanAcc) {
        setLoanFormData((prev) => ({
          ...prev,
          loanAccountId: loanAcc.id,
          sourceAccountId: defaultSource?.id || "",
          amount: (loanAcc.monthlyPayment || 3420).toString(),
        }));
      }
    } catch (err) {
      console.error("Error loading loans:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLoanData();
  }, []);

  const handlePayLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoanLoading(true);
    setLoanError("");
    setLoanSuccess("");
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "pay",
          loanAccountId: loanFormData.loanAccountId,
          sourceAccountId: loanFormData.sourceAccountId,
          amount: loanFormData.amount,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");
      setLoanSuccess(`Payment of $${parseFloat(loanFormData.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} successfully applied to facility.`);
      await fetchLoanData();
      setTimeout(() => {
        setActiveLoanModal(null);
        setLoanSuccess("");
      }, 1600);
    } catch (err: any) {
      setLoanError(err.message || "Payment execution failed");
    } finally {
      setLoanLoading(false);
    }
  };

  const handleApplyLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoanLoading(true);
    setLoanError("");
    setLoanSuccess("");
    try {
      const res = await fetch("/api/loans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "apply",
          loanName: `Beacon ${loanFormData.purpose} Facility`,
          amount: loanFormData.amount,
          interestRate: 5.25,
          termMonths: loanFormData.termMonths,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Application failed");
      setLoanSuccess("Institutional facility approved and active in your client portfolio.");
      await fetchLoanData();
      setTimeout(() => {
        setActiveLoanModal(null);
        setLoanSuccess("");
      }, 1600);
    } catch (err: any) {
      setLoanError(err.message || "Loan application failed");
    } finally {
      setLoanLoading(false);
    }
  };

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">
            sync
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">
            Accessing Loan Facilities...
          </p>
        </div>
      </div>
    );
  }

  const primaryAccount = accounts.find((a) => a.accountType !== "loan") || accounts[0];
  const loanAccounts = accounts.filter((a) => a.accountType === "loan");
  const fundingAccounts = accounts.filter((a) => a.accountType !== "loan");

  return (
    <div className="text-on-background bg-background min-h-screen flex flex-col pt-16 pb-24 md:pb-0 md:pt-0">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed z-50 flex justify-between items-center w-full px-4 h-16 bg-[#0E131F] text-white top-0 border-b border-[#1C2433]">
        <Link href="/dashboard" className="flex items-center gap-2 text-white">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-bold text-sm uppercase tracking-wider">Dashboard</span>
        </Link>
        <span className="font-bold text-sm tracking-wider uppercase text-[#D4AF37]">
          Loans &amp; Facilities
        </span>
        <button onClick={handleLogout} aria-label="Logout" className="p-2 text-slate-400 hover:text-white">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <div className="flex flex-1 relative max-w-[1200px] mx-auto w-full md:px-margin-desktop md:py-margin-desktop">
        {/* Desktop Sidebar Navigation */}
        <aside className="hidden md:flex flex-col h-screen sticky top-0 bg-surface-container-low w-80 left-0 border-r border-outline shadow-none transition-all duration-200 ease-in-out mr-gutter">
          <div className="p-6 border-b border-outline">
            <div className="font-headline-md text-headline-md font-bold text-primary mb-2">
              BEACON CAPITAL
            </div>
            <div className="font-label-sm text-label-sm font-bold text-primary text-xs uppercase tracking-wider">
              CLIENT PORTAL
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              href="/dashboard"
            >
              <span className="material-symbols-outlined mr-3">dashboard</span>
              <span className="font-body-md text-body-md">Dashboard</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              href="/dashboard/cards"
            >
              <span className="material-symbols-outlined mr-3">credit_card</span>
              <span className="font-body-md text-body-md">Credit Cards</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded bg-primary text-on-primary font-bold transition-colors duration-200"
              href="/dashboard/loans"
            >
              <span className="material-symbols-outlined mr-3">account_balance</span>
              <span className="font-body-md text-body-md">Loans &amp; Facilities</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              href="/dashboard/transactions"
            >
              <span className="material-symbols-outlined mr-3">receipt_long</span>
              <span className="font-body-md text-body-md">History</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              href="/dashboard/transfer"
            >
              <span className="material-symbols-outlined mr-3">swap_horiz</span>
              <span className="font-body-md text-body-md">Transfers</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              href="/dashboard/deposit"
            >
              <span className="material-symbols-outlined mr-3">add_circle</span>
              <span className="font-body-md text-body-md">Deposit</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
              href="/dashboard/profile"
            >
              <span className="material-symbols-outlined mr-3">person</span>
              <span className="font-body-md text-body-md">My Profile</span>
            </Link>
            <div className="my-2 border-t border-surface-dim" />
            <button
              onClick={handleLogout}
              className="w-full flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
            >
              <span className="material-symbols-outlined mr-3">logout</span>
              <span className="font-body-md text-body-md">Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col gap-6 px-4 md:px-0 mt-4 md:mt-0">
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-surface-dim pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37] text-2xl">account_balance</span>
                <h1 className="text-xl md:text-2xl font-bold text-on-background">
                  Institutional Credit &amp; Term Facilities
                </h1>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                Structured commercial lending, real estate senior credit, and revolving operational liquidity.
              </p>
            </div>
            <button
              onClick={() => {
                setActiveLoanModal("apply");
                setLoanError("");
                setLoanSuccess("");
              }}
              className="px-4 py-2.5 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 rounded-lg transition-colors shadow-sm self-start sm:self-auto"
            >
              <span className="material-symbols-outlined text-sm">add_circle</span>
              <span>Apply for Facility</span>
            </button>
          </div>

          {loanAccounts.length === 0 ? (
            <div className="bg-surface-container-lowest border border-surface-dim rounded-2xl p-10 text-center text-on-surface-variant space-y-3">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/60">
                account_balance_wallet
              </span>
              <h3 className="text-lg font-bold text-on-background">No Active Loan Facilities</h3>
              <p className="text-sm max-w-md mx-auto">
                You currently have no outstanding loan accounts. Tap below to submit a facility application.
              </p>
              <button
                onClick={() => setActiveLoanModal("apply")}
                className="mt-2 px-5 py-2.5 bg-primary text-white text-xs font-bold uppercase tracking-wider rounded-lg"
              >
                Apply for Commercial Facility
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {loanAccounts.map((loan) => (
                <div
                  key={loan.id}
                  className="bg-surface-container-lowest border border-surface-dim rounded-2xl p-6 shadow-sm flex flex-col justify-between space-y-5"
                >
                  <div className="space-y-3">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                        Senior Secured Facility
                      </span>
                      <span className="text-[11px] font-mono px-2.5 py-0.5 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 rounded-full font-bold">
                        Active &amp; Performing
                      </span>
                    </div>

                    <h3 className="font-bold text-lg text-on-background">
                      {loan.accountName}
                    </h3>
                    <p className="text-xs text-on-surface-variant font-mono">
                      Acct: {loan.accountNumber} • Routing: {loan.routingNumber || routingNumber}
                    </p>

                    {/* Balance */}
                    <div className="pt-2">
                      <span className="text-xs text-on-surface-variant uppercase tracking-wider">Remaining Principal</span>
                      <div className="font-mono text-2xl font-bold text-amber-500 mt-0.5">
                        ${Math.abs(loan.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                    </div>

                    {/* Terms grid */}
                    <div className="grid grid-cols-2 gap-3 pt-2 text-xs font-mono bg-surface-container/40 p-3 rounded-xl border border-surface-dim">
                      <div>
                        <span className="text-on-surface-variant block">Interest Rate</span>
                        <strong className="text-on-background text-sm">{loan.interestRate || 5.25}% Fixed APR</strong>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Monthly Installment</span>
                        <strong className="text-on-background text-sm">
                          ${(loan.monthlyPayment || 3420).toLocaleString("en-US", { minimumFractionDigits: 2 })}/mo
                        </strong>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Term Length</span>
                        <strong className="text-on-background">{loan.loanTerm || "60 Months"}</strong>
                      </div>
                      <div>
                        <span className="text-on-surface-variant block">Next Due Date</span>
                        <strong className="text-on-background">Oct 15, 2026</strong>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-dim flex gap-3">
                    <button
                      onClick={() => {
                        setLoanFormData((prev) => ({
                          ...prev,
                          loanAccountId: loan.id,
                          amount: (loan.monthlyPayment || 3420).toString(),
                        }));
                        setActiveLoanModal("pay");
                        setLoanError("");
                        setLoanSuccess("");
                      }}
                      className="flex-1 py-2.5 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider rounded-lg flex items-center justify-center gap-1.5 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">payments</span>
                      <span>Make Payment</span>
                    </button>
                    <Link
                      href={`/dashboard/transactions?accountId=${loan.id}`}
                      className="px-4 py-2.5 bg-surface-container hover:bg-surface-container-high border border-outline text-on-surface text-xs font-bold uppercase tracking-wider rounded-lg flex items-center gap-1 transition-colors"
                    >
                      <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                      <span>History</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      {/* ── Modal: Make Loan Payment ── */}
      {activeLoanModal === "pay" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLoanModal(null)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest border border-surface-dim p-6 shadow-2xl rounded-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-surface-dim pb-3">
              <h3 className="font-bold text-base text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-primary">payments</span>
                Make Loan Payment
              </h3>
              <button
                onClick={() => setActiveLoanModal(null)}
                className="text-on-surface-variant hover:text-on-background"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {loanError && (
              <div className="p-3 bg-red-900/20 border border-red-500/40 text-red-400 text-xs rounded">
                {loanError}
              </div>
            )}
            {loanSuccess && (
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/40 text-emerald-400 text-xs rounded">
                {loanSuccess}
              </div>
            )}

            <form onSubmit={handlePayLoan} className="space-y-4 text-xs">
              <div>
                <label className="block text-on-surface-variant uppercase font-bold mb-1">
                  Funding Account (Deducted From)
                </label>
                <select
                  value={loanFormData.sourceAccountId}
                  onChange={(e) => setLoanFormData({ ...loanFormData, sourceAccountId: e.target.value })}
                  required
                  className="w-full bg-surface-container border border-outline p-2.5 text-on-surface rounded-lg"
                >
                  {fundingAccounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} (${acc.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant uppercase font-bold mb-1">
                  Payment Amount ($ USD)
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  value={loanFormData.amount}
                  onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                  required
                  className="w-full bg-surface-container border border-outline p-2.5 text-on-surface font-mono font-bold rounded-lg"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLoanModal(null)}
                  className="flex-1 py-2.5 bg-surface-container border border-outline text-on-surface font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loanLoading}
                  className="flex-1 py-2.5 bg-primary text-white font-bold uppercase tracking-wider rounded-lg disabled:opacity-50"
                >
                  {loanLoading ? "Processing..." : "Confirm Payment"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Modal: Apply for Loan Facility ── */}
      {activeLoanModal === "apply" && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setActiveLoanModal(null)}
        >
          <div
            className="w-full max-w-md bg-surface-container-lowest border border-surface-dim p-6 shadow-2xl rounded-2xl space-y-4 animate-in zoom-in-95 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex justify-between items-center border-b border-surface-dim pb-3">
              <h3 className="font-bold text-base text-on-background flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37]">account_balance</span>
                Apply for Institutional Facility
              </h3>
              <button
                onClick={() => setActiveLoanModal(null)}
                className="text-on-surface-variant hover:text-on-background"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {loanError && (
              <div className="p-3 bg-red-900/20 border border-red-500/40 text-red-400 text-xs rounded">
                {loanError}
              </div>
            )}
            {loanSuccess && (
              <div className="p-3 bg-emerald-900/20 border border-emerald-500/40 text-emerald-400 text-xs rounded">
                {loanSuccess}
              </div>
            )}

            <form onSubmit={handleApplyLoan} className="space-y-4 text-xs">
              <div>
                <label className="block text-on-surface-variant uppercase font-bold mb-1">
                  Facility Purpose / Type
                </label>
                <select
                  value={loanFormData.purpose}
                  onChange={(e) => setLoanFormData({ ...loanFormData, purpose: e.target.value })}
                  className="w-full bg-surface-container border border-outline p-2.5 text-on-surface rounded-lg"
                >
                  <option value="Commercial Real Estate">Commercial Real Estate Senior Loan</option>
                  <option value="Corporate Working Capital">Corporate Working Capital Facility</option>
                  <option value="Asset-Backed Line">Asset-Backed Revolving Line of Credit</option>
                </select>
              </div>

              <div>
                <label className="block text-on-surface-variant uppercase font-bold mb-1">
                  Requested Principal ($ USD)
                </label>
                <input
                  type="number"
                  step="1000"
                  min="25000"
                  placeholder="e.g. 250000"
                  value={loanFormData.amount}
                  onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                  required
                  className="w-full bg-surface-container border border-outline p-2.5 text-on-surface font-mono font-bold rounded-lg"
                />
              </div>

              <div>
                <label className="block text-on-surface-variant uppercase font-bold mb-1">
                  Term Duration
                </label>
                <select
                  value={loanFormData.termMonths}
                  onChange={(e) => setLoanFormData({ ...loanFormData, termMonths: e.target.value })}
                  className="w-full bg-surface-container border border-outline p-2.5 text-on-surface rounded-lg"
                >
                  <option value="36">36 Months (3 Years)</option>
                  <option value="60">60 Months (5 Years)</option>
                  <option value="120">120 Months (10 Years)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 text-amber-500 text-[11px] rounded-lg">
                Subject to institutional underwriting and KYC validation. Standard APR rate is 5.25% fixed.
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setActiveLoanModal(null)}
                  className="flex-1 py-2.5 bg-surface-container border border-outline text-on-surface font-bold uppercase rounded-lg"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loanLoading}
                  className="flex-1 py-2.5 bg-primary text-white font-bold uppercase tracking-wider rounded-lg disabled:opacity-50"
                >
                  {loanLoading ? "Submitting..." : "Submit Application"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reusable Mobile Bottom Navigation */}
      <MobileBottomNav
        user={user}
        primaryAccount={primaryAccount}
      />
    </div>
  );
}
