"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import PublicHeader from "@/components/public/Header";
import PublicFooter from "@/components/public/Footer";

export default function PendingApprovalPage() {
  const router = useRouter();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const checkStatus = React.useCallback(async (isManual = false) => {
    if (isManual) setRefreshing(true);
    try {
      const res = await fetch("/api/auth/me", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        if (data.user) {
          setUser(data.user);
          // If approved and active, automatically redirect to dashboard
          if (data.user.status === "Active") {
            router.push("/dashboard");
            return;
          }
        }
      }
    } catch (err) {
      console.error("Error checking account status:", err);
    } finally {
      setLoading(false);
      if (isManual) setRefreshing(false);
    }
  }, [router]);

  useEffect(() => {
    checkStatus(false);
    // Auto-poll status every 15 seconds in case admin approves while page is open
    const interval = setInterval(() => checkStatus(false), 15000);
    return () => clearInterval(interval);
  }, [checkStatus]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  };

  return (
    <div className="bg-background min-h-screen flex flex-col antialiased">
      <PublicHeader />

      <main className="flex-1 py-16 px-margin-mobile md:px-margin-desktop max-w-[680px] w-full mx-auto flex flex-col gap-6 justify-center">
        {/* Status Card */}
        <div className="bg-surface-container-lowest border border-surface-variant p-8 md:p-10 shadow-sm w-full">
          {/* Header Badge */}
          <div className="flex items-center justify-between border-b border-surface-variant pb-5 mb-6">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 text-amber-600 text-xs font-bold uppercase tracking-wider mb-2">
                <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                Application Status: Pending Review
              </div>
              <h1 className="font-headline-lg text-2xl font-bold text-on-background">
                Account Under Compliance Review
              </h1>
            </div>
            <span className="material-symbols-outlined text-amber-500" style={{ fontSize: "40px" }}>
              hourglass_top
            </span>
          </div>

          {/* User Information Summary */}
          {user && (
            <div className="bg-surface-container-low border border-surface-variant/60 p-4 mb-6 text-xs text-on-surface">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <span className="text-on-surface-variant uppercase tracking-wider block text-[10px]">
                    Applicant Name
                  </span>
                  <span className="font-bold text-sm">
                    {user.firstName} {user.lastName}
                  </span>
                </div>
                <div>
                  <span className="text-on-surface-variant uppercase tracking-wider block text-[10px]">
                    Registered User ID
                  </span>
                  <span className="font-bold text-sm truncate block">
                    {user.username}
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Explanation Body */}
          <div className="space-y-4 text-sm text-on-surface leading-relaxed">
            <p>
              Thank you for submitting your application to <strong>Beacon Capital Institutional Banking</strong>.
            </p>
            <p className="text-on-surface-variant text-xs">
              In accordance with federal regulatory requirements and institutional compliance mandates, all newly created accounts undergo manual verification by our compliance officers before ledger access is granted.
            </p>

            {/* Steps Visualizer */}
            <div className="border border-surface-variant p-4 bg-surface-container-lowest space-y-3 mt-4">
              <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
                Onboarding Progress
              </h3>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  ✓
                </div>
                <div>
                  <p className="font-bold text-xs">1. Application Submitted</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Your institutional application and identity details have been received securely.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-amber-500 text-white flex items-center justify-center text-xs font-bold shrink-0 mt-0.5 animate-pulse">
                  2
                </div>
                <div>
                  <p className="font-bold text-xs text-amber-600">
                    2. Administrator & Compliance Review (In Progress)
                  </p>
                  <p className="text-[11px] text-on-surface-variant">
                    Our compliance team is verifying your credentials and provisioning ledger accounts.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3 opacity-60">
                <div className="w-6 h-6 rounded-full bg-surface-variant text-on-surface-variant flex items-center justify-center text-xs font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-bold text-xs">3. Email Notification & Portal Activation</p>
                  <p className="text-[11px] text-on-surface-variant">
                    Once approved by an administrator, you will receive an official approval confirmation email, and your client portal will be activated immediately.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="mt-8 pt-6 border-t border-surface-variant flex flex-col sm:flex-row gap-3">
            <button
              onClick={() => checkStatus(true)}
              disabled={refreshing}
              className="flex-1 bg-primary text-on-primary font-bold text-xs py-3 px-4 hover:bg-primary-container transition-colors flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
            >
              <span className={`material-symbols-outlined text-base ${refreshing ? "animate-spin" : ""}`}>
                refresh
              </span>
              {refreshing ? "Checking Status..." : "Refresh Approval Status"}
            </button>

            <button
              onClick={handleLogout}
              className="px-4 py-3 border border-surface-variant text-xs font-bold text-on-surface hover:bg-surface-container-low transition-colors"
            >
              Log Out
            </button>
          </div>
        </div>

        {/* Support Inquiries */}
        <div className="text-center space-y-1 text-xs text-on-surface-variant">
          <p>
            Have urgent inquiries regarding your institutional application?
          </p>
          <p>
            Contact Compliance at{" "}
            <a href="mailto:support@mail.beaconcapital.site" className="text-primary font-bold hover:underline">
              support@mail.beaconcapital.site
            </a>
          </p>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
}
