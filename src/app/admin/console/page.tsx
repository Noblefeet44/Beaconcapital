"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Freeze form states
  const [isFrozenInput, setIsFrozenInput] = useState(false);
  const [frozenReasonInput, setFrozenReasonInput] = useState("");
  const [freezeLoading, setFreezeLoading] = useState(false);
  const [freezeSuccess, setFreezeSuccess] = useState("");

  // Balance adjustment states
  const [adjustAccountId, setAdjustAccountId] = useState<string>("");
  const [adjustType, setAdjustType] = useState<"credit" | "debit">("credit");
  const [adjustMethod, setAdjustMethod] = useState<"wire" | "ach" | "zelle" | "deposit" | "billpay">("wire");
  const [adjustAmount, setAdjustAmount] = useState("");
  const [adjustReference, setAdjustReference] = useState("");
  const [adjustDate, setAdjustDate] = useState("");
  const [adjustTime, setAdjustTime] = useState("");
  const [adjustLoading, setAdjustLoading] = useState(false);
  const [adjustError, setAdjustError] = useState("");
  const [adjustSuccess, setAdjustSuccess] = useState("");

  // Edit user profile states
  const [editFirstName, setEditFirstName] = useState("");
  const [editLastName, setEditLastName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [editLoading, setEditLoading] = useState(false);
  const [editSuccess, setEditSuccess] = useState("");
  const [editError, setEditError] = useState("");

  // User search
  const [userSearch, setUserSearch] = useState("");

  const fetchData = async () => {
    try {
      const profileRes = await fetch("/api/auth/me", { cache: "no-store" });
      if (!profileRes.ok) { router.push("/admin"); return; }
      const profileData = await profileRes.json();
      if (profileData.user.role !== "admin") { router.push("/dashboard"); return; }
      setAdmin(profileData.user);

      const usersRes = await fetch("/api/admin/users", { cache: "no-store" });
      if (usersRes.ok) {
        const usersData = await usersRes.json();
        setUsers(usersData.users);
      }

      const txRes = await fetch("/api/transactions", { cache: "no-store" });
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
    const today = new Date().toISOString().split("T")[0];
    setAdjustDate(today);
    setAdjustTime(new Date().toLocaleTimeString("en-US", { hour12: false }));
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/admin");
    router.refresh();
  };

  const handleToggleFreeze = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedUserId) return;
    setFreezeLoading(true);
    setFreezeSuccess("");
    try {
      const res = await fetch("/api/admin/users/freeze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: selectedUserId, isFrozen: isFrozenInput, frozenReason: isFrozenInput ? frozenReasonInput : "" }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to update freeze status");
      setFreezeSuccess("Account freeze status updated successfully.");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    } finally {
      setFreezeLoading(false);
    }
  };

  const handleExecuteAdjustment = async (e: React.FormEvent) => {
    e.preventDefault();
    setAdjustError("");
    setAdjustSuccess("");
    const targetUser = users.find((u) => u.id === selectedUserId);
    if (!targetUser) { setAdjustError("No customer selected."); return; }

    const accountToAdjust = adjustAccountId
      ? targetUser.accounts.find((a) => a.id === adjustAccountId)
      : targetUser.accounts[0];
    if (!accountToAdjust) { setAdjustError("Account not found."); return; }

    const amt = parseFloat(adjustAmount);
    if (isNaN(amt) || amt <= 0) { setAdjustError("Please enter a valid amount."); return; }
    setAdjustLoading(true);
    try {
      const res = await fetch("/api/admin/adjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          accountId: accountToAdjust.id,
          type: adjustType,
          method: adjustMethod,
          amount: amt,
          effectiveDate: adjustDate,
          customTime: adjustTime,
          reference: adjustReference,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Adjustment failed");
      setAdjustSuccess("Balance adjusted successfully!");
      setAdjustAmount("");
      setAdjustReference("");
      await fetchData();
    } catch (err: any) {
      setAdjustError(err.message || "An unexpected error occurred");
    } finally {
      setAdjustLoading(false);
    }
  };

  const handleApproveReject = async (transactionId: string, action: "approve" | "reject") => {
    try {
      const res = await fetch("/api/admin/approve", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transactionId, action }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Approval action failed");
      await fetchData();
    } catch (err: any) {
      alert(err.message || "An error occurred");
    }
  };

  const navigateTo = (tab: TabType) => {
    setActiveTab(tab);
    setSelectedUserId("");
    setSidebarOpen(false);
  };

  const openUserProfile = (user: UserWithAccounts) => {
    setSelectedUserId(user.id);
    setIsFrozenInput(user.isFrozen);
    setFrozenReasonInput(user.frozenReason || "");
    setEditFirstName(user.firstName);
    setEditLastName(user.lastName);
    setEditPhone(user.phone);
    setAdjustAccountId(user.accounts[0]?.id || "");
    setAdjustReference("");
    setAdjustSuccess("");
    setAdjustError("");
    setFreezeSuccess("");
    setEditSuccess("");
    setEditError("");
    setActiveTab("profile");
    setSidebarOpen(false);
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

  const totalCustomers = users.length;
  const pendingTransactions = allTransactions.filter((t) => t.status === "Pending" && t.title !== "Wire Transfer Fee");
  const pendingApprovalsCount = pendingTransactions.length;
  const totalCash = users.reduce((sum, u) => sum + (u.accounts.find((a) => a.accountType === "checking")?.balance || 0), 0);
  const totalInvested = users.reduce((sum, u) => sum + (u.accounts.find((a) => a.accountType === "savings")?.balance || 0), 0);
  const totalAUM = totalCash + totalInvested;
  const todayStr = new Date().toISOString().split("T")[0];
  const todayVolume = allTransactions.filter((t) => t.status === "Settled" && t.effectiveDate === todayStr).reduce((sum, t) => sum + Math.abs(t.amount), 0);
  const selectedUser = users.find((u) => u.id === selectedUserId);
  const filteredUsers = users.filter((u) =>
    userSearch === "" ||
    `${u.firstName} ${u.lastName}`.toLowerCase().includes(userSearch.toLowerCase()) ||
    u.username.toLowerCase().includes(userSearch.toLowerCase())
  );

  const fmt = (n: number) => n.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const SidebarContent = () => (
    <>
      <div>
        <div className="p-6 border-b border-[#1C2433]">
          <h1 className="text-xl font-bold text-white tracking-wide uppercase">Admin Console</h1>
          <p className="text-xs text-[#af0017] font-semibold mt-1 tracking-widest uppercase">Beacon Capital</p>
        </div>
        <div className="py-6 px-4 space-y-1">
          <p className="text-[#546E7A] text-[10px] uppercase font-bold tracking-wider px-3 mb-3">Operations</p>
          {([
            { tab: "overview" as TabType, icon: "dashboard", label: "Overview" },
            { tab: "pending" as TabType, icon: "hourglass_empty", label: "Pending Transfers", badge: pendingApprovalsCount },
            { tab: "users" as TabType, icon: "group", label: "User Management", badge: totalCustomers },
          ]).map(({ tab, icon, label, badge }) => (
            <button
              key={tab}
              onClick={() => navigateTo(tab)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-none transition-colors duration-150 text-left font-semibold ${
                activeTab === tab || (tab === "users" && activeTab === "profile")
                  ? "bg-[#182235] text-[#af0017] border-l-4 border-[#af0017]"
                  : "text-[#90A4AE] hover:bg-[#131924] hover:text-white"
              }`}
            >
              <span className="material-symbols-outlined">{icon}</span>
              <span className="flex-1">{label}</span>
              {badge !== undefined && badge > 0 && (
                <span className="bg-[#af0017] text-white px-1.5 py-0.5 text-xs font-bold font-mono rounded-none">{badge}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      <div className="p-4 border-t border-[#1C2433] bg-[#0A0D15]">
        <div className="flex items-center gap-3 mb-4 px-2">
          <div className="w-10 h-10 bg-[#af0017]/20 flex items-center justify-center text-[#af0017] font-bold text-lg rounded-none">
            {(admin?.firstName?.[0] || "A").toUpperCase()}
          </div>
          <div>
            <p className="text-sm font-semibold text-white">{admin?.firstName || "Admin"}</p>
            <span className="text-[10px] bg-[#af0017] text-white font-bold px-1.5 py-0.5 uppercase tracking-wide">Admin</span>
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
    </>
  );

  return (
    <div className="flex h-screen overflow-hidden bg-[#0B0E14] text-white font-sans antialiased">

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-40 bg-black/60 md:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar — Desktop fixed, Mobile slide-in */}
      <nav className={`
        fixed md:static inset-y-0 left-0 z-50 w-72 border-r border-[#1C2433] bg-[#0E131F] flex flex-col justify-between
        transform transition-transform duration-300 ease-in-out
        ${sidebarOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
      `}>
        <SidebarContent />
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Mobile Top Bar */}
        <header className="md:hidden flex items-center gap-4 bg-[#0E131F] border-b border-[#1C2433] px-4 py-3 z-30">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-[#90A4AE] hover:text-white transition-colors"
            aria-label="Open menu"
          >
            <span className="material-symbols-outlined text-2xl">menu</span>
          </button>
          <h1 className="text-base font-bold text-white uppercase tracking-wide flex-1">Admin Console</h1>
          {pendingApprovalsCount > 0 && (
            <span className="bg-[#af0017] text-white px-2 py-0.5 text-xs font-bold rounded-none">{pendingApprovalsCount}</span>
          )}
        </header>

        <main className="flex-1 overflow-y-auto bg-[#0B0E14] p-4 md:p-8">

          {/* OVERVIEW TAB */}
          {activeTab === "overview" && (
            <div className="space-y-6 md:space-y-8">
              <div>
                <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Overview</h2>
                <p className="text-sm text-[#90A4AE] mt-1">Real-time status of Beacon Capital platform assets and operations.</p>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
                {[
                  { icon: "people", color: "blue", label: "Total Customers", value: totalCustomers, sub: "Registered accounts" },
                  { icon: "hourglass_empty", color: "red", label: "Pending Approvals", value: pendingApprovalsCount, sub: "Transfers awaiting action" },
                  { icon: "payments", color: "green", label: "Total AUM", value: `$${fmt(totalAUM)}`, sub: "Assets under management" },
                  { icon: "show_chart", color: "gray", label: "Today's Volume", value: `$${fmt(todayVolume)}`, sub: "Settled today" },
                ].map(({ icon, color, label, value, sub }) => (
                  <div key={label} className="bg-[#131924] border border-[#1C2433] p-4 md:p-6 rounded-none flex items-center gap-3 md:gap-4">
                    <div className={`w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-none ${
                      color === "blue" ? "bg-blue-500/10 text-blue-400" :
                      color === "red" ? "bg-[#af0017]/10 text-[#af0017]" :
                      color === "green" ? "bg-green-500/10 text-green-400" :
                      "bg-[#90A4AE]/10 text-[#90A4AE]"
                    }`}>
                      <span className="material-symbols-outlined text-2xl md:text-3xl">{icon}</span>
                    </div>
                    <div className="min-w-0">
                      <p className="text-[10px] text-[#90A4AE] uppercase font-bold tracking-wide leading-tight">{label}</p>
                      <p className="text-lg md:text-2xl font-bold text-white mt-0.5 truncate">{value}</p>
                      <p className="text-[10px] text-[#546E7A] mt-0.5 hidden md:block">{sub}</p>
                    </div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                <div className="md:col-span-2 bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                  <h3 className="text-lg font-bold text-white mb-6 uppercase tracking-wider">Portfolio Breakdown</h3>
                  <div className="space-y-4">
                    {[
                      { label: "Total Available Cash", value: `$${fmt(totalCash)}`, color: "text-[#af0017]" },
                      { label: "Total Invested Funds", value: `$${fmt(totalInvested)}`, color: "text-[#448AFF]" },
                      { label: "Total AUM", value: `$${fmt(totalAUM)}`, color: "text-green-400" },
                    ].map(({ label, value, color }) => (
                      <div key={label} className="flex justify-between items-center py-3 border-b border-[#1C2433] last:border-0">
                        <span className="text-[#90A4AE] text-sm font-semibold">{label}</span>
                        <span className={`${color} font-mono font-bold text-lg`}>{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
                <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none flex flex-col justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-white mb-3 uppercase tracking-wider">Quick Actions</h3>
                    <p className="text-sm text-[#90A4AE]">Fast links to manage clients and resolve pending wires.</p>
                  </div>
                  <div className="space-y-3 mt-6">
                    <button onClick={() => setActiveTab("pending")} className="w-full bg-[#af0017] text-white hover:bg-[#8f0013] py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">hourglass_empty</span>
                      <span>Pending ({pendingApprovalsCount})</span>
                    </button>
                    <button onClick={() => setActiveTab("users")} className="w-full bg-[#1E293B] text-white hover:bg-[#2D3F59] py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none border border-[#334155] transition-colors flex items-center justify-center gap-2">
                      <span className="material-symbols-outlined text-sm">group</span>
                      <span>User Management ({totalCustomers})</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* PENDING TRANSFERS TAB */}
          {activeTab === "pending" && (
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Pending Transfers</h2>
                  <p className="text-sm text-[#90A4AE] mt-1">Review, approve or reject client-initiated transactions.</p>
                </div>
                <span className="self-start sm:self-auto bg-[#1E293B] border border-[#334155] text-white px-4 py-2 font-semibold text-sm rounded-none">
                  {pendingApprovalsCount} pending
                </span>
              </div>
              {pendingTransactions.length === 0 ? (
                <div className="bg-[#131924] border border-[#1C2433] p-12 text-center rounded-none">
                  <span className="material-symbols-outlined text-[64px] text-[#546E7A]">check_circle</span>
                  <h3 className="text-lg font-bold text-white mt-4">Zero Pending Transfers</h3>
                  <p className="text-sm text-[#90A4AE] mt-2">All transactions have been processed and settled.</p>
                </div>
              ) : (
                <div className="bg-[#131924] border border-[#1C2433] rounded-none overflow-x-auto">
                  <table className="w-full border-collapse text-left min-w-[640px]">
                    <thead>
                      <tr className="bg-[#0E131F] border-b border-[#1C2433] text-[#90A4AE] text-xs font-bold uppercase tracking-wider">
                        <th className="py-4 px-4">Date</th>
                        <th className="py-4 px-4">Customer</th>
                        <th className="py-4 px-4">Details</th>
                        <th className="py-4 px-4">Ref</th>
                        <th className="py-4 px-4 text-right">Amount</th>
                        <th className="py-4 px-4 text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#1C2433]">
                      {pendingTransactions.map((tx) => {
                        const owner = users.find((u) => u.accounts.some((a) => a.id === tx.accountId));
                        return (
                          <tr key={tx.id} className="hover:bg-[#17202E] transition-colors">
                            <td className="py-4 px-4 text-sm text-[#90A4AE] whitespace-nowrap">
                              {new Date(tx.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                            </td>
                            <td className="py-4 px-4">
                              <p className="text-sm font-bold text-white">{owner ? `${owner.firstName} ${owner.lastName}` : "Unknown"}</p>
                              <p className="text-xs text-[#90A4AE]">{owner?.username || "unknown"}</p>
                            </td>
                            <td className="py-4 px-4 text-sm text-[#E0E0E0] font-mono max-w-[200px] truncate">
                              {tx.recipientDetails || tx.description || "N/A"}
                            </td>
                            <td className="py-4 px-4">
                              <span className="bg-[#1A2332] text-[#90A4AE] px-2 py-1 text-xs font-mono border border-[#2B3A4F]">
                                {tx.authCode || "N/A"}
                              </span>
                            </td>
                            <td className="py-4 px-4 text-right font-mono font-bold text-red-400 whitespace-nowrap">
                              ${fmt(Math.abs(tx.amount))}
                            </td>
                            <td className="py-4 px-4">
                              <div className="flex items-center justify-center gap-2">
                                <button onClick={() => handleApproveReject(tx.id, "approve")} className="bg-[#2E7D32] hover:bg-[#1B5E20] text-white px-3 py-1.5 font-bold text-xs uppercase rounded-none flex items-center gap-1 transition-colors">
                                  <span className="material-symbols-outlined text-sm">check</span>
                                  <span className="hidden sm:inline">Approve</span>
                                </button>
                                <button onClick={() => handleApproveReject(tx.id, "reject")} className="bg-[#C62828] hover:bg-[#B71C1C] text-white px-3 py-1.5 font-bold text-xs uppercase rounded-none flex items-center gap-1 transition-colors">
                                  <span className="material-symbols-outlined text-sm">close</span>
                                  <span className="hidden sm:inline">Reject</span>
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
            <div className="space-y-6">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">User Management</h2>
                  <p className="text-sm text-[#90A4AE] mt-1">Click "Edit" to manage individual accounts, balances, and freeze status.</p>
                </div>
                <span className="self-start sm:self-auto bg-[#1E293B] border border-[#334155] text-white px-4 py-2 font-semibold text-sm rounded-none">
                  {users.length} customers
                </span>
              </div>

              {/* Search */}
              <div className="relative">
                <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[#546E7A] text-xl">search</span>
                <input
                  type="text"
                  value={userSearch}
                  onChange={(e) => setUserSearch(e.target.value)}
                  placeholder="Search by name or email..."
                  className="w-full bg-[#131924] border border-[#1C2433] text-white pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-[#af0017] rounded-none"
                />
              </div>

              {/* User cards — mobile friendly */}
              <div className="space-y-3 md:hidden">
                {filteredUsers.map((u) => {
                  const checking = u.accounts.find((a) => a.accountType === "checking")?.balance || 0;
                  const savings = u.accounts.find((a) => a.accountType === "savings")?.balance || 0;
                  return (
                    <div key={u.id} className="bg-[#131924] border border-[#1C2433] p-4 rounded-none">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 bg-[#af0017] text-white flex items-center justify-center font-bold text-sm rounded-none">
                            {((u.firstName?.[0] || "") + (u.lastName?.[0] || "")).toUpperCase()}
                          </div>
                          <div>
                            <p className="text-sm font-bold text-white">
                              {u.firstName} {u.lastName}
                              {u.isFrozen && <span className="ml-2 text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 uppercase">Frozen</span>}
                            </p>
                            <p className="text-xs text-[#90A4AE]">{u.username}</p>
                          </div>
                        </div>
                        <button onClick={() => openUserProfile(u)} className="bg-[#af0017] hover:bg-[#8f0013] text-white px-3 py-1.5 font-bold text-xs uppercase rounded-none transition-colors">
                          Edit
                        </button>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3 pt-3 border-t border-[#1C2433]">
                        <div>
                          <p className="text-[10px] text-[#546E7A] uppercase font-bold">Checking</p>
                          <p className="text-sm font-mono font-bold text-white">${fmt(checking)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-[#546E7A] uppercase font-bold">Savings</p>
                          <p className="text-sm font-mono font-bold text-[#448AFF]">${fmt(savings)}</p>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* User table — desktop */}
              <div className="hidden md:block bg-[#131924] border border-[#1C2433] rounded-none overflow-x-auto">
                <table className="w-full border-collapse text-left">
                  <thead>
                    <tr className="bg-[#0E131F] border-b border-[#1C2433] text-[#90A4AE] text-xs font-bold uppercase tracking-wider">
                      <th className="py-4 px-6">Customer</th>
                      <th className="py-4 px-6">Status</th>
                      <th className="py-4 px-6 text-right">Checking</th>
                      <th className="py-4 px-6 text-right">Savings</th>
                      <th className="py-4 px-6 text-right">Total</th>
                      <th className="py-4 px-6">Joined</th>
                      <th className="py-4 px-6 text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#1C2433]">
                    {filteredUsers.map((u) => {
                      const checking = u.accounts.find((a) => a.accountType === "checking")?.balance || 0;
                      const savings = u.accounts.find((a) => a.accountType === "savings")?.balance || 0;
                      return (
                        <tr key={u.id} className="hover:bg-[#17202E] transition-colors">
                          <td className="py-4 px-6">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 bg-[#af0017] text-white flex items-center justify-center font-bold text-sm rounded-none">
                                {((u.firstName?.[0] || "") + (u.lastName?.[0] || "")).toUpperCase()}
                              </div>
                              <div>
                                <p className="text-sm font-bold text-white">
                                  {u.firstName} {u.lastName}
                                  {u.isFrozen && <span className="ml-2 text-[9px] bg-red-600 text-white font-extrabold px-1.5 py-0.5 uppercase">Frozen</span>}
                                </p>
                                <p className="text-xs text-[#90A4AE]">{u.username}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-6">
                            {u.status === "Active" ? (
                              <span className="inline-flex items-center gap-1 bg-green-500/10 text-green-400 text-xs font-bold px-2.5 py-1 border border-green-500/20 rounded-none">
                                <span className="material-symbols-outlined text-xs">check</span> VERIFIED
                              </span>
                            ) : (
                              <span className="inline-flex items-center gap-1 bg-[#af0017]/10 text-[#af0017] text-xs font-bold px-2.5 py-1 border border-[#af0017]/20 rounded-none">
                                <span className="material-symbols-outlined text-xs">warning</span> PENDING
                              </span>
                            )}
                          </td>
                          <td className="py-4 px-6 text-right font-mono font-semibold text-sm">${fmt(checking)}</td>
                          <td className="py-4 px-6 text-right font-mono font-semibold text-sm text-[#448AFF]">${fmt(savings)}</td>
                          <td className="py-4 px-6 text-right font-mono font-bold text-sm">${fmt(checking + savings)}</td>
                          <td className="py-4 px-6 text-sm text-[#90A4AE]">
                            {new Date(u.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "short", year: "numeric" })}
                          </td>
                          <td className="py-4 px-6 text-center">
                            <button
                              onClick={() => openUserProfile(u)}
                              className="bg-[#af0017] hover:bg-[#8f0013] text-white px-4 py-1.5 font-bold text-xs uppercase tracking-wide rounded-none transition-colors flex items-center gap-1.5 mx-auto"
                            >
                              <span className="material-symbols-outlined text-sm">edit</span>
                              <span>Edit Account</span>
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

          {/* CUSTOMER PROFILE / EDIT TAB */}
          {activeTab === "profile" && selectedUser && (
            <div className="space-y-6">
              {/* Header */}
              <div className="flex items-center gap-4">
                <button
                  onClick={() => { setActiveTab("users"); setSelectedUserId(""); }}
                  className="bg-[#1E293B] hover:bg-[#334155] border border-[#334155] text-white px-4 py-2 font-bold text-xs uppercase tracking-wider rounded-none transition-colors flex items-center gap-1.5"
                >
                  <span className="material-symbols-outlined text-sm">arrow_back</span>
                  <span>Back</span>
                </button>
                <div>
                  <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">Edit Account</h2>
                  <p className="text-xs text-[#90A4AE] mt-0.5">{selectedUser.firstName} {selectedUser.lastName} · {selectedUser.username}</p>
                </div>
              </div>

              {/* Account Balance Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                {(() => {
                  const checking = selectedUser.accounts.find((a) => a.accountType === "checking")?.balance || 0;
                  const savings = selectedUser.accounts.find((a) => a.accountType === "savings")?.balance || 0;
                  return (
                    <>
                      <div className="bg-[#131924] border border-[#1C2433] p-5 rounded-none">
                        <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Checking Balance</p>
                        <p className="text-2xl font-bold text-white mt-1">${fmt(checking)}</p>
                        <p className="text-[10px] text-[#546E7A] mt-1">Premier Checking</p>
                      </div>
                      <div className="bg-[#131924] border border-[#1C2433] p-5 rounded-none">
                        <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Savings Balance</p>
                        <p className="text-2xl font-bold text-[#448AFF] mt-1">${fmt(savings)}</p>
                        <p className="text-[10px] text-[#546E7A] mt-1">High-Yield Savings</p>
                      </div>
                      <div className="bg-[#131924] border border-[#1C2433] p-5 rounded-none">
                        <p className="text-xs text-[#90A4AE] uppercase font-bold tracking-wide">Total Portfolio</p>
                        <p className="text-2xl font-bold text-green-400 mt-1">${fmt(checking + savings)}</p>
                        <p className="text-[10px] text-[#546E7A] mt-1">Combined AUM</p>
                      </div>
                    </>
                  );
                })()}
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                {/* LEFT: Balance Adjustment */}
                <div className="space-y-6">
                  <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Adjust Account Balance</h3>
                    <p className="text-xs text-[#90A4AE] mb-5">Credit or debit any account. A transaction record is always created.</p>

                    {adjustError && <div className="bg-red-500/10 border border-red-500 text-red-400 p-3 text-xs mb-4">{adjustError}</div>}
                    {adjustSuccess && <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 text-xs mb-4">{adjustSuccess}</div>}

                    <form onSubmit={handleExecuteAdjustment} className="space-y-4">
                      {/* Account selector */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Target Account</label>
                        <select
                          value={adjustAccountId}
                          onChange={(e) => setAdjustAccountId(e.target.value)}
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none"
                        >
                          {selectedUser.accounts.map((a) => (
                            <option key={a.id} value={a.id}>
                              {a.accountName} (*{a.accountNumber.slice(-4)}) — ${fmt(a.balance)}
                            </option>
                          ))}
                        </select>
                      </div>

                      {/* Credit / Debit toggle */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Action</label>
                        <div className="grid grid-cols-2 gap-3">
                          {(["credit", "debit"] as const).map((t) => (
                            <button
                              key={t}
                              type="button"
                              onClick={() => setAdjustType(t)}
                              className={`py-3 px-4 font-bold text-xs uppercase tracking-wide rounded-none transition-colors border ${
                                adjustType === t ? "bg-[#af0017] text-white border-[#af0017]" : "bg-[#0D121B] text-[#90A4AE] border-[#1C2433] hover:text-white"
                              }`}
                            >
                              {t === "credit" ? "Credit (+)" : "Debit (-)"}
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Method */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Method</label>
                        <select
                          value={adjustMethod}
                          onChange={(e) => setAdjustMethod(e.target.value as any)}
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none"
                        >
                          <option value="wire">Wire Transfer</option>
                          <option value="ach">ACH Transfer</option>
                          <option value="zelle">Zelle</option>
                          <option value="deposit">Mobile Deposit</option>
                          <option value="billpay">Bill Pay</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Amount (USD)</label>
                        <input
                          type="number" step="0.01" min="0.01"
                          value={adjustAmount}
                          onChange={(e) => setAdjustAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none font-mono"
                          required
                        />
                      </div>

                      {/* Reference */}
                      <div className="space-y-1">
                        <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Reference / Memo</label>
                        <input
                          type="text"
                          value={adjustReference}
                          onChange={(e) => setAdjustReference(e.target.value)}
                          placeholder="e.g. REF-1002-TX"
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 font-semibold text-sm focus:outline-none focus:border-[#af0017] rounded-none font-mono"
                        />
                      </div>

                      {/* Date & Time */}
                      <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Date</label>
                          <input type="date" value={adjustDate} onChange={(e) => setAdjustDate(e.target.value)}
                            className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 text-sm focus:outline-none focus:border-[#af0017] rounded-none" required />
                        </div>
                        <div className="space-y-1">
                          <label className="block text-xs font-bold text-[#90A4AE] uppercase tracking-wide">Time</label>
                          <input type="text" value={adjustTime} onChange={(e) => setAdjustTime(e.target.value)} placeholder="14:30:00"
                            className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 text-sm focus:outline-none focus:border-[#af0017] rounded-none font-mono" required />
                        </div>
                      </div>

                      <button type="submit" disabled={adjustLoading}
                        className="w-full bg-[#af0017] hover:bg-[#8f0013] text-white py-3 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors mt-2 disabled:opacity-50">
                        {adjustLoading ? "Processing..." : "Execute Adjustment"}
                      </button>
                    </form>
                  </div>
                </div>

                {/* RIGHT: Freeze Control + Profile Info */}
                <div className="space-y-6">

                  {/* Freeze Control */}
                  <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                    <h4 className="text-sm font-bold text-white mb-1 uppercase tracking-wider">Account Freeze Control</h4>
                    <p className="text-xs text-[#90A4AE] mb-5">Freeze the account to block all outgoing transactions.</p>

                    {freezeSuccess && <div className="bg-green-500/10 border border-green-500 text-green-400 p-3 text-xs mb-4">{freezeSuccess}</div>}

                    {selectedUser.isFrozen && (
                      <div className="p-3 border border-red-500 bg-red-900/10 text-red-500 mb-4">
                        <p className="text-xs uppercase font-extrabold tracking-wider text-red-600">Status: Account Frozen</p>
                        <p className="text-sm font-bold mt-1 break-words">Reason: {selectedUser.frozenReason || "No reason specified."}</p>
                      </div>
                    )}

                    <form onSubmit={handleToggleFreeze} className="space-y-4">
                      <label className="flex items-center gap-3 cursor-pointer bg-[#0D121B] border border-[#1C2433] p-3 text-sm select-none">
                        <input type="checkbox" checked={isFrozenInput} onChange={(e) => setIsFrozenInput(e.target.checked)} className="w-4 h-4 accent-[#af0017]" />
                        <span className="font-semibold text-white">Freeze Account & Block Outgoing Transactions</span>
                      </label>
                      {isFrozenInput && (
                        <textarea
                          value={frozenReasonInput}
                          onChange={(e) => setFrozenReasonInput(e.target.value)}
                          placeholder="Reason for suspension (displayed to user)..."
                          className="w-full bg-[#0D121B] border border-[#1C2433] text-white p-3 text-sm focus:outline-none focus:border-[#af0017] min-h-[80px] rounded-none"
                          required={isFrozenInput}
                        />
                      )}
                      <button type="submit" disabled={freezeLoading}
                        className="w-full bg-[#E53935] hover:bg-[#D32F2F] text-white py-2.5 px-4 font-bold text-xs uppercase tracking-wider rounded-none transition-colors disabled:opacity-50">
                        {freezeLoading ? "Saving..." : "Save Freeze Status"}
                      </button>
                    </form>
                  </div>

                  {/* Profile Info Card */}
                  <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none">
                    <h4 className="text-sm font-bold text-white mb-5 uppercase tracking-wider">Account Information</h4>
                    <div className="space-y-3">
                      {[
                        { label: "Full Name", value: `${selectedUser.firstName} ${selectedUser.lastName}` },
                        { label: "Username / Email", value: selectedUser.username },
                        { label: "Phone", value: selectedUser.phone || "—" },
                        { label: "Date of Birth", value: selectedUser.dob || "—" },
                        { label: "ID Type", value: selectedUser.idType || "—" },
                        { label: "ID Number", value: selectedUser.idNumber || "—" },
                        { label: "Account Status", value: selectedUser.status },
                        { label: "Role", value: selectedUser.role },
                        { label: "Member Since", value: new Date(selectedUser.createdAt).toLocaleDateString("en-US", { day: "numeric", month: "long", year: "numeric" }) },
                      ].map(({ label, value }) => (
                        <div key={label} className="flex justify-between items-start py-2 border-b border-[#1C2433] last:border-0 text-sm gap-4">
                          <span className="text-[#90A4AE] font-semibold shrink-0">{label}</span>
                          <span className="text-white text-right break-all">{value}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                </div>
              </div>

              {/* Customer Transaction History */}
              <div className="bg-[#131924] border border-[#1C2433] p-6 rounded-none mt-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-1">Customer Transaction History</h3>
                <p className="text-xs text-[#90A4AE] mb-5">History of all credits, debits, and transfers for this customer's checking and savings accounts.</p>

                {(() => {
                  const customerTxs = allTransactions.filter((tx) =>
                    selectedUser.accounts.some((a) => a.id === tx.accountId)
                  );

                  if (customerTxs.length === 0) {
                    return (
                      <div className="text-center py-6 text-sm text-[#90A4AE]">
                        No transaction history found for this customer.
                      </div>
                    );
                  }

                  return (
                    <div className="overflow-x-auto">
                      <table className="w-full border-collapse text-left min-w-[640px]">
                        <thead>
                          <tr className="bg-[#0E131F] border-b border-[#1C2433] text-[#90A4AE] text-xs font-bold uppercase tracking-wider">
                            <th className="py-4 px-4">Date</th>
                            <th className="py-4 px-4">Account</th>
                            <th className="py-4 px-4">Details</th>
                            <th className="py-4 px-4">Ref</th>
                            <th className="py-4 px-4 text-center">Status</th>
                            <th className="py-4 px-4 text-right">Amount</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-[#1C2433] text-sm text-[#E0E0E0]">
                          {customerTxs.map((tx) => {
                            const account = selectedUser.accounts.find((a) => a.id === tx.accountId);
                            const isNegative = tx.amount < 0;
                            return (
                              <tr key={tx.id} className="hover:bg-[#17202E] transition-colors">
                                <td className="py-4 px-4 whitespace-nowrap">
                                  {tx.effectiveDate}
                                </td>
                                <td className="py-4 px-4 uppercase tracking-wider text-xs font-semibold whitespace-nowrap">
                                  {account ? `${account.accountName} (*${account.accountNumber.slice(-4)})` : "Unknown"}
                                </td>
                                <td className="py-4 px-4">
                                  <p className="font-bold text-white">{tx.title}</p>
                                  <p className="text-xs text-[#90A4AE] mt-0.5">{tx.description}</p>
                                </td>
                                <td className="py-4 px-4 font-mono text-xs">
                                  {tx.authCode ? (
                                    <span className="bg-[#1A2332] text-[#90A4AE] px-2 py-1 border border-[#2B3A4F]">
                                      {tx.authCode}
                                    </span>
                                  ) : (
                                    <span className="text-[#546E7A]">—</span>
                                  )}
                                </td>
                                <td className="py-4 px-4 text-center whitespace-nowrap">
                                  <span className={`inline-block w-2 h-2 rounded-full mr-2 ${tx.status === "Settled" ? "bg-[#2E7D32]" : "bg-yellow-500"}`} />
                                  <span className={tx.status === "Settled" ? "text-green-400 font-bold text-xs uppercase" : "text-yellow-500 font-bold text-xs uppercase"}>
                                    {tx.status}
                                  </span>
                                </td>
                                <td className={`py-4 px-4 text-right font-mono font-bold whitespace-nowrap ${isNegative ? "text-red-400" : "text-green-400"}`}>
                                  {isNegative ? "-" : "+"}${fmt(Math.abs(tx.amount))}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  );
                })()}
              </div>

            </div>
          )}

        </main>
      </div>
    </div>
  );
}
