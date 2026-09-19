"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Account, Transaction, Card } from "@/lib/db";

export default function AccountDashboard() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [routingNumber, setRoutingNumber] = useState("026014881");
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Card interactive state
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardFreezeLoading, setCardFreezeLoading] = useState(false);
  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({});

  // Quick Action Modal states
  const [activeModal, setActiveModal] = useState<"transfer" | "zelle" | "billpay" | "deposit" | null>(null);
  const [modalLoading, setModalLoading] = useState(false);
  const [modalError, setModalError] = useState("");
  const [modalSuccess, setModalSuccess] = useState("");

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

  // Hamburger drawer state
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [transferExpanded, setTransferExpanded] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);

  // Form Fields
  const [formData, setFormData] = useState({
    sourceAccountId: "",
    targetAccountId: "",
    amount: "",
    recipient: "",
    biller: "",
  });

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
        }
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
      setCards(data.cards || []);
      if (data.routingNumber) {
        setRoutingNumber(data.routingNumber);
      }

      // Pre-fill default account selections in forms
      if (data.accounts && data.accounts.length > 0) {
        const nonLoanAccs = data.accounts.filter((a: any) => a.accountType !== "loan");
        const defaultSource = nonLoanAccs[0] || data.accounts[0];
        const defaultTarget = nonLoanAccs.length > 1 ? nonLoanAccs[1] : defaultSource;
        setFormData((prev) => ({
          ...prev,
          sourceAccountId: defaultSource.id,
          targetAccountId: defaultTarget.id,
        }));

        const loanAcc = data.accounts.find((a: any) => a.accountType === "loan");
        if (loanAcc) {
          setLoanFormData((prev) => ({
            ...prev,
            loanAccountId: loanAcc.id,
            sourceAccountId: defaultSource.id,
            amount: (loanAcc.monthlyPayment || 3420).toString(),
          }));
        }
      }

      // Fetch recent transactions
      const txRes = await fetch("/api/transactions", { cache: "no-store" });
      if (txRes.ok) {
        const txData = await txRes.json();
        setTransactions(txData.transactions);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text);
    } else {
      const el = document.createElement("textarea");
      el.value = text;
      document.body.appendChild(el);
      el.select();
      document.execCommand("copy");
      document.body.removeChild(el);
    }
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleToggleCardFreeze = async (card: Card) => {
    setCardFreezeLoading(true);
    try {
      const nextFrozen = !card.isFrozen;
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ cardId: card.id, action: nextFrozen ? "freeze" : "unfreeze" }),
      });
      if (res.ok) {
        setCards((prev) =>
          prev.map((c) =>
            c.id === card.id
              ? { ...c, isFrozen: nextFrozen, status: nextFrozen ? "Frozen" : "Active" }
              : c
          )
        );
      }
    } catch (err) {
      console.error("Error toggling card freeze:", err);
    } finally {
      setCardFreezeLoading(false);
    }
  };

  const handleLoanPayment = async (e: React.FormEvent) => {
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
      setLoanSuccess(`Payment of $${parseFloat(loanFormData.amount).toLocaleString("en-US", { minimumFractionDigits: 2 })} processed successfully.`);
      await fetchDashboardData();
      setTimeout(() => {
        setActiveLoanModal(null);
        setLoanSuccess("");
      }, 1600);
    } catch (err: any) {
      setLoanError(err.message || "Loan payment failed");
    } finally {
      setLoanLoading(false);
    }
  };

  const handleLoanApply = async (e: React.FormEvent) => {
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
      await fetchDashboardData();
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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setModalLoading(true);
    setModalError("");
    setModalSuccess("");

    try {
      const res = await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type: activeModal,
          sourceAccountId: formData.sourceAccountId,
          targetAccountId: formData.targetAccountId,
          amount: formData.amount,
          recipient: formData.recipient,
          biller: formData.biller,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Transaction execution failed");
      }

      setModalSuccess("Transaction executed successfully.");
      setFormData((prev) => ({ ...prev, amount: "", recipient: "", biller: "" }));

      // Reload accounts/balances
      await fetchDashboardData();

      // Auto close modal after a short delay
      setTimeout(() => {
        setActiveModal(null);
        setModalSuccess("");
      }, 1500);
    } catch (err: any) {
      setModalError(err.message || "An unexpected error occurred");
    } finally {
      setModalLoading(false);
    }
  };

  const checkRestriction = () => {
    if (!user) return false;
    if (user.status === "Pending") {
      return "Transaction declined. Your account application is currently pending background verification by Customer Service.";
    }
    if (user.status === "Rejected") {
      return `Transaction declined. Application rejected: ${user.rejectionReason || user.frozenReason || "Background verification not approved"}`;
    }
    if (user.isFrozen) {
      return `Transaction declined. Your account is frozen: ${user.frozenReason}`;
    }
    return false;
  };

  const openDrawerModal = (modal: "zelle" | "billpay") => {
    setDrawerOpen(false);
    setTransferExpanded(false);
    const restriction = checkRestriction();
    if (restriction) {
      alert(restriction);
      return;
    }
    setModalError("");
    setModalSuccess("");
    setActiveModal(modal);
  };

  const formatDob = (dob: string) => {
    if (!dob) return "N/A";
    try {
      const d = new Date(dob);
      return d.toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" });
    } catch {
      return dob;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <span className="material-symbols-outlined text-primary animate-spin text-[48px]">
            sync
          </span>
          <p className="font-body-md text-body-md text-on-surface-variant mt-sm">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  // Dedicated Pending Application Screen
  if (user?.status === "Pending") {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans antialiased">
        {/* Header */}
        <header className="w-full bg-[#0E131F] border-b border-[#1C2433] px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#af0017] text-2xl">account_balance</span>
            <div>
              <span className="font-bold text-lg text-white tracking-wider uppercase block">BEACON CAPITAL</span>
              <span className="text-[10px] text-[#af0017] uppercase tracking-widest font-semibold font-mono block -mt-1">Client Portal</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#1A2332] hover:bg-red-900/40 hover:text-red-400 text-[#90A4AE] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border border-[#2A374A] rounded-none"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </header>

        {/* Dedicated Main Section */}
        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="max-w-2xl w-full bg-[#131924] border-2 border-[#FFA000] p-6 md:p-12 shadow-2xl space-y-8 text-center rounded-none">
            {/* Animated Icon */}
            <div className="w-20 h-20 bg-[#FFF8E1]/10 border border-[#FFA000]/40 text-[#FFA000] flex items-center justify-center mx-auto rounded-none shadow-lg">
              <span className="material-symbols-outlined text-[48px] animate-pulse">
                hourglass_top
              </span>
            </div>

            <div>
              <span className="inline-block bg-[#FFA000]/20 text-[#FFB74D] border border-[#FFA000]/40 text-[11px] font-bold px-3 py-1 uppercase tracking-widest mb-3 rounded-none">
                Application Status: Pending Verification
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Account Application Under Review
              </h1>
              <p className="text-[#90A4AE] text-sm md:text-base mt-3 max-w-lg mx-auto">
                Welcome, <strong className="text-white font-semibold">{user?.firstName} {user?.lastName}</strong>! Your background verification and identity information are currently being reviewed by Customer Service &amp; Compliance.
              </p>
            </div>

            {/* Verification Progress Timeline */}
            <div className="bg-[#0E131F] border border-[#1C2433] p-6 text-left space-y-4 rounded-none">
              <h3 className="font-bold text-xs uppercase text-[#af0017] tracking-wider border-b border-[#1C2433] pb-2">
                Verification Progress Timeline
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#2E7D32] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 rounded-none">
                    ✓
                  </div>
                  <div>
                    <p className="font-bold text-white">Application Received</p>
                    <p className="text-xs text-[#90A4AE]">Personal and background documentation successfully submitted.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 bg-[#F57C00] text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse rounded-none">
                    2
                  </div>
                  <div>
                    <p className="font-bold text-[#FFB74D]">Customer Service &amp; Compliance Verification (In Progress)</p>
                    <p className="text-xs text-[#90A4AE]">Compliance officers are validating your information.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 opacity-60">
                  <div className="w-6 h-6 bg-[#1C2433] text-[#90A4AE] flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 rounded-none">
                    3
                  </div>
                  <div>
                    <p className="font-bold text-[#90A4AE]">Account Approval &amp; Email Notification</p>
                    <p className="text-xs text-[#546E7A]">An official approval email will be sent to <span className="font-semibold text-[#90A4AE]">{user?.email || user?.username}</span>.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Information Notice */}
            <div className="bg-[#FFA000]/10 border border-[#FFA000]/30 p-4 text-xs text-[#FFB74D] text-left flex items-start gap-3 rounded-none">
              <span className="material-symbols-outlined text-[#FFA000] text-xl shrink-0 mt-0.5">info</span>
              <div>
                <p className="font-bold text-white">Next Steps:</p>
                <p className="mt-0.5 text-[#90A4AE]">Please check back later or monitor your email inbox. Once Customer Service approves your application, log back in to access your active accounts and dashboard balances.</p>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row justify-center gap-4 pt-4 border-t border-[#1C2433]">
              <button
                onClick={fetchDashboardData}
                className="bg-[#af0017] hover:bg-[#8f0013] text-white px-6 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-none"
              >
                <span className="material-symbols-outlined text-sm">refresh</span>
                <span>Refresh Application Status</span>
              </button>
              <button
                onClick={handleLogout}
                className="bg-[#1E293B] hover:bg-[#334155] text-white border border-[#334155] px-6 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-none"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Dedicated Rejected Application Screen
  if (user?.status === "Rejected") {
    return (
      <div className="min-h-screen bg-[#0B0E14] text-white flex flex-col font-sans antialiased">
        <header className="w-full bg-[#0E131F] border-b border-[#1C2433] px-6 py-4 flex items-center justify-between shadow-md">
          <div className="flex items-center gap-3">
            <span className="material-symbols-outlined text-[#af0017] text-2xl">account_balance</span>
            <div>
              <span className="font-bold text-lg text-white tracking-wider uppercase block">BEACON CAPITAL</span>
              <span className="text-[10px] text-[#af0017] uppercase tracking-widest font-semibold font-mono block -mt-1">Client Portal</span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-[#1A2332] hover:bg-red-900/40 hover:text-red-400 text-[#90A4AE] px-4 py-2 text-xs font-bold uppercase tracking-wider transition-colors border border-[#2A374A] rounded-none"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </header>

        <main className="flex-1 flex items-center justify-center p-4 md:p-8">
          <div className="max-w-2xl w-full bg-[#131924] border-2 border-red-600 p-6 md:p-12 shadow-2xl space-y-8 text-center rounded-none">
            <div className="w-20 h-20 bg-red-950/40 border border-red-500/40 text-red-500 flex items-center justify-center mx-auto rounded-none shadow-lg">
              <span className="material-symbols-outlined text-[48px]">
                cancel
              </span>
            </div>

            <div>
              <span className="inline-block bg-red-900/30 text-red-400 border border-red-500/40 text-[11px] font-bold px-3 py-1 uppercase tracking-widest mb-3 rounded-none">
                Application Status: Rejected
              </span>
              <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
                Account Application Not Approved
              </h1>
              <p className="text-[#90A4AE] text-sm md:text-base mt-3 max-w-lg mx-auto">
                Dear <strong className="text-white font-semibold">{user?.firstName} {user?.lastName}</strong>, Customer Service and Compliance have reviewed your background verification application.
              </p>
            </div>

            <div className="bg-[#0E131F] border border-red-500/40 p-6 text-left space-y-2 rounded-none">
              <p className="text-xs uppercase font-bold text-red-400 tracking-wider">Compliance Rejection Stated Reason:</p>
              <p className="text-sm font-bold text-red-300 font-mono break-words">
                "{user?.rejectionReason || user?.frozenReason || "Background verification check failed to meet compliance criteria."}"
              </p>
              <p className="text-xs text-[#90A4AE] pt-3 border-t border-[#1C2433]">
                An official rejection notice has been sent to your email address: <span className="font-semibold text-white">{user?.email || user?.username}</span>.
              </p>
            </div>

            <div className="flex justify-center pt-4 border-t border-[#1C2433]">
              <button
                onClick={handleLogout}
                className="bg-[#af0017] hover:bg-[#8f0013] text-white px-8 py-3 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-colors rounded-none"
              >
                <span className="material-symbols-outlined text-sm">logout</span>
                <span>Sign Out</span>
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Calculate Aggregated Balance
  const totalBalance = accounts.reduce((acc, curr) => acc + curr.balance, 0);

  return (
    <div className="text-on-background bg-background min-h-screen flex flex-col pt-16 pb-20 md:pb-0 md:pt-0">

      {/* TopAppBar Mobile */}
      <header className="md:hidden fixed z-50 flex justify-between items-center w-full px-margin-mobile h-16 bg-primary text-on-primary font-headline-md text-headline-md top-0 border-b border-outline shadow-none">
        <button
          aria-label="Open menu"
          onClick={() => { setDrawerOpen(true); setSettingsOpen(false); setTransferExpanded(false); }}
          className="p-2 -ml-2 text-on-primary transition-colors duration-200 hover:bg-primary-container/20 rounded-full"
        >
          <span className="material-symbols-outlined">menu</span>
        </button>
        <div className="font-headline-md text-headline-md font-bold text-on-primary">
          BEACON CAPITAL
        </div>
        <button onClick={handleLogout} aria-label="Logout" className="p-2 -mr-2 text-on-primary transition-colors duration-200 hover:bg-primary-container/20 rounded-full">
          <span className="material-symbols-outlined">logout</span>
        </button>
      </header>

      {/* ── Mobile Slide-Out Navigation Drawer ── */}
      {drawerOpen && (
        <div
          className="md:hidden fixed inset-0 z-[60] flex"
          onClick={() => { setDrawerOpen(false); setSettingsOpen(false); setTransferExpanded(false); }}
        >
          {/* Backdrop scrim */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />

          {/* Drawer Panel */}
          <div
            className="relative z-10 flex flex-col w-[300px] max-w-[85vw] h-full bg-surface-container-lowest border-r border-outline shadow-2xl overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drawer Header */}
            <div className="bg-primary px-5 pt-10 pb-5 flex items-center justify-between">
              <div>
                <div className="font-headline-md text-headline-md font-bold text-on-primary tracking-tight">
                  BEACON CAPITAL
                </div>
                <div className="font-label-sm text-label-sm text-on-primary/70 text-xs uppercase tracking-widest mt-0.5">
                  Client Portal
                </div>
              </div>
              <button
                onClick={() => setDrawerOpen(false)}
                className="text-on-primary/80 hover:text-on-primary transition-colors p-1 rounded-full"
                aria-label="Close menu"
              >
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {/* User greeting strip */}
            <div className="px-5 py-4 border-b border-surface-dim bg-surface-container-low flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center text-on-primary font-bold text-lg uppercase select-none">
                {user?.firstName?.[0]}{user?.lastName?.[0]}
              </div>
              <div>
                <div className="font-body-md text-body-md font-semibold text-on-background">
                  {user?.firstName} {user?.lastName}
                </div>
                <div className="font-label-sm text-label-sm text-on-surface-variant text-xs truncate max-w-[170px]">
                  {user?.email}
                </div>
              </div>
            </div>

            {/* Navigation Items */}
            <nav className="flex-1 py-3 px-2 space-y-1">

              {/* Dashboard link */}
              <Link
                href="/dashboard"
                onClick={() => setDrawerOpen(false)}
                className="flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-primary">dashboard</span>
                <span className="font-body-md text-body-md">Dashboard</span>
              </Link>

              {/* Transfer — expandable */}
              <div>
                <button
                  onClick={() => setTransferExpanded((prev) => !prev)}
                  className="w-full flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
                >
                  <span className="material-symbols-outlined text-primary">swap_horiz</span>
                  <span className="font-body-md text-body-md flex-1 text-left">Transfer</span>
                  <span
                    className="material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200"
                    style={{ transform: transferExpanded ? "rotate(180deg)" : "rotate(0deg)" }}
                  >
                    expand_more
                  </span>
                </button>

                {/* Sub-menu: Wire Transfer / ACH */}
                {transferExpanded && (
                  <div className="ml-4 mt-1 space-y-1 border-l-2 border-primary/20 pl-3">
                    <Link
                      href={user?.isFrozen ? "#" : "/dashboard/transfer?type=wire"}
                      onClick={(e) => {
                        if (user?.isFrozen) {
                          e.preventDefault();
                          alert(`Transaction declined. Your account is frozen: ${user.frozenReason}`);
                        }
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>account_balance</span>
                      <span className="font-body-md text-body-md text-sm">Wire Transfer</span>
                    </Link>
                    <Link
                      href={user?.isFrozen ? "#" : "/dashboard/transfer?type=ach"}
                      onClick={(e) => {
                        if (user?.isFrozen) {
                          e.preventDefault();
                          alert(`Transaction declined. Your account is frozen: ${user.frozenReason}`);
                        }
                        setDrawerOpen(false);
                      }}
                      className="flex items-center gap-3 px-3 py-2.5 rounded text-on-surface-variant hover:bg-surface-container-high hover:text-on-surface transition-colors"
                    >
                      <span className="material-symbols-outlined text-primary" style={{ fontSize: "20px" }}>sync_alt</span>
                      <span className="font-body-md text-body-md text-sm">ACH Transfer</span>
                    </Link>
                  </div>
                )}
              </div>

              {/* Bill Pay */}
              <button
                onClick={() => openDrawerModal("billpay")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-primary">receipt_long</span>
                <span className="font-body-md text-body-md">Bill Pay</span>
              </button>

              {/* Zelle Transfer */}
              <button
                onClick={() => openDrawerModal("zelle")}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-primary">send_money</span>
                <span className="font-body-md text-body-md">Zelle Transfer</span>
              </button>

              {/* Divider */}
              <div className="my-2 border-t border-surface-dim" />

              {/* Settings — expandable profile panel */}
              <button
                onClick={() => setSettingsOpen((prev) => !prev)}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-primary">settings</span>
                <span className="font-body-md text-body-md flex-1 text-left">Settings</span>
                <span
                  className="material-symbols-outlined text-on-surface-variant text-sm transition-transform duration-200"
                  style={{ transform: settingsOpen ? "rotate(180deg)" : "rotate(0deg)" }}
                >
                  expand_more
                </span>
              </button>

              {/* Settings / Profile Panel */}
              {settingsOpen && (
                <div className="mx-2 mb-2 bg-surface-container rounded border border-surface-dim overflow-hidden">
                  <div className="px-4 py-2 bg-surface-container-high border-b border-surface-dim">
                    <span className="font-label-sm text-label-sm text-primary uppercase tracking-wider text-xs font-bold">
                      Account Information
                    </span>
                  </div>
                  <div className="divide-y divide-surface-dim">

                    {/* Full Name */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>person</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase tracking-wide">Full Name</span>
                      </div>
                      <div className="font-body-md text-body-md text-on-background font-semibold pl-6">
                        {user?.firstName} {user?.lastName}
                      </div>
                    </div>

                    {/* Email Address */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>email</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase tracking-wide">Email Address</span>
                      </div>
                      <div className="font-body-md text-body-md text-on-background font-semibold pl-6 break-all">
                        {user?.email || "N/A"}
                      </div>
                    </div>

                    {/* Phone Number */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>phone</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase tracking-wide">Phone Number</span>
                      </div>
                      <div className="font-body-md text-body-md text-on-background font-semibold pl-6">
                        {user?.phone || "N/A"}
                      </div>
                    </div>

                    {/* Date of Birth */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>cake</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase tracking-wide">Date of Birth</span>
                      </div>
                      <div className="font-body-md text-body-md text-on-background font-semibold pl-6">
                        {formatDob(user?.dob)}
                      </div>
                    </div>

                    {/* Address / State of Issuance */}
                    <div className="px-4 py-3">
                      <div className="flex items-center gap-2 mb-0.5">
                        <span className="material-symbols-outlined text-on-surface-variant" style={{ fontSize: "16px" }}>location_on</span>
                        <span className="font-label-sm text-label-sm text-on-surface-variant text-xs uppercase tracking-wide">Address / State</span>
                      </div>
                      <div className="font-body-md text-body-md text-on-background font-semibold pl-6">
                        {user?.issuance || "N/A"}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* Divider */}
              <div className="my-2 border-t border-surface-dim" />

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-3 rounded text-on-surface hover:bg-surface-container-high transition-colors"
              >
                <span className="material-symbols-outlined text-on-surface-variant">logout</span>
                <span className="font-body-md text-body-md">Log Out</span>
              </button>

            </nav>
          </div>
        </div>
      )}

      <div className="flex flex-1 relative max-w-[1200px] mx-auto w-full md:px-margin-desktop md:py-margin-desktop">

        {/* NavigationDrawer Desktop */}
        <aside className="hidden md:flex flex-col h-screen sticky top-0 bg-surface-container-low w-80 left-0 border-r border-outline shadow-none transition-all duration-200 ease-in-out mr-gutter">
          <div className="p-6 border-b border-outline">
            <div className="font-headline-md text-headline-md font-bold text-primary mb-6">
              BEACON CAPITAL
            </div>
            <div className="font-label-sm text-label-sm font-bold text-primary text-xs uppercase tracking-wider">
              CLIENT PORTAL
            </div>
          </div>
          <nav className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
            <Link className="flex items-center px-4 py-3 rounded bg-primary text-on-primary font-bold transition-colors duration-200" href="/dashboard">
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

        {/* Main Content */}
        <main className="flex-1 w-full flex flex-col gap-lg px-margin-mobile md:px-0">
          {user?.status === "Pending" && (
            <div className="bg-[#FFF8E1] border-2 border-[#FFA000] text-[#795548] p-5 rounded-none flex items-start gap-4 mt-6 md:mt-0 shadow-sm">
              <span className="material-symbols-outlined text-[#F57C00] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                hourglass_top
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-[#E65100] uppercase tracking-wider">
                  Application Pending Customer Service Verification
                </h3>
                <p className="font-body-md text-body-md mt-1 font-semibold text-[#BF360C]">
                  Your background verification and account application are currently under review by Customer Service and Bank Compliance.
                </p>
                <p className="font-body-sm text-body-sm text-[#D84315] mt-2">
                  You will receive an email update as soon as your background verification is approved or if additional information is required. Financial transactions are restricted during the review period.
                </p>
              </div>
            </div>
          )}

          {user?.status === "Rejected" && (
            <div className="bg-[#FFEBEE] border-2 border-[#D32F2F] text-[#D32F2F] p-5 rounded-none flex items-start gap-4 mt-6 md:mt-0 shadow-sm">
              <span className="material-symbols-outlined text-[#D32F2F] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                cancel
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-[#C62828] uppercase tracking-wider">
                  Account Application Rejected
                </h3>
                <p className="font-body-md text-body-md mt-1 font-semibold text-[#D32F2F]">
                  Reason: <span className="font-bold underline">{user.rejectionReason || user.frozenReason || "Background verification not approved."}</span>
                </p>
                <p className="font-body-sm text-body-sm text-[#E53935] mt-2">
                  Customer Service has reviewed your background verification and rejected the application. An official notification email has been dispatched to your registered email address.
                </p>
              </div>
            </div>
          )}

          {user?.isFrozen && user?.status !== "Rejected" && (
            <div className="bg-[#FFEBEE] border-2 border-[#D32F2F] text-[#D32F2F] p-5 rounded-none flex items-start gap-4 mt-6 md:mt-0">
              <span className="material-symbols-outlined text-[#D32F2F] text-[36px]" style={{ fontVariationSettings: "'FILL' 1" }}>
                warning
              </span>
              <div>
                <h3 className="font-headline-sm text-headline-sm font-bold text-[#C62828] uppercase tracking-wider">
                  Account Frozen / Suspended
                </h3>
                <p className="font-body-md text-body-md mt-1 font-semibold text-[#D32F2F]">
                  Reason: <span className="font-bold underline">{user.frozenReason}</span>
                </p>
                <p className="font-body-sm text-body-sm text-[#E53935] mt-2">
                  All outgoing transfers, payments, and deposits have been suspended pending verification. Please contact compliance support.
                </p>
              </div>
            </div>
          )}

          {/* Welcome Hero */}
          <section className="bg-surface-container-lowest border border-surface-dim rounded-none p-6 premium-shadow relative overflow-hidden mt-6 md:mt-0">
            <div className="relative z-10 flex flex-col md:flex-row justify-between md:items-end gap-6">
              <div>
                <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-background mb-sm">
                  Welcome Back, {user?.firstName}
                </h1>
                <p className="font-body-md text-body-md text-on-surface-variant mb-6">Total Aggregated Balance</p>
                <div className="font-display-lg text-display-lg text-primary font-bold tracking-tight">
                  ${totalBalance.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </div>
              </div>

              {/* Quick Actions Grid within Hero */}
              <div className="grid grid-cols-4 gap-xs md:gap-sm bg-surface-container p-2 rounded-none border border-surface-dim self-start w-full md:w-auto">
                <Link
                  href={checkRestriction() ? "#" : "/dashboard/transfer"}
                  onClick={(e) => {
                    const restriction = checkRestriction();
                    if (restriction) {
                      e.preventDefault();
                      alert(restriction);
                    }
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-none hover:bg-surface-container-highest transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">swap_horiz</span>
                  <span className="font-label-sm text-label-sm text-on-surface">Transfer</span>
                </Link>
                <button
                  onClick={() => {
                    const restriction = checkRestriction();
                    if (restriction) {
                      alert(restriction);
                      return;
                    }
                    setActiveModal("zelle");
                    setModalError("");
                    setModalSuccess("");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-none hover:bg-surface-container-highest transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">send_money</span>
                  <span className="font-label-sm text-label-sm text-on-surface">Zelle</span>
                </button>
                <button
                  onClick={() => {
                    const restriction = checkRestriction();
                    if (restriction) {
                      alert(restriction);
                      return;
                    }
                    setActiveModal("billpay");
                    setModalError("");
                    setModalSuccess("");
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-none hover:bg-surface-container-highest transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">receipt_long</span>
                  <span className="font-label-sm text-label-sm text-on-surface">Bill Pay</span>
                </button>
                <Link
                  href={checkRestriction() ? "#" : "/dashboard/deposit"}
                  onClick={(e) => {
                    const restriction = checkRestriction();
                    if (restriction) {
                      e.preventDefault();
                      alert(restriction);
                    }
                  }}
                  className="flex flex-col items-center justify-center p-3 rounded-none hover:bg-surface-container-highest transition-colors group"
                >
                  <span className="material-symbols-outlined text-primary mb-2 group-hover:scale-110 transition-transform">add_circle</span>
                  <span className="font-label-sm text-label-sm text-on-surface">Deposit</span>
                </Link>
              </div>
            </div>
          </section>

          {/* ── Luxury Credit Card Section ── */}
          <section className="flex flex-col gap-sm">
            <div className="flex justify-between items-center border-b border-surface-dim pb-sm mb-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">credit_card</span>
                <h2 className="font-headline-md text-headline-md text-on-background">Beacon Private Client Cards</h2>
              </div>
              <span className="text-[11px] font-mono uppercase tracking-widest px-2.5 py-1 bg-primary/10 text-primary border border-primary/30 font-bold">
                Direct Cardholder Access
              </span>
            </div>

            {cards.length === 0 ? (
              <div className="bg-surface-container-lowest border border-surface-dim p-6 text-center text-on-surface-variant">
                <span className="material-symbols-outlined text-4xl text-on-surface-variant/60 mb-2">credit_card_off</span>
                <p className="font-body-md text-body-md">No active cards issued. Provisioning your Beacon Elite Black card...</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Visual Luxury Card */}
                {cards.map((card) => (
                  <div key={card.id} className="lg:col-span-7 flex flex-col gap-3">
                    <div className="relative overflow-hidden w-full aspect-[1.586/1] max-w-[460px] bg-gradient-to-br from-[#1b2230] via-[#111722] to-[#0a0d14] text-white p-6 sm:p-7 shadow-2xl border border-[#D4AF37]/40 flex flex-col justify-between group select-none">
                      {/* Metallic sheen overlay */}
                      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.18),transparent_60%)] pointer-events-none" />
                      <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.04)_50%,transparent_60%)] pointer-events-none" />

                      {/* Card Top: Bank name & Tier */}
                      <div className="relative z-10 flex justify-between items-start">
                        <div>
                          <div className="font-headline-md text-lg sm:text-xl font-bold tracking-widest text-[#D4AF37] uppercase drop-shadow">
                            BEACON CAPITAL
                          </div>
                          <div className="text-[10px] sm:text-xs text-[#90A4AE] font-mono uppercase tracking-widest font-semibold">
                            {card.cardTier || "BEACON ELITE BLACK"}
                          </div>
                        </div>

                        {/* Status pill */}
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-black/40 border border-white/10 text-xs font-mono">
                          <span className={`w-2 h-2 rounded-full ${card.isFrozen ? "bg-amber-400" : "bg-emerald-400"} animate-pulse`} />
                          <span className="text-[11px] uppercase tracking-wider font-bold">
                            {card.isFrozen ? "LOCKED" : "ACTIVE"}
                          </span>
                        </div>
                      </div>

                      {/* Chip & Contactless */}
                      <div className="relative z-10 flex items-center justify-between my-1 sm:my-2">
                        {/* EMV Chip graphic */}
                        <div className="w-12 h-9 bg-gradient-to-br from-[#E6C665] via-[#C9A339] to-[#8C6B1C] rounded-[4px] border border-[#F4DC89]/60 shadow-inner flex flex-col justify-around p-1">
                          <div className="w-full h-[1px] bg-black/30" />
                          <div className="w-full h-[1px] bg-black/30" />
                          <div className="w-full h-[1px] bg-black/30" />
                        </div>
                        <span className="material-symbols-outlined text-white/70 text-2xl rotate-90">
                          contactless
                        </span>
                      </div>

                      {/* Card Number */}
                      <div className="relative z-10 font-mono tracking-widest text-lg sm:text-2xl font-bold text-white/95 flex items-center justify-between">
                        <span>
                          {showCardNumber
                            ? card.cardNumber
                            : `4532  ••••  ••••  ${card.cardNumber.replace(/\s+/g, "").slice(-4)}`}
                        </span>
                        <button
                          type="button"
                          onClick={() => setShowCardNumber((prev) => !prev)}
                          className="text-white/60 hover:text-[#D4AF37] transition-colors p-1"
                          title={showCardNumber ? "Hide Number" : "Reveal Number"}
                        >
                          <span className="material-symbols-outlined text-lg">
                            {showCardNumber ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>

                      {/* Bottom Row: Holder, Expiry, CVV */}
                      <div className="relative z-10 flex justify-between items-end pt-2 border-t border-white/10">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-[#90A4AE]">Cardholder</div>
                          <div className="font-semibold text-xs sm:text-sm tracking-wider uppercase truncate max-w-[170px] text-white">
                            {card.cardHolder}
                          </div>
                        </div>

                        <div className="flex items-center gap-4">
                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-[#90A4AE]">Expires</div>
                            <div className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
                              {card.expiryMonth}/{card.expiryYear}
                            </div>
                          </div>

                          <div>
                            <div className="text-[9px] uppercase tracking-wider text-[#90A4AE] flex items-center gap-1">
                              CVV
                              <button
                                type="button"
                                onClick={() => setShowCvv((prev) => !prev)}
                                className="text-white/60 hover:text-white"
                              >
                                <span className="material-symbols-outlined text-[12px]">
                                  {showCvv ? "visibility_off" : "visibility"}
                                </span>
                              </button>
                            </div>
                            <div className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
                              {showCvv ? card.cvv : "•••"}
                            </div>
                          </div>

                          <div className="font-serif font-black italic text-lg sm:text-xl text-[#D4AF37] tracking-wider ml-1">
                            VISA
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card Actions Ribbon */}
                    <div className="flex flex-wrap items-center gap-2 max-w-[460px]">
                      <button
                        onClick={(e) => handleCopy(card.cardNumber, `card-num-${card.id}`, e)}
                        className="flex-1 min-w-[130px] flex items-center justify-center gap-1.5 py-2.5 px-3 bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-bold uppercase tracking-wider text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {copiedMap[`card-num-${card.id}`] ? "check" : "content_copy"}
                        </span>
                        <span>{copiedMap[`card-num-${card.id}`] ? "Copied!" : "Copy Card Number"}</span>
                      </button>

                      <button
                        onClick={(e) => handleCopy(card.cvv, `card-cvv-${card.id}`, e)}
                        className="flex items-center justify-center gap-1.5 py-2.5 px-3 bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-bold uppercase tracking-wider text-on-surface transition-colors"
                      >
                        <span className="material-symbols-outlined text-[16px] text-primary">
                          {copiedMap[`card-cvv-${card.id}`] ? "check" : "pin"}
                        </span>
                        <span>{copiedMap[`card-cvv-${card.id}`] ? "CVV Copied" : "Copy CVV"}</span>
                      </button>

                      <button
                        onClick={() => handleToggleCardFreeze(card)}
                        disabled={cardFreezeLoading}
                        className={`flex items-center justify-center gap-1.5 py-2.5 px-3 border text-xs font-bold uppercase tracking-wider transition-colors ${
                          card.isFrozen
                            ? "bg-amber-500/10 text-amber-400 border-amber-500/40 hover:bg-amber-500/20"
                            : "bg-surface-container hover:bg-red-900/20 text-on-surface hover:text-red-400 border-outline"
                        }`}
                      >
                        <span className="material-symbols-outlined text-[16px]">
                          {card.isFrozen ? "lock_open" : "lock"}
                        </span>
                        <span>{card.isFrozen ? "Unlock Card" : "Freeze Card"}</span>
                      </button>
                    </div>
                  </div>
                ))}

                {/* Card Limit & Benefits Panel */}
                <div className="lg:col-span-5 bg-surface-container-lowest border border-surface-dim p-5 sm:p-6 space-y-4">
                  <div className="border-b border-surface-dim pb-3">
                    <h3 className="font-headline-sm text-sm font-bold uppercase tracking-wider text-on-background">
                      Credit Limit &amp; Spending Power
                    </h3>
                    <p className="text-xs text-on-surface-variant mt-0.5">
                      Private Client Revolving Line of Credit
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between items-baseline">
                      <span className="text-xs text-on-surface-variant uppercase font-semibold">Available Credit</span>
                      <span className="font-headline-sm text-base font-bold text-[#2E7D32]">
                        ${(cards[0]?.availableCredit || 48500).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    {/* Progress bar */}
                    <div className="w-full bg-surface-container h-2.5 overflow-hidden">
                      <div
                        className="bg-primary h-full transition-all duration-500"
                        style={{
                          width: `${Math.min(100, Math.max(5, (((cards[0]?.creditLimit || 50000) - (cards[0]?.availableCredit || 48500)) / (cards[0]?.creditLimit || 50000)) * 100))}%`,
                        }}
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-on-surface-variant pt-1">
                      <span>Used: ${((cards[0]?.creditLimit || 50000) - (cards[0]?.availableCredit || 48500)).toLocaleString("en-US", { minimumFractionDigits: 2 })}</span>
                      <span className="font-semibold text-on-surface">
                        Total Limit: ${(cards[0]?.creditLimit || 50000).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-surface-dim space-y-2 text-xs">
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[#2E7D32] text-sm">check_circle</span>
                      <span>Zero foreign transaction exchange surcharge</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[#2E7D32] text-sm">check_circle</span>
                      <span>24/7 dedicated institutional concierge &amp; wire priority</span>
                    </div>
                    <div className="flex items-center gap-2 text-on-surface">
                      <span className="material-symbols-outlined text-[#2E7D32] text-sm">check_circle</span>
                      <span>Protected under Federal Reg E &amp; Chip-and-PIN Tokenization</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </section>

          {/* ── Institutional Accounts Stack with Direct Copy Buttons ── */}
          <section className="flex flex-col gap-sm">
            <div className="flex justify-between items-center border-b border-surface-dim pb-sm mb-xs">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">account_balance</span>
                <h2 className="font-headline-md text-headline-md text-on-background">Your Accounts</h2>
              </div>
              <span className="text-xs font-mono text-on-surface-variant">
                Routing: <strong className="text-primary font-bold">{routingNumber}</strong>
              </span>
            </div>

            {accounts.map((acc) => {
              const isLoan = acc.accountType === "loan";
              return (
                <div
                  key={acc.id}
                  className="bg-surface-container-lowest border border-surface-dim rounded-none p-4 md:p-6 hover:border-primary transition-colors flex flex-col md:flex-row md:items-center justify-between gap-4 group"
                >
                  {/* Account Identity */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 rounded-none bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary-fixed transition-colors shrink-0 mt-0.5 md:mt-0">
                      <span className="material-symbols-outlined">
                        {isLoan
                          ? "request_quote"
                          : acc.accountType === "checking"
                          ? "account_balance"
                          : acc.accountType === "savings"
                          ? "savings"
                          : "credit_card"}
                      </span>
                    </div>

                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Link
                          href={`/dashboard/transactions?accountId=${acc.id}`}
                          className="font-body-lg text-body-lg font-semibold text-on-background hover:text-primary transition-colors"
                        >
                          {acc.accountName}
                        </Link>
                        {isLoan && (
                          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/40">
                            Credit Facility
                          </span>
                        )}
                      </div>

                      {/* Numbers & Copy Buttons Bar */}
                      <div className="flex flex-wrap items-center gap-x-4 gap-y-2 pt-0.5">
                        {/* Account Number */}
                        <div className="inline-flex items-center gap-1.5 bg-surface-container/60 px-2 py-1 border border-outline/30">
                          <span className="text-[11px] text-on-surface-variant font-mono font-medium">ACCT:</span>
                          <span className="font-mono text-xs text-on-background font-bold tracking-wider">
                            {acc.accountNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(acc.accountNumber, `acc-${acc.id}`, e)}
                            className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary transition-colors"
                            title="Copy Account Number"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {copiedMap[`acc-${acc.id}`] ? "check" : "content_copy"}
                            </span>
                            <span>{copiedMap[`acc-${acc.id}`] ? "Copied" : "Copy"}</span>
                          </button>
                        </div>

                        {/* Routing Number */}
                        <div className="inline-flex items-center gap-1.5 bg-surface-container/60 px-2 py-1 border border-outline/30">
                          <span className="text-[11px] text-on-surface-variant font-mono font-medium">ROUTING:</span>
                          <span className="font-mono text-xs text-on-background font-bold tracking-wider">
                            {acc.routingNumber || routingNumber}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => handleCopy(acc.routingNumber || routingNumber, `rt-${acc.id}`, e)}
                            className="inline-flex items-center gap-1 ml-1 px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-surface-container-high hover:bg-primary hover:text-on-primary text-primary transition-colors"
                            title="Copy Routing Number"
                          >
                            <span className="material-symbols-outlined text-[13px]">
                              {copiedMap[`rt-${acc.id}`] ? "check" : "content_copy"}
                            </span>
                            <span>{copiedMap[`rt-${acc.id}`] ? "Copied" : "Copy"}</span>
                          </button>
                        </div>
                      </div>

                      {/* Loan Terms Sub-bar */}
                      {isLoan && (
                        <div className="flex flex-wrap items-center gap-3 text-xs text-on-surface-variant pt-1 font-mono">
                          <span>Rate: <strong className="text-on-background">{acc.interestRate || 5.25}% Fixed APR</strong></span>
                          <span>•</span>
                          <span>Installment: <strong className="text-on-background">${(acc.monthlyPayment || 3420).toLocaleString("en-US", { minimumFractionDigits: 2 })}/mo</strong></span>
                          <span>•</span>
                          <span>Term: <strong className="text-on-background">{acc.loanTerm || "60 Months"}</strong></span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Account Balance & Action */}
                  <div className="flex md:flex-col items-center md:items-end justify-between border-t md:border-t-0 border-surface-dim pt-3 md:pt-0 shrink-0">
                    <div className="text-left md:text-right">
                      <div className={`font-headline-md text-headline-md font-bold ${isLoan ? "text-amber-400" : acc.balance < 0 ? "text-primary" : "text-on-background"}`}>
                        ${Math.abs(acc.balance).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <p className="font-label-sm text-label-sm text-on-surface-variant uppercase">
                        {isLoan ? "Principal Balance" : acc.accountType === "credit" ? "Current Balance" : "Available Balance"}
                      </p>
                    </div>

                    <div className="flex items-center gap-2 mt-2">
                      {isLoan ? (
                        <button
                          onClick={() => {
                            setLoanFormData((prev) => ({
                              ...prev,
                              loanAccountId: acc.id,
                              amount: (acc.monthlyPayment || 3420).toString(),
                            }));
                            setActiveLoanModal("pay");
                            setLoanError("");
                            setLoanSuccess("");
                          }}
                          className="px-3 py-1.5 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                        >
                          <span className="material-symbols-outlined text-[14px]">payments</span>
                          <span>Pay Loan</span>
                        </button>
                      ) : (
                        <Link
                          href={`/dashboard/transactions?accountId=${acc.id}`}
                          className="px-3 py-1.5 bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold uppercase tracking-wider flex items-center gap-1 border border-outline transition-colors"
                        >
                          <span>Ledger</span>
                          <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </section>

          {/* ── Institutional Credit & Loan Facility Section ── */}
          <section className="bg-surface-container-lowest border border-surface-dim p-6 premium-shadow space-y-4">
            <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-surface-dim pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[#D4AF37]">account_balance_wallet</span>
                  <h2 className="font-headline-md text-headline-md text-on-background">
                    Institutional Credit &amp; Term Facilities
                  </h2>
                </div>
                <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">
                  Structured commercial lending, real estate senior credit, and revolving operational liquidity.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveLoanModal("apply");
                    setLoanError("");
                    setLoanSuccess("");
                  }}
                  className="px-4 py-2.5 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-sm"
                >
                  <span className="material-symbols-outlined text-sm">add_circle</span>
                  <span>Apply for Facility</span>
                </button>
              </div>
            </div>

            {/* Loan Facility Cards or Placeholder */}
            {accounts.some((a) => a.accountType === "loan") ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                {accounts.filter((a) => a.accountType === "loan").map((loan) => (
                  <div
                    key={loan.id}
                    className="bg-surface-container-low border border-surface-dim p-5 flex flex-col justify-between space-y-4"
                  >
                    <div>
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-bold text-primary uppercase tracking-wider font-mono">
                          Senior Secured Facility
                        </span>
                        <span className="text-[11px] font-mono px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                          Active &amp; Performing
                        </span>
                      </div>
                      <h3 className="font-headline-sm text-base font-bold text-on-background mt-1">
                        {loan.accountName}
                      </h3>
                      <p className="text-xs text-on-surface-variant font-mono mt-0.5">
                        Acct: {loan.accountNumber} • Routing: {loan.routingNumber || routingNumber}
                      </p>
                    </div>

                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-surface-dim text-center">
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Principal Due</div>
                        <div className="font-headline-sm text-sm font-bold text-on-background mt-0.5">
                          ${loan.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Fixed APR</div>
                        <div className="font-headline-sm text-sm font-bold text-[#D4AF37] mt-0.5">
                          {loan.interestRate || 5.25}%
                        </div>
                      </div>
                      <div>
                        <div className="text-[10px] text-on-surface-variant uppercase">Monthly Due</div>
                        <div className="font-headline-sm text-sm font-bold text-on-background mt-0.5">
                          ${(loan.monthlyPayment || 3420).toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-between items-center pt-1">
                      <span className="text-xs text-on-surface-variant font-mono">
                        Term: {loan.loanTerm || "60 Months"}
                      </span>
                      <button
                        onClick={() => {
                          setLoanFormData((prev) => ({
                            ...prev,
                            loanAccountId: loan.id,
                            amount: (loan.monthlyPayment || 3420).toString(),
                          }));
                          setActiveLoanModal("pay");
                        }}
                        className="px-4 py-2 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                      >
                        <span className="material-symbols-outlined text-sm">payment</span>
                        <span>Pay Installment</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-5 bg-surface-container-low border border-surface-dim flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="space-y-1">
                  <h4 className="font-body-lg text-body-lg font-bold text-on-background">
                    Tailored Institutional Capital for Your Enterprise
                  </h4>
                  <p className="text-xs text-on-surface-variant max-w-xl">
                    Fast-track debt financing up to $5,000,000.00 with transparent amortization schedules, competitive benchmark rates, and dedicated structuring teams.
                  </p>
                </div>
                <button
                  onClick={() => {
                    setActiveLoanModal("apply");
                    setLoanError("");
                    setLoanSuccess("");
                  }}
                  className="px-5 py-2.5 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider shrink-0 transition-colors"
                >
                  Start Loan Application
                </button>
              </div>
            )}
          </section>

          {/* Recent Transactions list */}
          <section className="flex flex-col gap-sm">
            <div className="flex justify-between items-center border-b border-surface-dim pb-sm mb-xs">
              <h2 className="font-headline-md text-headline-md text-on-background">Recent Transactions</h2>
              <Link href="/dashboard/transactions" className="text-primary hover:underline text-sm font-semibold flex items-center gap-1">
                View Ledger <span className="material-symbols-outlined text-sm">arrow_forward</span>
              </Link>
            </div>

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
                  {transactions.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-8 text-center text-on-surface-variant">
                        No transactions found.
                      </td>
                    </tr>
                  ) : (
                    transactions.slice(0, 5).map((tx, idx) => (
                      <tr key={tx.id} className={`${idx % 2 === 0 ? "bg-surface-container-lowest" : "bg-surface-container-low/30"} hover:bg-surface-container-low transition-colors`}>
                        <td className="p-4 whitespace-nowrap">
                          <div className="font-bold text-on-surface text-sm">{tx.effectiveDate}</div>
                          <div className="text-xs text-on-surface-variant">ID: {tx.id}</div>
                        </td>
                        <td className="p-4">
                          <div className="font-semibold text-on-surface text-sm">{tx.title}</div>
                          <div className="text-xs text-on-surface-variant mt-0.5">{tx.description}</div>
                        </td>
                        <td className="p-4 whitespace-nowrap text-center">
                          <span className="inline-flex items-center gap-1 font-label-sm text-label-sm uppercase font-bold">
                            <span
                              className={`w-2 h-2 inline-block ${
                                tx.status === "Settled"
                                  ? "bg-[#2E7D32]"
                                  : tx.status === "Rejected"
                                  ? "bg-[#C62828]"
                                  : "bg-[#FF9800]"
                              }`}
                            ></span>
                            <span className={
                              tx.status === "Settled"
                                ? "text-[#2E7D32]"
                                : tx.status === "Rejected"
                                ? "text-[#C62828]"
                                : "text-[#FF9800]"
                            }>
                              {tx.status}
                            </span>
                          </span>
                        </td>
                        <td className={`p-4 whitespace-nowrap text-right font-bold text-sm ${tx.amount < 0 ? "text-[#af0017]" : "text-[#2E7D32]"}`}>
                          {tx.amount < 0 ? "-" : "+"}${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </section>
        </main>
      </div>

      {/* BottomNavBar Mobile */}
      <nav className="md:hidden fixed bottom-0 w-full z-50 flex justify-around items-center bg-surface px-2 py-3 border-t border-outline bg-surface text-primary font-label-sm text-label-sm shadow-none">
        <Link className="flex flex-col items-center justify-center text-primary font-bold p-2 rounded-none w-full" href="/dashboard">
          <span className="material-symbols-outlined mb-1">account_balance</span>
          <span>Accounts</span>
        </Link>
        <Link className="flex flex-col items-center justify-center text-on-surface-variant p-2 rounded-none w-full" href="/dashboard/transactions">
          <span className="material-symbols-outlined mb-1">payments</span>
          <span>Ledger</span>
        </Link>
        <button onClick={handleLogout} className="flex flex-col items-center justify-center text-on-surface-variant p-2 rounded-none w-full">
          <span className="material-symbols-outlined mb-1">logout</span>
          <span>Logout</span>
        </button>
      </nav>

      {/* Quick Action Modal Overlay */}
      {activeModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[70] flex items-center justify-center p-md">
          <div className="bg-surface-container-lowest border border-surface-variant max-w-[480px] w-full p-md shadow-architectural">
            <div className="border-b border-surface-variant pb-sm mb-md flex justify-between items-center">
              <h3 className="font-headline-md text-headline-md text-primary uppercase tracking-wider font-bold">
                {activeModal === "transfer" && "Internal Transfer"}
                {activeModal === "zelle" && "Zelle Transfer"}
                {activeModal === "billpay" && "Bill Payment"}
                {activeModal === "deposit" && "Mobile Check Deposit"}
              </h3>
              <button onClick={() => setActiveModal(null)} className="text-on-surface-variant hover:text-on-background">
                <span className="material-symbols-outlined">close</span>
              </button>
            </div>

            {modalError && (
              <div className="bg-error-container border border-error text-error text-sm p-sm mb-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-error" style={{ fontSize: "20px" }}>error</span>
                <span>{modalError}</span>
              </div>
            )}

            {modalSuccess && (
              <div className="bg-[#E8F5E9] border border-[#2E7D32] text-[#2E7D32] text-sm p-sm mb-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[#2E7D32]" style={{ fontVariationSettings: "'FILL' 1", fontSize: "20px" }}>check_circle</span>
                <span>{modalSuccess}</span>
              </div>
            )}

            <form onSubmit={handleFormSubmit} className="space-y-md">
              {/* Source Account for Debit actions */}
              {activeModal !== "deposit" && (
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Source Account</label>
                  <select
                    className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    value={formData.sourceAccountId}
                    onChange={(e) => setFormData({ ...formData, sourceAccountId: e.target.value })}
                    required
                  >
                    {accounts.filter(a => a.accountType !== "credit").map(a => (
                      <option key={a.id} value={a.id}>{a.accountName} ({a.accountNumber}) - ${a.balance.toFixed(2)}</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Target Account for Transfer / Deposit actions */}
              {activeModal === "transfer" && (
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Destination Account</label>
                  <select
                    className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    value={formData.targetAccountId}
                    onChange={(e) => setFormData({ ...formData, targetAccountId: e.target.value })}
                    required
                  >
                    {accounts.filter(a => a.id !== formData.sourceAccountId).map(a => (
                      <option key={a.id} value={a.id}>{a.accountName} ({a.accountNumber})</option>
                    ))}
                  </select>
                </div>
              )}

              {activeModal === "deposit" && (
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Deposit Account</label>
                  <select
                    className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    value={formData.targetAccountId}
                    onChange={(e) => setFormData({ ...formData, targetAccountId: e.target.value })}
                    required
                  >
                    {accounts.filter(a => a.accountType !== "credit").map(a => (
                      <option key={a.id} value={a.id}>{a.accountName} ({a.accountNumber})</option>
                    ))}
                  </select>
                </div>
              )}

              {/* Zelle Recipient Field */}
              {activeModal === "zelle" && (
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Recipient Email / Phone</label>
                  <input
                    type="text"
                    className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    placeholder="name@email.com or +1 555-000-0000"
                    value={formData.recipient}
                    onChange={(e) => setFormData({ ...formData, recipient: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Bill Pay Biller Field */}
              {activeModal === "billpay" && (
                <div>
                  <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Biller Name</label>
                  <input
                    type="text"
                    className="w-full data-input rounded-none py-sm px-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    placeholder="e.g. Comcast, Beacon Utility Co."
                    value={formData.biller}
                    onChange={(e) => setFormData({ ...formData, biller: e.target.value })}
                    required
                  />
                </div>
              )}

              {/* Amount Field */}
              <div>
                <label className="block font-label-sm text-label-sm text-on-surface-variant mb-xs">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-sm text-on-surface-variant font-body-md text-body-md">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    className="w-full data-input rounded-none py-sm pl-8 pr-sm font-body-md text-body-md text-on-surface bg-surface border border-outline-variant focus:outline-none"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="mt-lg flex justify-end gap-md border-t border-outline-variant pt-md">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-lg py-sm btn-secondary font-label-sm text-label-sm uppercase tracking-wider"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={modalLoading}
                  className="px-lg py-sm btn-primary font-label-sm text-label-sm uppercase tracking-wider disabled:bg-primary/50"
                >
                  {modalLoading ? "Executing..." : "Submit"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Loan Payment Modal ── */}
      {activeLoanModal === "pay" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant max-w-[500px] w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-surface-variant pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-xl">payments</span>
                <h3 className="font-headline-md text-base font-bold uppercase tracking-wider text-primary">
                  Make Loan Installment Payment
                </h3>
              </div>
              <button
                onClick={() => setActiveLoanModal(null)}
                className="text-on-surface-variant hover:text-on-background p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {loanError && (
              <div className="bg-red-950/40 border border-red-500/60 text-red-300 text-xs p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                <span>{loanError}</span>
              </div>
            )}

            {loanSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 text-xs p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                <span>{loanSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoanPayment} className="space-y-4">
              {/* Target Loan Facility */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Target Loan Facility
                </label>
                <select
                  className="w-full py-2 px-3 text-sm text-on-surface bg-surface border border-outline focus:outline-none"
                  value={loanFormData.loanAccountId}
                  onChange={(e) => setLoanFormData({ ...loanFormData, loanAccountId: e.target.value })}
                  required
                >
                  {accounts.filter((a) => a.accountType === "loan").map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (Due: ${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })})
                    </option>
                  ))}
                </select>
              </div>

              {/* Source Account */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Pay From (Checking / Savings)
                </label>
                <select
                  className="w-full py-2 px-3 text-sm text-on-surface bg-surface border border-outline focus:outline-none"
                  value={loanFormData.sourceAccountId}
                  onChange={(e) => setLoanFormData({ ...loanFormData, sourceAccountId: e.target.value })}
                  required
                >
                  {accounts.filter((a) => a.accountType !== "loan" && a.accountType !== "credit").map((a) => (
                    <option key={a.id} value={a.id}>
                      {a.accountName} (${a.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })} Available)
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Payment Amount (USD)
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant text-sm">$</span>
                  <input
                    type="number"
                    step="0.01"
                    min="1.00"
                    className="w-full py-2 pl-8 pr-3 text-sm text-on-surface bg-surface border border-outline focus:outline-none font-mono"
                    placeholder="0.00"
                    value={loanFormData.amount}
                    onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                    required
                  />
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-variant">
                <button
                  type="button"
                  onClick={() => setActiveLoanModal(null)}
                  className="px-4 py-2 border border-outline text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loanLoading}
                  className="px-5 py-2 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider disabled:bg-primary/50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">payments</span>
                  <span>{loanLoading ? "Settling..." : "Settle Payment"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ── Loan Application Modal ── */}
      {activeLoanModal === "apply" && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[75] flex items-center justify-center p-4">
          <div className="bg-surface-container-lowest border border-surface-variant max-w-[540px] w-full p-6 shadow-2xl space-y-4">
            <div className="border-b border-surface-variant pb-3 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[#D4AF37] text-xl">account_balance</span>
                <h3 className="font-headline-md text-base font-bold uppercase tracking-wider text-on-background">
                  Apply for Institutional Debt Facility
                </h3>
              </div>
              <button
                onClick={() => setActiveLoanModal(null)}
                className="text-on-surface-variant hover:text-on-background p-1"
              >
                <span className="material-symbols-outlined text-lg">close</span>
              </button>
            </div>

            {loanError && (
              <div className="bg-red-950/40 border border-red-500/60 text-red-300 text-xs p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-red-400 text-lg">error</span>
                <span>{loanError}</span>
              </div>
            )}

            {loanSuccess && (
              <div className="bg-emerald-950/40 border border-emerald-500/60 text-emerald-300 text-xs p-3 flex items-center gap-2">
                <span className="material-symbols-outlined text-emerald-400 text-lg">check_circle</span>
                <span>{loanSuccess}</span>
              </div>
            )}

            <form onSubmit={handleLoanApply} className="space-y-4">
              {/* Facility Purpose */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                  Facility Purpose / Strategy
                </label>
                <select
                  className="w-full py-2 px-3 text-sm text-on-surface bg-surface border border-outline focus:outline-none"
                  value={loanFormData.purpose}
                  onChange={(e) => setLoanFormData({ ...loanFormData, purpose: e.target.value })}
                  required
                >
                  <option value="Commercial Real Estate">Commercial Real Estate Senior Loan</option>
                  <option value="Corporate Working Capital">Corporate Working Capital Revolver</option>
                  <option value="Private Credit Bridge">Private Credit Bridge Facility</option>
                  <option value="Equipment & Machinery">Institutional Equipment Financing</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* Desired Amount */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Requested Amount (USD)
                  </label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-on-surface-variant text-sm">$</span>
                    <input
                      type="number"
                      step="5000"
                      min="5000"
                      className="w-full py-2 pl-8 pr-3 text-sm text-on-surface bg-surface border border-outline focus:outline-none font-mono"
                      placeholder="100000"
                      value={loanFormData.amount}
                      onChange={(e) => setLoanFormData({ ...loanFormData, amount: e.target.value })}
                      required
                    />
                  </div>
                </div>

                {/* Term */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-on-surface-variant mb-1">
                    Term Duration
                  </label>
                  <select
                    className="w-full py-2 px-3 text-sm text-on-surface bg-surface border border-outline focus:outline-none"
                    value={loanFormData.termMonths}
                    onChange={(e) => setLoanFormData({ ...loanFormData, termMonths: e.target.value })}
                    required
                  >
                    <option value="12">12 Months (1 Year)</option>
                    <option value="36">36 Months (3 Years)</option>
                    <option value="60">60 Months (5 Years)</option>
                    <option value="120">120 Months (10 Years)</option>
                  </select>
                </div>
              </div>

              {/* Estimate Breakdown Box */}
              <div className="bg-surface-container p-3 border border-outline/40 space-y-1 text-xs font-mono">
                <div className="flex justify-between text-on-surface-variant">
                  <span>Interest Rate:</span>
                  <span className="font-bold text-on-background">5.25% Fixed APR</span>
                </div>
                <div className="flex justify-between text-on-surface-variant">
                  <span>Origination Fee:</span>
                  <span className="font-bold text-emerald-400">0.00% (Waived for Private Clients)</span>
                </div>
                {loanFormData.amount && (
                  <div className="flex justify-between pt-1 border-t border-outline/30 text-primary font-bold">
                    <span>Est. Monthly Installment:</span>
                    <span>
                      ${(
                        (parseFloat(loanFormData.amount || "0") * (0.0525 / 12) * Math.pow(1 + 0.0525 / 12, parseInt(loanFormData.termMonths || "60"))) /
                        (Math.pow(1 + 0.0525 / 12, parseInt(loanFormData.termMonths || "60")) - 1)
                      ).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      /mo
                    </span>
                  </div>
                )}
              </div>

              <div className="flex justify-end gap-3 pt-3 border-t border-surface-variant">
                <button
                  type="button"
                  onClick={() => setActiveLoanModal(null)}
                  className="px-4 py-2 border border-outline text-xs font-bold uppercase tracking-wider text-on-surface hover:bg-surface-container"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loanLoading}
                  className="px-5 py-2 bg-primary hover:bg-[#8f0013] text-white text-xs font-bold uppercase tracking-wider disabled:bg-primary/50 flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">check_circle</span>
                  <span>{loanLoading ? "Approving..." : "Submit Application"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
