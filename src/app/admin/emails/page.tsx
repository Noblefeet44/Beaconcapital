"use client";

import React, { useState } from "react";

interface TemplateOption {
  key: string;
  name: string;
  category: "Auth & Onboarding" | "Payments & Transfers" | "Deposits" | "Billing" | "Security" | "Admin Alerts";
  subject: string;
  sender: string;
}

const TEMPLATES: TemplateOption[] = [
  // Auth & Onboarding
  { key: "welcome_verification", name: "Welcome Verification Link", category: "Auth & Onboarding", subject: "Welcome to Beacon Capital - Verify Email", sender: "no-reply@mail.beaconcapital.site" },
  { key: "application_submitted", name: "Application Submitted", category: "Auth & Onboarding", subject: "Application Under Review - Beacon Capital", sender: "support@mail.beaconcapital.site" },
  { key: "application_approved", name: "Application Approved", category: "Auth & Onboarding", subject: "Your Beacon Capital Account Has Been Approved!", sender: "support@mail.beaconcapital.site" },
  { key: "application_rejected", name: "Application Declined", category: "Auth & Onboarding", subject: "Update Regarding Application Status", sender: "support@mail.beaconcapital.site" },

  // Payments & Transfers
  { key: "transfer_initiated", name: "ACH / Wire Transfer Submitted", category: "Payments & Transfers", subject: "Wire Transfer Confirmation - Ref: TXN-9418-P", sender: "payments@mail.beaconcapital.site" },
  { key: "transfer_received", name: "Transfer Received (Recipient Notice)", category: "Payments & Transfers", subject: "Alex Mercer sent you $350.00 - Ref: TXN-9418-P", sender: "payments@mail.beaconcapital.site" },
  { key: "transfer_settled", name: "Transfer Settled & Cleared", category: "Payments & Transfers", subject: "Transfer Completed - Ref: TXN-9418-P", sender: "payments@mail.beaconcapital.site" },
  { key: "transfer_rejected", name: "Transfer Declined / Returned", category: "Payments & Transfers", subject: "Transfer Declined - Ref: TXN-9418-P", sender: "payments@mail.beaconcapital.site" },
  { key: "zelle_initiated", name: "Zelle Transfer Receipt", category: "Payments & Transfers", subject: "Zelle Transfer Confirmation - Ref: ZEL-4019-P", sender: "payments@mail.beaconcapital.site" },
  { key: "billpay_initiated", name: "Bill Payment Receipt", category: "Payments & Transfers", subject: "Bill Payment Confirmation - Ref: BPY-8812-P", sender: "payments@mail.beaconcapital.site" },

  // Deposits
  { key: "deposit_received_pending", name: "Mobile Deposit Received", category: "Deposits", subject: "Mobile Check Deposit Received - Ref: REF-3910-X", sender: "payments@mail.beaconcapital.site" },
  { key: "deposit_settled", name: "Mobile Deposit Cleared", category: "Deposits", subject: "Check Deposit Cleared - Ref: REF-3910-X", sender: "payments@mail.beaconcapital.site" },

  // Billing & Ledger
  { key: "ledger_adjustment_notice", name: "Ledger Balance Adjustment", category: "Billing", subject: "Notice: Account Balance Adjustment Applied", sender: "billing@mail.beaconcapital.site" },

  // Security
  { key: "account_frozen", name: "Account Frozen Alert", category: "Security", subject: "SECURITY ALERT: Account Access Restricted", sender: "security@mail.beaconcapital.site" },
  { key: "account_unfrozen", name: "Account Unfrozen Notice", category: "Security", subject: "SECURITY NOTICE: Account Access Restored", sender: "security@mail.beaconcapital.site" },
  { key: "password_reset", name: "Password Reset Request", category: "Security", subject: "Beacon Capital Password Reset Request", sender: "security@mail.beaconcapital.site" },

  // Admin Alerts
  { key: "admin_new_applicant_alert", name: "Admin: New Applicant Alert", category: "Admin Alerts", subject: "[COMPLIANCE ALERT] New Account Application", sender: "internal@mail.beaconcapital.site" },
  { key: "admin_high_value_tx_alert", name: "Admin: High-Value Transfer", category: "Admin Alerts", subject: "[COMPLIANCE ALERT] High-Value Transfer Submitted", sender: "security@mail.beaconcapital.site" },
];

export default function EmailStudioPage() {
  const [selectedKey, setSelectedKey] = useState<string>("transfer_initiated");
  const [viewport, setViewport] = useState<"desktop" | "mobile">("desktop");
  const [testEmailInput, setTestEmailInput] = useState<string>("");
  const [sending, setSending] = useState<boolean>(false);
  const [sendResult, setSendResult] = useState<{ success: boolean; msg: string } | null>(null);

  const selectedTemplate = TEMPLATES.find((t) => t.key === selectedKey) || TEMPLATES[0];

  const handleSendTestEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!testEmailInput) return;
    setSending(true);
    setSendResult(null);

    try {
      const res = await fetch("/api/email-preview", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ template: selectedKey, testEmail: testEmailInput }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send test email");

      setSendResult({
        success: true,
        msg: `Test email successfully dispatched to ${testEmailInput} via Resend! (ID: ${data.resendId})`,
      });
    } catch (err: any) {
      setSendResult({
        success: false,
        msg: err.message || "An error occurred sending test email",
      });
    } finally {
      setSending(false);
    }
  };

  const categories = Array.from(new Set(TEMPLATES.map((t) => t.category)));

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 flex flex-col font-sans">
      {/* Header */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg">
            ✉
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">Beacon Capital Email Studio</h1>
            <p className="text-xs text-slate-400">Preview & Test all 15 email templates locally before production</p>
          </div>
        </div>

        {/* Viewport Toggles */}
        <div className="flex items-center space-x-3">
          <div className="bg-slate-900 p-1 rounded-lg border border-slate-800 flex space-x-1">
            <button
              onClick={() => setViewport("desktop")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewport === "desktop" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              💻 Desktop (600px)
            </button>
            <button
              onClick={() => setViewport("mobile")}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                viewport === "mobile" ? "bg-blue-600 text-white shadow" : "text-slate-400 hover:text-white"
              }`}
            >
              📱 Mobile (375px)
            </button>
          </div>

          <a
            href="/admin/console"
            className="text-xs px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
          >
            ← Admin Console
          </a>
        </div>
      </header>

      {/* Main Studio Body */}
      <div className="flex-1 flex overflow-hidden">
        {/* Sidebar */}
        <aside className="w-80 bg-slate-950 border-r border-slate-800 flex flex-col overflow-y-auto p-4 space-y-6">
          {categories.map((cat) => {
            const catTemplates = TEMPLATES.filter((t) => t.category === cat);
            return (
              <div key={cat}>
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-2 px-2">
                  {cat} ({catTemplates.length})
                </h3>
                <div className="space-y-1">
                  {catTemplates.map((t) => (
                    <button
                      key={t.key}
                      onClick={() => setSelectedKey(t.key)}
                      className={`w-full text-left px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                        selectedKey === t.key
                          ? "bg-blue-600/20 text-blue-400 border border-blue-500/30"
                          : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
                      }`}
                    >
                      {t.name}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}
        </aside>

        {/* Content Preview Area */}
        <main className="flex-1 bg-slate-900 flex flex-col overflow-hidden">
          {/* Email Info Bar */}
          <div className="bg-slate-950/60 border-b border-slate-800 p-4 px-6 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center space-x-2">
                <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20 font-semibold">
                  {selectedTemplate.category}
                </span>
                <h2 className="text-base font-bold text-white">{selectedTemplate.name}</h2>
              </div>
              <div className="text-xs text-slate-400 flex items-center space-x-4">
                <span><strong>From:</strong> {selectedTemplate.sender}</span>
                <span><strong>Subject:</strong> {selectedTemplate.subject}</span>
              </div>
            </div>

            {/* Test Send Form */}
            <form onSubmit={handleSendTestEmail} className="flex items-center space-x-2">
              <input
                type="email"
                placeholder="Enter test email address..."
                value={testEmailInput}
                onChange={(e) => setTestEmailInput(e.target.value)}
                className="bg-slate-900 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-2 w-64 focus:outline-none focus:border-blue-500"
              />
              <button
                type="submit"
                disabled={sending || !testEmailInput}
                className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white text-xs font-semibold px-4 py-2 rounded-lg transition"
              >
                {sending ? "Sending..." : "Send Test Email"}
              </button>
            </form>
          </div>

          {/* Feedback banner if test email sent */}
          {sendResult && (
            <div
              className={`px-6 py-2 text-xs font-medium border-b ${
                sendResult.success
                  ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                  : "bg-red-950/60 text-red-300 border-red-800"
              }`}
            >
              {sendResult.msg}
            </div>
          )}

          {/* Iframe Live Preview Container */}
          <div className="flex-1 overflow-auto p-6 flex justify-center items-start bg-slate-900/50">
            <div
              className={`bg-white rounded-xl shadow-2xl transition-all duration-300 overflow-hidden border border-slate-700 ${
                viewport === "desktop" ? "w-[640px] min-h-[700px]" : "w-[375px] min-h-[650px]"
              }`}
            >
              <iframe
                key={`${selectedKey}-${viewport}`}
                src={`/api/email-preview?template=${selectedKey}`}
                className="w-full h-full min-h-[750px] border-none"
                title="Email Preview"
              />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
