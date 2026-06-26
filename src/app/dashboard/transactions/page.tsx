"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Transaction, Account } from "@/lib/db";

function TransactionHistoryContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const initialAccountId = searchParams.get("accountId") || "";

  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [selectedAccountId, setSelectedAccountId] = useState(initialAccountId);
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);

  const fetchLedgerData = async () => {
    try {
      const profileRes = await fetch("/api/auth/me");
      if (!profileRes.ok) {
        if (profileRes.status === 401) router.push("/login");
        throw new Error("Unauthorized");
      }
      const profileData = await profileRes.json();
      setUser(profileData.user);
      setAccounts(profileData.accounts);

      // Fetch transactions
      const txUrl = selectedAccountId 
        ? `/api/transactions?accountId=${selectedAccountId}` 
        : `/api/transactions`;
      
      const txRes = await fetch(txUrl);
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions);
      }
    } catch (err) {
      console.error("Error fetching ledger data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLedgerData();
  }, [selectedAccountId]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  // Filter transactions in memory for search query
  const filteredTransactions = transactions.filter((t) => {
    const query = searchQuery.toLowerCase();
    return (
      t.title.toLowerCase().includes(query) ||
      t.description.toLowerCase().includes(query) ||
      (t.overrideReason && t.overrideReason.toLowerCase().includes(query)) ||
      (t.authCode && t.authCode.toLowerCase().includes(query))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">sync</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Retrieving Ledger Audit Trail...</p>
        </div>
      </div>
    );
  }

  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  return (
    <div className="text-on-background bg-background min-h-screen flex flex-col pt-16 pb-20 md:pb-0 md:pt-0">
      {/* Mobile Top Header */}
      <header className="bg-primary text-on-primary flex justify-between items-center w-full px-margin-mobile h-16 fixed top-0 z-40 md:hidden border-b border-outline">
        <h1 className="font-headline-md text-headline-md font-bold text-on-primary tracking-tight">BEACON CAPITAL</h1>
        <button onClick={handleLogout} className="hover:bg-primary-container/20 p-2 rounded-full flex items-center justify-center">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      <div className="flex flex-1 max-w-[1200px] mx-auto w-full md:px-margin-desktop md:py-margin-desktop">
        {/* NavigationDrawer (Desktop Side Nav) */}
        <aside className="bg-surface-container-low h-full w-80 left-0 border-r border-outline flex flex-col sticky top-0 hidden md:flex mr-gutter">
          <div className="p-6 border-b border-outline">
            <div className="font-headline-md text-headline-md font-bold text-primary mb-6">BEACON CAPITAL</div>
            <div className="font-label-sm text-label-sm text-tertiary uppercase tracking-widest">Client View</div>
          </div>
          <nav className="flex flex-col p-4 gap-2 flex-1">
            <Link className="flex items-center gap-3 px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200" href="/dashboard">
              <span className="material-symbols-outlined">dashboard</span>
              <span className="font-body-md text-body-md">Dashboard</span>
            </Link>
            <Link className="flex items-center gap-3 px-4 py-3 rounded bg-primary text-on-primary font-bold transition-colors duration-200" href="/dashboard/transactions">
              <span className="material-symbols-outlined">account_balance_wallet</span>
              <span className="font-body-md text-body-md">Ledger Management</span>
            </Link>
            <button onClick={handleLogout} className="w-full flex items-center gap-3 px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200">
              <span className="material-symbols-outlined">logout</span>
              <span className="font-body-md text-body-md">Log Out</span>
            </button>
          </nav>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 w-full flex flex-col gap-md px-margin-mobile md:px-0 mt-6 md:mt-0">
          <div className="border-b border-surface-dim pb-sm">
            <h2 className="font-headline-lg text-headline-lg text-on-surface">Ledger Account Statements</h2>
            <p className="font-body-md text-body-md text-on-surface-variant mt-xs">
              {selectedAccount ? `${selectedAccount.accountName} (${selectedAccount.accountNumber})` : "Aggregated Transaction Ledger"}
            </p>
          </div>

          {/* Filtering controls */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-sm bg-surface-container-lowest border border-surface-dim p-4">
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface">Filter By Account</label>
              <select
                className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                value={selectedAccountId}
                onChange={(e) => setSelectedAccountId(e.target.value)}
              >
                <option value="">All Accounts (Combined Statement)</option>
                {accounts.map((acc) => (
                  <option key={acc.id} value={acc.id}>{acc.accountName} ({acc.accountNumber})</option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-xs">
              <label className="font-label-sm text-label-sm text-on-surface">Search Ledger Entries</label>
              <div className="relative">
                <span className="material-symbols-outlined absolute left-sm top-1/2 -translate-y-1/2 text-on-surface-variant" style={{ fontSize: "20px" }}>search</span>
                <input
                  type="text"
                  className="w-full data-input rounded-none py-sm pl-10 pr-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                  placeholder="Search description, reason, or auth..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Transactions Table */}
          <div className="bg-surface-container-lowest border border-surface-dim overflow-x-auto shadow-sm">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-outline-variant bg-surface-container text-on-background font-label-sm text-label-sm uppercase tracking-wider">
                  <th className="p-4 font-semibold">Date &amp; Details</th>
                  <th className="p-4 font-semibold">Description</th>
                  <th className="p-4 font-semibold text-center">Status</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-variant font-body-md text-body-md">
                {filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                      No records found matching current ledger parameters.
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((tx, idx) => (
                    <tr key={tx.id} className={`${idx % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low/30"} hover:bg-surface-container-low transition-colors`}>
                      <td className="p-4 whitespace-nowrap">
                        <div className="font-bold text-on-surface">{tx.effectiveDate}</div>
                        <div className="text-xs text-on-surface-variant">ID: {tx.id}</div>
                      </td>
                      <td className="p-4">
                        <div className="font-semibold text-on-surface flex items-center gap-xs">
                          {tx.isOverride && (
                            <span className="material-symbols-outlined text-primary text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                              warning
                            </span>
                          )}
                          {tx.title}
                        </div>
                        <div className="text-sm text-on-surface-variant">{tx.description}</div>
                        {tx.isOverride && (
                          <div className="mt-2 text-xs border-l-2 border-primary pl-2 text-primary bg-primary/5 p-1">
                            <span className="font-bold">Reason:</span> {tx.overrideReason} | <span className="font-bold">Auth:</span> {tx.authCode}
                            {tx.justification && <div className="italic mt-1">"{tx.justification}"</div>}
                          </div>
                        )}
                      </td>
                      <td className="p-4 whitespace-nowrap text-center">
                        <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase font-bold">
                          <span 
                            className={`w-2.5 h-2.5 inline-block ${tx.status === "Settled" ? "bg-[#2E7D32]" : "bg-secondary-container"}`}
                          ></span>
                          <span className={tx.status === "Settled" ? "text-[#2E7D32]" : "text-secondary"}>
                            {tx.status}
                          </span>
                        </span>
                      </td>
                      <td className={`p-4 whitespace-nowrap text-right font-bold ${tx.amount < 0 ? "text-primary" : "text-[#2E7D32]"}`}>
                        {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </main>
      </div>

      {/* BottomNavBar Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface px-2 py-3 border-t border-outline bg-surface text-primary font-label-sm text-label-sm shadow-none">
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 rounded-none w-full" href="/dashboard">
          <span className="material-symbols-outlined mb-1">account_balance</span>
          <span>Accounts</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-primary font-bold p-2 rounded-none w-full" href="/dashboard/transactions">
          <span className="material-symbols-outlined mb-1">payments</span>
          <span>Ledger</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center text-on-surface-variant p-2 rounded-none w-full">
          <span className="material-symbols-outlined mb-1">logout</span>
          <span>Logout</span>
        </button>
      </nav>
    </div>
  );
}

export default function TransactionHistory() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">sync</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Initializing Statement...</p>
        </div>
      </div>
    }>
      <TransactionHistoryContent />
    </Suspense>
  );
}
