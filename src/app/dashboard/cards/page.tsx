"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, Account } from "@/lib/db";
import MobileBottomNav from "@/components/dashboard/MobileBottomNav";

export default function CardsPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [cards, setCards] = useState<Card[]>([]);
  const [loading, setLoading] = useState(true);

  // Card interactive state
  const [showCardNumber, setShowCardNumber] = useState(false);
  const [showCvv, setShowCvv] = useState(false);
  const [cardFreezeLoading, setCardFreezeLoading] = useState(false);
  const [copiedMap, setCopiedMap] = useState<{ [key: string]: boolean }>({});
  const [drawerOpen, setDrawerOpen] = useState(false);

  const fetchCardData = async () => {
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
      setCards(data.cards || []);
    } catch (err) {
      console.error("Error loading cards:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCardData();
  }, []);

  const handleCopy = (text: string, key: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    navigator.clipboard.writeText(text);
    setCopiedMap((prev) => ({ ...prev, [key]: true }));
    setTimeout(() => {
      setCopiedMap((prev) => ({ ...prev, [key]: false }));
    }, 2000);
  };

  const handleToggleCardFreeze = async (card: Card) => {
    setCardFreezeLoading(true);
    try {
      const res = await fetch("/api/cards", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          action: "toggle_freeze",
          cardId: card.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update card status");

      setCards((prev) =>
        prev.map((c) => (c.id === card.id ? { ...c, isFrozen: data.isFrozen } : c))
      );
    } catch (err: any) {
      alert(err.message || "Failed to toggle card lock state");
    } finally {
      setCardFreezeLoading(false);
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
            Accessing Secure Card Vault...
          </p>
        </div>
      </div>
    );
  }

  const primaryAccount = accounts.find((a) => a.accountType !== "loan") || accounts[0];

  return (
    <div className="text-on-background bg-background min-h-screen flex flex-col pt-16 pb-24 md:pb-0 md:pt-0">
      {/* Mobile Top Header */}
      <header className="md:hidden fixed z-50 flex justify-between items-center w-full px-4 h-16 bg-[#0E131F] text-white top-0 border-b border-[#1C2433]">
        <Link href="/dashboard" className="flex items-center gap-2 text-white">
          <span className="material-symbols-outlined">arrow_back</span>
          <span className="font-bold text-sm uppercase tracking-wider">Dashboard</span>
        </Link>
        <span className="font-bold text-sm tracking-wider uppercase text-[#D4AF37]">
          Private Client Cards
        </span>
        <button
          onClick={handleLogout}
          aria-label="Logout"
          className="p-2 text-slate-400 hover:text-white"
        >
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
              className="flex items-center px-4 py-3 rounded bg-primary text-on-primary font-bold transition-colors duration-200"
              href="/dashboard/cards"
            >
              <span className="material-symbols-outlined mr-3">credit_card</span>
              <span className="font-body-md text-body-md">Credit Cards</span>
            </Link>
            <Link
              className="flex items-center px-4 py-3 rounded text-on-surface-variant hover:bg-surface-container-high transition-colors duration-200"
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
          {/* Header section */}
          <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-3 border-b border-surface-dim pb-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-primary text-2xl">credit_card</span>
                <h1 className="text-xl md:text-2xl font-bold text-on-background">
                  Beacon Private Client Cards
                </h1>
              </div>
              <p className="text-sm text-on-surface-variant mt-1">
                Elite institutional credit cards, dynamic security codes, and real-time card controls.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono uppercase tracking-widest px-3 py-1 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30 font-bold rounded">
                Worldwide Visa Signature Access
              </span>
            </div>
          </div>

          {cards.length === 0 ? (
            <div className="bg-surface-container-lowest border border-surface-dim p-10 text-center text-on-surface-variant">
              <span className="material-symbols-outlined text-5xl text-on-surface-variant/60 mb-3">
                credit_card_off
              </span>
              <h3 className="text-lg font-bold text-on-background">No Cards Currently Issued</h3>
              <p className="text-sm mt-1">Provisioning your Beacon Elite Black credit card...</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              {/* Luxury Digital Card */}
              {cards.map((card) => (
                <div key={card.id} className="lg:col-span-7 flex flex-col gap-4">
                  <div className="relative overflow-hidden w-full aspect-[1.586/1] max-w-[480px] bg-gradient-to-br from-[#1b2230] via-[#111722] to-[#0a0d14] text-white p-6 sm:p-8 shadow-2xl border border-[#D4AF37]/50 rounded-2xl flex flex-col justify-between group select-none">
                    {/* Metallic sheen overlay */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.22),transparent_60%)] pointer-events-none" />
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,transparent_40%,rgba(255,255,255,0.06)_50%,transparent_60%)] pointer-events-none" />

                    {/* Card Top: Bank name & Tier */}
                    <div className="relative z-10 flex justify-between items-start">
                      <div>
                        <div className="font-headline-md text-xl sm:text-2xl font-bold tracking-widest text-[#D4AF37] uppercase drop-shadow">
                          BEACON CAPITAL
                        </div>
                        <div className="text-[10px] sm:text-xs text-[#90A4AE] font-mono uppercase tracking-widest font-semibold">
                          {card.cardTier || "BEACON ELITE BLACK"}
                        </div>
                      </div>

                      {/* Status pill */}
                      <div className="flex items-center gap-1.5 px-3 py-1 bg-black/50 border border-white/10 text-xs font-mono rounded-full">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            card.isFrozen ? "bg-amber-400" : "bg-emerald-400"
                          } animate-pulse`}
                        />
                        <span className="text-[11px] uppercase tracking-wider font-bold">
                          {card.isFrozen ? "LOCKED" : "ACTIVE"}
                        </span>
                      </div>
                    </div>

                    {/* Chip & Contactless */}
                    <div className="relative z-10 flex items-center justify-between my-2">
                      {/* EMV Chip graphic */}
                      <div className="w-13 h-10 w-[50px] h-[38px] bg-gradient-to-br from-[#E6C665] via-[#C9A339] to-[#8C6B1C] rounded-[6px] border border-[#F4DC89]/70 shadow-inner flex flex-col justify-around p-1">
                        <div className="w-full h-[1px] bg-black/30" />
                        <div className="w-full h-[1px] bg-black/30" />
                        <div className="w-full h-[1px] bg-black/30" />
                      </div>
                      <span className="material-symbols-outlined text-white/80 text-3xl rotate-90">
                        contactless
                      </span>
                    </div>

                    {/* Card Number */}
                    <div className="relative z-10 font-mono tracking-widest text-xl sm:text-2xl font-bold text-white flex items-center justify-between">
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
                        <span className="material-symbols-outlined text-xl">
                          {showCardNumber ? "visibility_off" : "visibility"}
                        </span>
                      </button>
                    </div>

                    {/* Bottom Row: Holder, Expiry, CVV */}
                    <div className="relative z-10 flex justify-between items-end pt-3 border-t border-white/10">
                      <div>
                        <div className="text-[9px] uppercase tracking-wider text-[#90A4AE]">Cardholder</div>
                        <div className="font-semibold text-xs sm:text-sm tracking-wider uppercase truncate max-w-[180px] text-white">
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
                              <span className="material-symbols-outlined text-[13px]">
                                {showCvv ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                          <div className="font-mono text-xs sm:text-sm font-semibold tracking-wider text-white">
                            {showCvv ? card.cvv : "•••"}
                          </div>
                        </div>

                        <div className="font-serif font-black italic text-xl text-[#D4AF37] tracking-wider ml-1">
                          VISA
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Card Actions Ribbon */}
                  <div className="flex flex-wrap items-center gap-3 max-w-[480px]">
                    <button
                      onClick={(e) => handleCopy(card.cardNumber, `card-num-${card.id}`, e)}
                      className="flex-1 min-w-[130px] flex items-center justify-center gap-2 py-3 px-4 bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-bold uppercase tracking-wider text-on-surface rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        {copiedMap[`card-num-${card.id}`] ? "check" : "content_copy"}
                      </span>
                      <span>{copiedMap[`card-num-${card.id}`] ? "Copied!" : "Copy Card Number"}</span>
                    </button>

                    <button
                      onClick={(e) => handleCopy(card.cvv, `card-cvv-${card.id}`, e)}
                      className="flex items-center justify-center gap-2 py-3 px-4 bg-surface-container hover:bg-surface-container-high border border-outline text-xs font-bold uppercase tracking-wider text-on-surface rounded-lg transition-colors"
                    >
                      <span className="material-symbols-outlined text-[18px] text-primary">
                        {copiedMap[`card-cvv-${card.id}`] ? "check" : "pin"}
                      </span>
                      <span>{copiedMap[`card-cvv-${card.id}`] ? "CVV Copied" : "Copy CVV"}</span>
                    </button>

                    <button
                      onClick={() => handleToggleCardFreeze(card)}
                      disabled={cardFreezeLoading}
                      className={`flex items-center justify-center gap-2 py-3 px-4 border text-xs font-bold uppercase tracking-wider rounded-lg transition-colors ${
                        card.isFrozen
                          ? "bg-amber-500/10 text-amber-500 border-amber-500/40 hover:bg-amber-500/20"
                          : "bg-surface-container hover:bg-red-900/20 text-on-surface hover:text-red-500 border-outline"
                      }`}
                    >
                      <span className="material-symbols-outlined text-[18px]">
                        {card.isFrozen ? "lock_open" : "lock"}
                      </span>
                      <span>{card.isFrozen ? "Unlock Card" : "Freeze Card"}</span>
                    </button>
                  </div>
                </div>
              ))}

              {/* Card Limit & Benefits Panel */}
              <div className="lg:col-span-5 bg-surface-container-lowest border border-surface-dim rounded-2xl p-6 space-y-6">
                <div className="border-b border-surface-dim pb-4">
                  <h3 className="font-bold text-base uppercase tracking-wider text-on-background">
                    Credit Line &amp; Spending Power
                  </h3>
                  <p className="text-xs text-on-surface-variant mt-0.5">
                    Tier 1 Institutional Private Banking Facility
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-baseline">
                    <span className="text-xs text-on-surface-variant uppercase font-medium">
                      Available Credit Line
                    </span>
                    <span className="font-mono text-xl font-bold text-emerald-600 dark:text-emerald-400">
                      ${cards[0]?.availableCredit?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "48,250.00"}
                    </span>
                  </div>

                  {/* Progress bar */}
                  <div className="w-full h-2 bg-surface-container rounded-full overflow-hidden">
                    <div className="h-full bg-emerald-500 rounded-full w-[96%]" />
                  </div>

                  <div className="flex justify-between items-baseline text-xs text-on-surface-variant font-mono">
                    <span>Total Credit Line:</span>
                    <span className="font-bold text-on-background">
                      ${cards[0]?.creditLimit?.toLocaleString("en-US", { minimumFractionDigits: 2 }) || "50,000.00"}
                    </span>
                  </div>
                </div>

                {/* Features list */}
                <div className="border-t border-surface-dim pt-4 space-y-3 text-xs">
                  <div className="flex items-center gap-2.5 text-on-surface">
                    <span className="material-symbols-outlined text-[#2E7D32] text-base">check_circle</span>
                    <span>Zero Liability Protection on unauthorized charges</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-on-surface">
                    <span className="material-symbols-outlined text-[#2E7D32] text-base">check_circle</span>
                    <span>No Foreign Transaction Fees on international settlement</span>
                  </div>
                  <div className="flex items-center gap-2.5 text-on-surface">
                    <span className="material-symbols-outlined text-[#2E7D32] text-base">check_circle</span>
                    <span>Instant Digital Freeze &amp; EMV Dynamic Tokenization</span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Reusable Mobile Bottom Navigation */}
      <MobileBottomNav
        user={user}
        primaryAccount={primaryAccount}
        onOpenProfile={() => setDrawerOpen(true)}
      />
    </div>
  );
}
