"use client";

import React, { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Account } from "@/lib/db";

function TransferFundsContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryType = searchParams.get("type");

  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [loading, setLoading] = useState(true);

  // Transfer Form States
  const [tab, setTab] = useState<"internal" | "external">("external");
  const [sourceAccountId, setSourceAccountId] = useState("");
  
  // Internal Destination
  const [targetAccountId, setTargetAccountId] = useState("");

  // External Destination Details
  const [recipientName, setRecipientName] = useState("");
  const [bankName, setBankName] = useState("");
  const [accountNumber, setAccountNumber] = useState("");
  const [routingNumber, setRoutingNumber] = useState("");
  const [transferType, setTransferType] = useState<"ach" | "wire">(
    queryType === "wire" || queryType === "ach" ? queryType : "ach"
  );

  // Amount
  const [amount, setAmount] = useState("");

  // Transaction limits state (simulated)
  const [achLimitUsed, setAchLimitUsed] = useState(12450);
  const [wireLimitUsed, setWireLimitUsed] = useState(0);

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
        setSourceAccountId(data.accounts[0].id);
        setTargetAccountId(data.accounts.length > 1 ? data.accounts[1].id : data.accounts[0].id);
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

  const handleSendTransfer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (user?.isFrozen) {
      setFormError(`Declined: Your account has been frozen. Reason: ${user.frozenReason}`);
      return;
    }
    setFormLoading(true);
    setFormError("");

    const parsedAmount = parseFloat(amount);
    if (isNaN(parsedAmount) || parsedAmount <= 0) {
      setFormError("Please enter a valid amount.");
      setFormLoading(false);
      return;
    }

    try {
      let bodyData: any = {};
      if (tab === "internal") {
        bodyData = {
          type: "transfer",
          sourceAccountId,
          targetAccountId,
          amount,
        };
      } else {
        bodyData = {
          type: "external_transfer",
          sourceAccountId,
          recipientName,
          bankName,
          accountNumber,
          routingNumber,
          transferType,
          amount,
        };
      }

      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(bodyData),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Transfer failed");
      }

      if (tab === "internal") {
        // Refresh forces Next.js to invalidate cached data so updated balances are shown
        router.push("/dashboard");
        router.refresh();
      } else {
        // Update local limits
        if (transferType === "ach") {
          setAchLimitUsed(prev => prev + parsedAmount);
        } else {
          setWireLimitUsed(prev => prev + parsedAmount);
        }

        // For external, redirect to success receipt screen
        const params = new URLSearchParams({
          amount: data.details.amount.toFixed(2),
          type: data.details.transferType,
          recipient: data.details.recipientName,
          sourceAccount: data.details.sendingAccount,
          sourceAccountMask: data.details.sendingAccountMask,
          date: data.details.date,
          time: data.details.time,
          ref: data.referenceNumber,
        });
        router.push(`/dashboard/transfer/success?${params.toString()}`);
      }
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
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Establishing secure portal...</p>
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
        <main className="flex-1 w-full flex flex-col gap-md px-margin-mobile md:px-0 mt-6 md:mt-0 max-w-[640px] mx-auto">
          {user?.isFrozen && (
            <div className="bg-[#FFEBEE] border-2 border-[#D32F2F] text-[#D32F2F] p-4 rounded-none flex items-start gap-3">
              <span className="material-symbols-outlined text-[#D32F2F] mt-0.5">warning</span>
              <div>
                <h4 className="font-bold text-[#C62828] uppercase tracking-wider text-sm">Account Frozen</h4>
                <p className="text-sm mt-0.5 font-semibold">Reason: {user.frozenReason}</p>
                <p className="text-xs text-[#E53935] mt-1">All outgoing transfers are disabled.</p>
              </div>
            </div>
          )}
          <div>
            <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background text-primary font-bold">
              Transfer Funds
            </h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-1">
              Move capital securely between your accounts or to external institutions.
            </p>
          </div>

          {formError && (
            <div className="bg-error-container border border-error text-error text-sm p-sm flex items-center gap-2">
              <span className="material-symbols-outlined text-error" style={{ fontSize: "20px" }}>error</span>
              <span>{formError}</span>
            </div>
          )}

          {/* Form Card */}
          <div className="bg-surface-container-lowest border border-surface-dim p-md shadow-sm">
            {/* Toggles */}
            <div className="flex bg-surface-container-low p-xs border border-outline-variant mb-md">
              <button
                type="button"
                onClick={() => { setTab("internal"); setFormError(""); }}
                className={`flex-1 py-sm font-label-sm text-label-sm uppercase font-semibold text-center rounded-none transition-all ${
                  tab === "internal" ? "bg-white text-primary border border-outline-variant" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                Internal
              </button>
              <button
                type="button"
                onClick={() => { setTab("external"); setFormError(""); }}
                className={`flex-1 py-sm font-label-sm text-label-sm uppercase font-semibold text-center rounded-none transition-all ${
                  tab === "external" ? "bg-white text-primary border border-outline-variant" : "text-on-surface-variant hover:text-on-surface"
                }`}
              >
                External
              </button>
            </div>

            <form onSubmit={handleSendTransfer} className="space-y-md">
              {/* From Account selection */}
              <div className="flex flex-col gap-xs">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
                  From Account
                </label>
                <select
                  className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  required
                >
                  {accounts.filter(a => a.accountType !== "credit").map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (*{a.accountNumber.slice(-4)}) - ${a.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Internal Route target */}
              {tab === "internal" ? (
                <div className="flex flex-col gap-xs">
                  <label className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
                    To Account
                  </label>
                  <select
                    className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    value={targetAccountId}
                    onChange={(e) => setTargetAccountId(e.target.value)}
                    required
                  >
                    {accounts.filter(a => a.id !== sourceAccountId).map((a) => (
                      <option key={a.id} value={a.id}>
                        {a.accountName} (*{a.accountNumber.slice(-4)}) - ${a.balance.toFixed(2)}
                      </option>
                    ))}
                  </select>
                </div>
              ) : (
                /* External Route targets */
                <div className="space-y-sm">
                  <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-widest border-b border-outline-variant pb-xs">
                    Recipient Details
                  </h3>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="recipientName">
                      Recipient Full Name
                    </label>
                    <input
                      type="text"
                      className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                      id="recipientName"
                      value={recipientName}
                      onChange={(e) => setRecipientName(e.target.value)}
                      placeholder="Johnathan Doe"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="bankName">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                      id="bankName"
                      value={bankName}
                      onChange={(e) => setBankName(e.target.value)}
                      placeholder="e.g. JPMorgan Chase"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="accountNumber">
                      Account Number
                    </label>
                    <input
                      type="text"
                      className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                      id="accountNumber"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder="0000000000"
                      required
                    />
                  </div>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface" htmlFor="routingNumber">
                      Routing Number (9 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={9}
                      className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                      id="routingNumber"
                      value={routingNumber}
                      onChange={(e) => setRoutingNumber(e.target.value)}
                      placeholder="123456789"
                      required
                    />
                  </div>

                  <h3 className="font-label-sm text-label-sm text-primary uppercase tracking-widest border-b border-outline-variant pb-xs pt-xs">
                    Transaction Parameters
                  </h3>
                  <div className="flex flex-col gap-xs">
                    <label className="font-label-sm text-label-sm text-on-surface-variant font-semibold">
                      Transfer Type
                    </label>
                    <div className="flex flex-col gap-xs">
                      {/* ACH */}
                      <label className="flex items-center gap-md border border-outline-variant p-sm cursor-pointer select-none bg-surface-container-low hover:bg-surface-container transition-colors">
                        <input
                          type="radio"
                          name="transferType"
                          className="w-4 h-4 text-primary focus:ring-primary border-outline-variant bg-surface"
                          checked={transferType === "ach"}
                          onChange={() => setTransferType("ach")}
                        />
                        <div>
                          <div className="font-body-md text-body-md font-bold text-on-surface">ACH (Standard)</div>
                          <div className="text-xs text-on-surface-variant">1-3 Business Days — No Fee</div>
                        </div>
                      </label>

                      {/* WIRE */}
                      <label className="flex items-center gap-md border border-outline-variant p-sm cursor-pointer select-none bg-surface-container-low hover:bg-surface-container transition-colors">
                        <input
                          type="radio"
                          name="transferType"
                          className="w-4 h-4 text-primary focus:ring-primary border-outline-variant bg-surface"
                          checked={transferType === "wire"}
                          onChange={() => setTransferType("wire")}
                        />
                        <div>
                          <div className="font-body-md text-body-md font-bold text-on-surface">Wire Transfer</div>
                          <div className="text-xs text-on-surface-variant">Same Day Delivery — $20.00 Fee</div>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              )}

              {/* Amount field */}
              <div className="flex flex-col gap-xs pt-xs">
                <label className="font-label-sm text-label-sm text-on-surface font-semibold uppercase tracking-wider">
                  Amount to Transfer
                </label>
                <div className="relative border border-outline-variant bg-surface">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-sm font-headline-lg text-headline-lg text-on-surface">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full bg-transparent pl-8 pr-sm py-md font-headline-lg text-headline-lg font-bold text-on-surface focus:outline-none border-none ring-0 placeholder:text-surface-dim"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                  />
                </div>
              </div>

              {/* Send button */}
              <button
                type="submit"
                disabled={formLoading}
                className="w-full bg-primary text-on-primary font-headline-md font-bold py-md px-md rounded-none hover:bg-primary-container transition-colors flex items-center justify-center gap-2 uppercase tracking-wider shadow-sm disabled:bg-primary/50"
              >
                {formLoading ? "Processing secure transfer..." : "Send Transfer"}
              </button>
            </form>
          </div>

          {/* Secure Institutional Portal Banner */}
          <div className="bg-primary text-on-primary p-md rounded-none border border-outline shadow-sm">
            <div className="flex items-center gap-sm mb-xs">
              <span className="material-symbols-outlined text-[20px] text-secondary-container">verified_user</span>
              <h4 className="font-label-sm text-label-sm uppercase font-bold tracking-widest text-secondary-container">
                Secure Institutional Portal
              </h4>
            </div>
            <p className="font-body-md text-body-md text-xs text-on-primary/90">
              Your transaction is protected by industry-leading 256-bit encryption and multi-factor authentication protocols.
            </p>
            <div className="mt-sm text-[10px] uppercase font-bold text-on-primary/50 tracking-wider">
              ● Last login: Oct 24, 2023 at 09:44 AM EST
            </div>
          </div>

          {/* Daily Limits Section */}
          <div className="bg-surface-container-lowest border border-surface-dim p-md">
            <h4 className="font-label-sm text-label-sm font-bold uppercase tracking-widest text-on-surface-variant mb-md border-b border-outline-variant pb-xs">
              Daily Limits
            </h4>
            
            {/* ACH limit progress */}
            <div className="space-y-xs mb-sm">
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="font-bold text-on-surface-variant">ACH Limit</span>
                <span className="text-on-surface">${achLimitUsed.toLocaleString("en-US")} / $50,000</span>
              </div>
              <div className="w-full h-2 bg-surface-container border border-outline-variant">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, (achLimitUsed / 50000) * 100)}%` }}
                ></div>
              </div>
            </div>

            {/* Wire limit progress */}
            <div className="space-y-xs">
              <div className="flex justify-between font-label-sm text-label-sm">
                <span className="font-bold text-on-surface-variant">Wire Limit</span>
                <span className="text-on-surface">${wireLimitUsed.toLocaleString("en-US")} / $500,000</span>
              </div>
              <div className="w-full h-2 bg-surface-container border border-outline-variant">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min(100, (wireLimitUsed / 500000) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Banner Ad: Elite Wealth Services */}
          <div className="relative bg-[#1E1711] border border-outline-variant p-md flex flex-col justify-end min-h-[160px] overflow-hidden text-white shadow-sm">
            {/* Dark background graphic */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10"></div>
            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=600&auto=format&fit=crop')] bg-cover bg-center opacity-30"></div>
            <div className="relative z-20">
              <h3 className="font-headline-md text-headline-md font-bold tracking-tight text-[#EEDAC5]">
                Elite Wealth Services
              </h3>
              <p className="font-body-md text-body-md text-xs text-white/80 mt-1">
                Contact your advisor for transfers exceeding $1M.
              </p>
            </div>
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

export default function TransferFundsPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">sync</span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Loading Transfer Details...</p>
        </div>
      </div>
    }>
      <TransferFundsContent />
    </Suspense>
  );
}
