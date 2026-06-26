"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Account, Transaction } from "@/lib/db";

interface UserWithAccounts extends User {
  accounts: Account[];
}

type TabType = "overview" | "pending" | "users" | "profile";

export default function AdminConsole() {
  const router = useRouter();
  const [admin, setAdmin] = useState<any>(null);
  const [users, setUsers] = useState<UserWithAccounts[]>([]);
  const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>("overview");
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  // Form states for Account Freeze
  const [isFrozenInput, setIsFrozenInput] = useState(false);
  const [frozenReasonInput, setFrozenReasonInput] = useState("");
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeSuccess, setFreezeSuccess] = useState("");

  // Form states for Balance Adjustment
  const [adjustAccountType, setAdjustAccountType] = useState<"checking" | "savings">("checking");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustMethod, setAdjustMethod] = useState<"wire" | "ach" | "zelle" | "deposit" | "billpay">("wire");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustDate, setAdjustDate] = useState("");
  const [adjustTime, setAdjustTime] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState("");

  const fetchData = async () => {
    try {
      // Check admin session
      const profileRes = await fetch("/api/auth/me");
      if (!profileRes.ok) {
        router.push("/admin");
        return;
      }
      const profileData = await profileRes.json();
      if (profileData.user.role !== "admin") {
        router.push("/dashboard");
        return;
      }
      setAdmin(profileData.user);

      // Get users list
      const usersRes = await fetch("/api/admin/users");
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      // Get all transactions
      const txRes = await fetch("/api/transactions");
      if (txRes.ok) {
        const txData = await txRes.json();
        setAllTransactions(txData.transactions);
      }
    } catch (err) {
      console.error("Failed to load admin console data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // Default form dates to today's date
    const today = new Date().toISOString().split("T")[0];
    setAdjustDate(today);
    const nowTime = new Date().toLocaleTimeString("en-US", { hour12: false });
    setAdjustTime(nowTime);
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  // User Freeze handler
  const handleToggleFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setFreezeLoading(true);
    setFreezeSuccess("");

    try {
      const res = await fetch("/api/admin/users/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: selectedUserId,
          isFrozen: isFrozenInput,
          frozenReason: isFrozenInput ? frozenReasonInput : "",
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Failed to update freeze status");
      }

      setFreezeSuccess(`Account freeze status updated successfully.`);
      await fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setFreezeLoading(false);
    }
  };

  // Balance Adjustment handler
  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError("");
    setAdjustSuccess("");

    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) {
      setAdjustError("No customer selected.");
      return;
    }

    const account = targetUser.accounts.find((a) => a.accountType === adjustAccountType);
    if (!account) {
      setAdjustError(`The customer does not have a ${adjustAccountType} account.`);
      return;
    }

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) {
      setAdjustError("Please enter a valid amount.");
      return;
    }

    setAdjustLoading(true);

    try {
      const res = await fetch("/api/admin/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: account.id,
          type: adjustType,
          method: adjustMethod,
          amount: amt,
          effectiveDate: adjustDate,
          customTime: adjustTime,
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Adjustment failed");
      }

      setAdjustSuccess("Balance adjusted successfully!");
      setAdjustAmount("");
      
      // Refresh state
      await fetchData();
    } catch (err: any) {
      setAdjustError(err.message || "An unexpected error occurred");
    } finally {
      setAdjustLoading(false);
    }
  };

  // Transaction Approval handler
  const handleApproveReject = async (transactionId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || "Approval action failed");
      }

      await fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0B0E14]">
        <div className="text-center">
          <span className="material-symbols-outlined text-[#af0017] animate-spin text-[48px]">sync</span>
          <p className="font-bold text-[#90A4AE] mt-4">Establishing Secure Connection...</p>
        </div>
      </div>
    );
  }

  // Calculate dynamic stats
  const totalCustomers = users.length;
  const pendingTransactions = allTransactions.filter((t) => t.status === "Pending" && t.title !== "Wire Transfer Fee");
  const pendingApprovalsCount = pendingTransactions.length;

  const totalCash = users.reduce((sum, u) => {
    const checkingAcc = u.accounts.find((a) => a.accountType === "checking");
    return sum + (checkingAcc ? checkingAcc.balance : 0);
  }, 0);

  const totalInvested = users.reduce((sum, u) => {
    const savingsAcc = u.accounts.find((a) => a.accountType === "savings");
    return sum + (savingsAcc ? savingsAcc.balance : 0);
  }, 0);

  const totalAUM = totalCash + totalInvested;

  // Calculate today's volume (sum of absolute amounts of settled transactions created today)
  const todayStr = new Date().toISOString().split("T")[0];
  const todayVolume = allTransactions
    .filter((t) => t.status === "Settled" && t.effectiveDate === todayStr)
    .reduce((sum, t) => sum + Math.abs(t.amount), 0);

  const selectedUser = users.find((u) => u.id === selectedUserId);

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0E14] text-white font-sans antialiased">
      {/* Sidebar Navigation */}
      <nav className="w-80 border-r border-[#1C2433] bg-[#0E131F] flex flex-col justify-between">
        <div>
          {/* Header Branding */}
          <div className="p-6 border-b border-[#1C2433]">
            <h1 className="text-xl font-bold text-white tracking-wide uppercase">Admin Console</h1>
            <p className="text-xs text-[#af0017] font-semibold mt-1 tracking-widest uppercase">Go Investment Bank</p>
          </div>

          {/* Nav Links */}
          <div className="py-6 px-4 space-y-2">
            <p className="text-[#546E7A] text-[10px] uppercase font-bold tracking-wider px-3 mb-2">Operations</p>
            <button
              onClick={() => { setActiveTab("overview"); setSelectedUserId(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors duration-150 text-left font-semibold ${
                activeTab === "overview" ? "bg-[#182235] text-[#af0017] border-l-4 border-[#af0017]" : "text-[#90A4AE] hover:bg-[#131924] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined">dashboard</span>
              <span>Overview</span>
            </button>
            <button
              onClick={() => { setActiveTab("pending"); setSelectedUserId(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors duration-150 text-left font-semibold ${
                activeTab === "pending" ? "bg-[#182235] text-[#af0017] border-l-4 border-[#af0017]" : "text-[#90A4AE] hover:bg-[#131924] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined">hourglass_empty</span>
              <div className="flex-1 flex justify-between items-center">
                <span>Pending Transfers</span>
                {pendingApprovalsCount > 0 && (
                  <span className="bg-[#af0017] text-white px-1.5 py-0.5 text-xs font-bold font-mono">
                    {pendingApprovalsCount}
                  </span>
                )}
              </div>
            </button>
            <button
              onClick={() => { setActiveTab("users"); setSelectedUserId(""); }}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors duration-150 text-left font-semibold ${
                activeTab === "users" || activeTab === "profile" ? "bg-[#182235] text-[#af0017] border-l-4 border-[#af0017]" : "text-[#90A4AE] hover:bg-[#131924] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined">group</span>
              <span>User Management</span>
            </button>
          </div>
        </div>

        {/* User Pill & Sign Out */}
        <div className="p-4 border-t border-[#1C2433] bg-[#0A0D15]">
          <div className="flex items-center gap-3 mb-4 px-2">
            <div className="w-10 h-10 bg-[#af0017]/20 flex items-center justify-center text-[#af0017] font-bold text-lg rounded-none">
              {(admin?.firstName?.[0] || "A").toUpperCase()}
            </div>
            <div>
              <p className="text-sm font-semibold text-white">{admin?.firstName || "Admin"}</p>
              <span className="text-[10px] bg-[#af0017] text-white font-bold px-1.5 py-0.5 uppercase tracking-wide">
                Admin
              </span>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full bg-[#1A2332] text-white hover:bg-red-900/40 hover:text-red-400 py-2.5 px-4 font-bold text-sm tracking-wider uppercase rounded-none transition-colors flex items-center justify-center gap-2 border border-[#2A374A]"
          >
            <span className="material-symbols-outlined text-sm">logout</span>
            <span>Sign Out</span>
          </button>
        </div>
      </nav>

      {/* Main Content Pane */}
      <main className="flex-1 overflow-y-auto bg-[#0B0E14] p-8">
        
        {/* OVERVIEW TAB */}
        {activeTab === "overview" && (
          <div className="space-y-8 animate-fade-in">
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-white">Overview</h2>
              <p className="text-sm text-[#90A4AE] mt-1">Real-time status of GO INVESTMENT BANK platform assets and operations.</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-4 gap-6">
              <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-500/10 text-blue-400 flex items-center justify-center rounded-none">
                  <span className="material-symbols-outlined text-3xl">people</span>
                </div>
                <div>
                  <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Total Customers</p>
                  <p className="text-2xl font-bold text-white mt-1">{totalCustomers}</p>
                  <p className="text-[10px] text-[#546E7A] mt-1">Registered accounts</p>
                </div>
              </div>

              <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex items-center gap-4">
                <div className="w-12 h-12 bg-[#af0017]/10 text-[#af0017] flex items-center justify-center rounded-none">
                  <span className="material-symbols-outlined text-3xl">hourglass_empty</span>
                </div>
                <div>
                  <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Pending Approvals</p>
                  <p className={`text-2xl font-bold mt-1 ${pendingApprovalsCount > 0 ? "text-[#af0017]" : "text-white"}`}>
                    {pendingApprovalsCount}
                  </p>
                  <p className="text-[10px] text-[#546E7A] mt-1">Transfers awaiting action</p>
                </div>
              </div>

              <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex items-center gap-4">
                <div className="w-12 h-12 bg-green-500/10 text-green-400 flex items-center justify-center rounded-none">
                  <span className="material-symbols-outlined text-3xl">payments</span>
                </div>
                <div>
                  <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Total AUM</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${totalAUM.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#546E7A] mt-1">Assets under management</p>
                </div>
              </div>

              <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex items-center gap-4">
                <div className="w-12 h-12 bg-[#90A4AE]/10 text-[#90A4AE] flex items-center justify-center rounded-none">
                  <span className="material-symbols-outlined text-3xl">show_chart</span>
                </div>
                <div>
                  <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Today's Volume</p>
                  <p className="text-2xl font-bold text-white mt-1">
                    ${todayVolume.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-[10px] text-[#546E7A] mt-1">0 transactions today</p>
                </div>
              </div>
            </div>

            {/* Portfolio Breakdown and Quick Actions */}
            <div className="grid grid-cols-3 gap-8">
              {/* Portfolio breakdown */}
              <div className="col-span-2 bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Portfolio Breakdown</h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center py-3 border-b border-[#1C2433]">
                    <span className="text-[#90A4AE] text-sm font-semibold">Total Available Cash</span>
                    <span className="text-[#af0017] font-mono font-bold text-lg">
                      ${totalCash.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-3 border-b border-[#1C2433]">
                    <span className="text-[#90A4AE] text-sm font-semibold">Total Invested Funds</span>
                    <span className="text-[#448AFF] font-mono font-bold text-lg">
                      ${totalInvested.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-3 font-bold">
                    <span className="text-white text-sm font-bold uppercase">Total AUM</span>
                    <span className="text-green-400 font-mono font-bold text-xl">
                      ${totalAUM.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick actions panel */}
              <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex flex-col justify-between">
                <div>
                  <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Quick Actions</h3>
                  <p className="text-sm text-[#90A4AE]">Fast links to manage clients and resolve pending wires.</p>
                </div>
                <div className="space-y-3 mt-6">
                  <button
                    onClick={() => setActiveTab("pending")}
                    className="w-full bg-[#af0017] text-white hover:bg-[#8f0013] py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm font-bold">hourglass_empty</span>
                    <span>Review Pending Transfers ({pendingApprovalsCount})</span>
                  </button>
                  <button
                    onClick={() => setActiveTab("users")}
                    className="w-full bg-[#1E293B] text-white hover:bg-[#2D3F59] py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none border border-[#334155] transition-colors flex items-center justify-center gap-2"
                  >
                    <span className="material-symbols-outlined text-sm">group</span>
                    <span>Manage Users ({totalCustomers})</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* PENDING TRANSFERS TAB */}
        {activeTab === "pending" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">Pending Transfers</h2>
                <p className="text-sm text-[#90A4AE] mt-1">Review, approve or reject client-initiated transactions.</p>
              </div>
              <span className="bg-[#1E293B] border border-[#334155] text-white px-4 py-2 font-semibold text-sm rounded-none">
                {pendingApprovalsCount} transfers pending
              </span>
            </div>

            {pendingTransactions.length === 0 ? (
              <div className="bg-[#131924] border border-[#1C2433] p-12 text-center rounded-none">
                <span className="material-symbols-outlined text-[64px] text-[#546E7A]">check_circle</span>
                <h3 className="text-lg font-bold text-white mt-4">Zero Pending Transfers</h3>
                <p className="text-sm text-[#90A4AE] mt-2">All transactions have been processed and settled.</p>
              </div>
            ) : (
              <div className="bg-[#131924] border border-[#1C2433] rounded-none overflow-hidden">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#0E131F] border-b border-[#1C2433] text-[#90A4AE] text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Date</th>
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Recipient Details</th>
                      <th className="py-4 px-6">Reference</th>
                      <th className="py-4 px-6 text-right">Amount (USD)</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2433]">
                    {pendingTransactions.map((tx) => {
                      // Find the owner of this account
                      const owner = users.find((u) => u.accounts.some((a) => a.id === tx.accountId));
                      
                      return (
                        <tr key={tx.id} className="hover:bg-[#17202E] transition-colors font-medium">
                          <td className="py-4 px-6 text-sm text-[#90A4AE]">
                            {new Date(tx.createdAt).toLocaleDateString("en-US", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </td>
                          <td className="py-4 px-6">
                            <p className="text-sm font-bold text-white">{owner ? `${owner.firstName} ${owner.lastName}` : "Unknown User"}</p>
                            <p className="text-xs text-[#90A4AE] mt-0.5">{owner?.username || "unknown"}</p>
                          </td>
                          <td className="py-4 px-6 text-sm text-[#E0E0E0] font-mono">
                            {tx.recipientDetails || tx.description || "N/A"}
                          </td>
                          <td className="py-4 px-6">
                            <span className="bg-[#1A2332] text-[#90A4AE] px-2 py-1 text-xs font-mono border border-[#2B3A4F]">
                              {tx.authCode || "N/A"}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-lg text-red-400">
                            ${Math.abs(tx.amount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6">
                            <div className="flex items-center justify-center gap-2">
                              <button
                                onClick={() => handleApproveReject(tx.id, "approve")}
                                className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide rounded-none flex items-center gap-1 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">check</span>
                                <span>Approve</span>
                              </button>
                              <button
                                onClick={() => handleApproveReject(tx.id, "reject")}
                                className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide rounded-none flex items-center gap-1 transition-colors"
                              >
                                <span className="material-symbols-outlined text-sm font-bold">close</span>
                                <span>Reject</span>
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* USER MANAGEMENT TAB */}
        {activeTab === "users" && (
          <div className="space-y-6 animate-fade-in">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold tracking-tight text-white">User Management</h2>
                <p className="text-sm text-[#90A4AE] mt-1">Manage user profiles, account freeze states, and credit/debit adjustments.</p>
              </div>
              <span className="bg-[#1E293B] border border-[#334155] text-white px-4 py-2 font-semibold text-sm rounded-none">
                {users.length} customers found
              </span>
            </div>

            <div className="bg-[#131924] border border-[#1C2433] rounded-none overflow-hidden">
              <table className="w-full border-collapse text-left">
                <thead>
                  <tr className="bg-[#0E131F] border-b border-[#1C2433] text-[#90A4AE] text-xs font-bold uppercase tracking-wider">
                    <th className="py-4 px-6">Customer</th>
                    <th className="py-4 px-6">Email Status</th>
                    <th className="py-4 px-6 text-right">Cash Balance</th>
                    <th className="py-4 px-6 text-right">Invested</th>
                    <th className="py-4 px-6 text-right">Total Portfolio</th>
                    <th className="py-4 px-6">Joined</th>
                    <th className="py-4 px-6 text-center">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#1C2433]">
                  {users.map((u) => {
                    const checking = u.accounts.find((a) => a.accountType === "checking")?.balance || 0;
                    const savings = u.accounts.find((a) => a.accountType === "savings")?.balance || 0;
                    const totalPortfolio = checking + savings;

                    const joinedDate = new Date(u.createdAt).toLocaleDateString("en-US", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    });

                    return (
                      <tr key={u.id} className="hover:bg-[#17202E] transition-colors font-medium">
                        <td className="py-4 px-6">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-[#af0017] text-white flex items-center justify-center font-bold text-sm rounded-none">
                              {((u.firstName?.[0] || "") + (u.lastName?.[0] || "")).toUpperCase()}
                            </div>
                            <div>
                              <p className="text-sm font-bold text-white">
                                {u.firstName} {u.lastName}
                                {u.isFrozen && (
                                  <span className="ml-2 text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 uppercase tracking-wide">
                                    Frozen
                                  </span>
                                )}
                              </p>
                              <p className="text-xs text-[#90A4AE] mt-0.5">{u.username}</p>
                            </div>
                          </div>
                        </td>
                        <td className="py-4 px-6">
                          {u.status === "Active" ? (
                            <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 border border-green-500/20 rounded-none">
                              <span className="material-symbols-outlined text-xs" style={{ fontVariationSettings: "'FILL' 1" }}>check</span>
                              <span>VERIFIED</span>
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 bg-[#af0017]/10 text-[#af0017] text-xs font-bold px-2.5 py-1 border border-[#af0017]/20 rounded-none">
                              <span className="material-symbols-outlined text-xs">warning</span>
                              <span>UNVERIFIED</span>
                            </span>
                          )}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-semibold text-sm">
                          ${checking.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-semibold text-sm text-[#448AFF]">
                          ${savings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-right font-mono font-bold text-sm">
                          ${totalPortfolio.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 px-6 text-sm text-[#90A4AE]">{joinedDate}</td>
                        <td className="py-4 px-6 text-center">
                          <button
                            onClick={() => {
                              setSelectedUserId(u.id);
                              setIsFrozenInput(u.isFrozen);
                              setFrozenReasonInput(u.frozenReason || "");
                              setAdjustSuccess("");
                              setAdjustError("");
                              setFreezeSuccess("");
                              setActiveTab("profile");
                            }}
                            className="bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white px-3 py-1.5 font-bold text-xs uppercase tracking-wide rounded-none transition-colors"
                          >
                            View Profile
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CUSTOMER PROFILE VIEW */}
        {activeTab === "profile" && selectedUser && (
          <div className="space-y-6 animate-fade-in">
            {/* Header / Back */}
            <div className="flex items-center gap-4">
              <button
                onClick={() => { setActiveTab("users"); setSelectedUserId(""); }}
                className="bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5"
              >
                <span className="material-symbols-outlined text-sm">arrow_back</span>
                <span>Back to Users</span>
              </button>
              <h2 className="text-2xl font-bold tracking-tight text-white">Customer Profile</h2>
            </div>

            {/* Profile Content split */}
            <div className="grid grid-cols-5 gap-8">
              
              {/* Left Bio + Freeze control */}
              <div className="col-span-2 space-y-6">
                
                {/* BIO CARD */}
                <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none relative">
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#af0017] text-white flex items-center justify-center font-bold text-xl rounded-none">
                      {((selectedUser.firstName?.[0] || "") + (selectedUser.lastName?.[0] || "")).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-white">{selectedUser.firstName} {selectedUser.lastName}</h3>
                      <p className="text-sm text-[#90A4AE] font-mono mt-0.5">{selectedUser.username}</p>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <div className="flex justify-between items-center py-2 border-b border-[#1C2433] text-sm">
                      <span className="text-[#90A4AE]">Date of Birth</span>
                      <span className="text-white font-semibold">{selectedUser.dob}</span>
                    </div>
                    <div className="flex justify-between items-start py-2 border-b border-[#1C2433] text-sm">
                      <span className="text-[#90A4AE] mr-4">Address</span>
                      <span className="text-white font-semibold text-right max-w-[200px] break-words">
                        {selectedUser.phone === "+61 412 345 678" ? "Melbourne, VIC" : "old manroad"}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 border-b border-[#1C2433] text-sm">
                      <span className="text-[#90A4AE]">Joined</span>
                      <span className="text-white font-semibold">
                        {new Date(selectedUser.createdAt).toLocaleDateString("en-US", {
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between items-center py-2 text-sm">
                      <span className="text-[#90A4AE]">Email Status</span>
                      <span>
                        {selectedUser.status === "Active" ? (
                          <span className="bg-green-500/10 text-green-400 text-[10px] font-bold px-2 py-0.5 border border-green-500/20 rounded-none">
                            VERIFIED
                          </span>
                        ) : (
                          <span className="bg-[#af0017]/10 text-[#af0017] text-[10px] font-bold px-2 py-0.5 border border-[#af0017]/20 rounded-none">
                            UNVERIFIED
                          </span>
                        )}
                      </span>
                    </div>
                  </div>

                  {/* ACCOUNT FREEZE WARNING IN RED COLOR */}
                  {selectedUser.isFrozen && (
                    <div className="mt-6 p-4 border border-red-500 bg-red-900/10 text-red-500 font-medium">
                      <p className="text-xs uppercase font-extrabold tracking-wider text-red-600">STATUS: ACCOUNT FROZEN</p>
                      <p className="text-sm font-bold mt-1 text-red-500 break-words">
                        Reason: {selectedUser.frozenReason || "No reason specified."}
                      </p>
                    </div>
                  )}
                </div>

                {/* FREEZE CONTROL CARD */}
                <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                  <h4 className="text-md font-bold text-white mb-4 uppercase tracking-wider">Account Freeze Control</h4>
                  
                  {freezeSuccess && (
                    <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 text-xs mb-4">
                      {freezeSuccess}
                    </div>
                  )}

                  <form onSubmit={handleToggleFreeze} className="space-y-4">
                    <label className="flex items-center gap-3 cursor-pointer bg-[#0D121B] border border-[#1C2433] p-3 text-sm select-none">
                      <input
                        type="checkbox"
                        checked={isFrozenInput}
                        onChange={(e) => setIsFrozenInput(e.target.checked)}
                        className="w-4 h-4 accent-[#af0017] cursor-pointer"
                      />
                      <span className="font-semibold text-white">Freeze Account & Block Outgoing Transactions</span>
                    </label>

                    {isFrozenInput && (
                      <div className="space-y-2">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">
                          Reason for Suspension (Display to User in Red)
                        </label>
                        <textarea
                          value={frozenReasonInput}
                          onChange={(e) => setFrozenReasonInput(e.target.value)}
                          placeholder="e.g. suspicious activity detected, compliance review"
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-medium text-sm focus:outline-none focus:border-[#af0017] min-h-[80px]"
                          required={isFrozenInput}
                        />
                      </div>
                    )}

                    <button
                      type="submit"
                      disabled={freezeLoading}
                      className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors disabled:opacity-50"
                    >
                      {freezeLoading ? "Saving Status..." : "Save Suspension Status"}
                    </button>
                  </form>
                </div>

              </div>

              {/* Right Portfolio Display + Adjustment Form */}
              <div className="col-span-3 space-y-6">
                
                {/* Balance Cards Grid */}
                {(() => {
                  const checking = selectedUser.accounts.find((a) => a.accountType === "checking")?.balance || 0;
                  const savings = selectedUser.accounts.find((a) => a.accountType === "savings")?.balance || 0;
                  const total = checking + savings;

                  return (
                    <>
                      {/* Total portfolio AUM Card */}
                      <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex justify-between items-center">
                        <div>
                          <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wider">Total Portfolio</p>
                          <p className="text-3xl font-bold text-white mt-1">
                            ${total.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                        </div>
                        <span className="material-symbols-outlined text-4xl text-[#af0017]">account_balance</span>
                      </div>

                      {/* Split available vs invested cards */}
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#131924] border border-[#1C2433] p-5 rounded-none">
                          <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Available Cash</p>
                          <p className="text-xl font-bold text-white mt-1">
                            ${checking.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-[#546E7A] mt-1">Checking balance</p>
                        </div>
                        <div className="bg-[#131924] border border-[#1C2433] p-5 rounded-none">
                          <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Invested Funds</p>
                          <p className="text-xl font-bold text-white mt-1 text-[#448AFF]">
                            ${savings.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </p>
                          <p className="text-[10px] text-[#546E7A] mt-1">Savings balance</p>
                        </div>
                      </div>
                    </>
                  );
                })()}

                {/* FUND / ADJUST BALANCE FORM */}
                <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                  <h3 className="text-md font-bold text-white uppercase tracking-wider">Fund / Adjust Account</h3>
                  <p className="text-xs text-[#90A4AE] mt-1 mb-6">
                    Credit or debit this customer's balance. A transaction record will be created.
                  </p>

                  {adjustError && (
                    <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 text-xs mb-4">
                      {adjustError}
                    </div>
                  )}

                  {adjustSuccess && (
                    <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 text-xs mb-4">
                      {adjustSuccess}
                    </div>
                  )}

                  <form onSubmit={handleExecuteAdjustment} className="space-y-4">
                    {/* Account Select */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Account</label>
                      <select
                        value={adjustAccountType}
                        onChange={(e) => setAdjustAccountType(e.target.value as any)}
                        className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none"
                      >
                        <option value="checking">Available Cash (Checking)</option>
                        <option value="savings">Invested Funds (Savings)</option>
                      </select>
                    </div>

                    {/* Action Selector Buttons */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Action</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setAdjustType("credit")}
                          className={`py-3 px-4 font-bold text-xs uppercase tracking-wide rounded-none transition-colors border ${
                            adjustType === "credit"
                              ? "bg-[#af0017] text-white border-[#af0017]"
                              : "bg-[#0D121B] text-[#90A4AE] border-[#1C2433] hover:text-white"
                          }`}
                        >
                          Credit (+)
                        </button>
                        <button
                          type="button"
                          onClick={() => setAdjustType("debit")}
                          className={`py-3 px-4 font-bold text-xs uppercase tracking-wide rounded-none transition-colors border ${
                            adjustType === "debit"
                              ? "bg-[#af0017] text-white border-[#af0017]"
                              : "bg-[#0D121B] text-[#90A4AE] border-[#1C2433] hover:text-white"
                          }`}
                        >
                          Debit (-)
                        </button>
                      </div>
                    </div>

                    {/* Method Dropdown */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Transaction Method</label>
                      <select
                        value={adjustMethod}
                        onChange={(e) => setAdjustMethod(e.target.value as any)}
                        className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none"
                      >
                        <option value="wire">Wire</option>
                        <option value="ach">ACH</option>
                        <option value="zelle">Zelle</option>
                        <option value="deposit">Mobile Deposit</option>
                        <option value="billpay">Bill Pay</option>
                      </select>
                    </div>

                    {/* Amount Input */}
                    <div className="space-y-1">
                      <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Amount (USD)</label>
                      <input
                        type="number"
                        step="0.01"
                        min="0.01"
                        value={adjustAmount}
                        onChange={(e) => setAdjustAmount(e.target.value)}
                        placeholder="0.00"
                        className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none font-mono"
                        required
                      />
                    </div>

                    {/* Custom Date & Time Overrides */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Override Date</label>
                        <input
                          type="date"
                          value={adjustDate}
                          onChange={(e) => setAdjustDate(e.target.value)}
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none font-mono"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Override Time</label>
                        <input
                          type="text"
                          value={adjustTime}
                          onChange={(e) => setAdjustTime(e.target.value)}
                          placeholder="e.g. 14:30:00"
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none font-mono"
                          required
                        />
                      </div>
                    </div>

                    {/* Submit Adjustment */}
                    <button
                      type="submit"
                      disabled={adjustLoading}
                      className="w-full bg-[#af0017] hover:bg-[#8f0013] text-white py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors mt-2 disabled:opacity-50"
                    >
                      {adjustLoading ? "Processing Adjustment..." : "Execute Adjustment"}
                    </button>
                  </form>
                </div>

              </div>

            </div>
          </div>
        )}

      </main>
    </div>
  );
}
