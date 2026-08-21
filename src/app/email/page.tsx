"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Sender Presets
// ---------------------------------------------------------------------------
interface SenderPreset {
  label: string;
  email: string;
  from: string;
  icon: string;
}

const SENDER_PRESETS: SenderPreset[] = [
  {
    label: "Support",
    email: "support@mail.beaconcapital.site",
    from: "Beacon Capital Support <support@mail.beaconcapital.site>",
    icon: "support_agent",
  },
  {
    label: "No Reply",
    email: "no-reply@mail.beaconcapital.site",
    from: "Beacon Capital <no-reply@mail.beaconcapital.site>",
    icon: "do_not_disturb_on",
  },
  {
    label: "Payments",
    email: "payments@mail.beaconcapital.site",
    from: "Beacon Capital Payments <payments@mail.beaconcapital.site>",
    icon: "payments",
  },
  {
    label: "Billing",
    email: "billing@mail.beaconcapital.site",
    from: "Beacon Capital Billing <billing@mail.beaconcapital.site>",
    icon: "receipt_long",
  },
  {
    label: "Security",
    email: "security@mail.beaconcapital.site",
    from: "Beacon Capital Security <security@mail.beaconcapital.site>",
    icon: "shield",
  },
];

// ---------------------------------------------------------------------------
// Password Gate Component
// ---------------------------------------------------------------------------
function PasswordGate({ onUnlock }: { onUnlock: () => void }) {
  const [pw, setPw] = useState("");
  const [error, setError] = useState(false);
  const [shake, setShake] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (pw === "Email@password") {
      onUnlock();
    } else {
      setError(true);
      setShake(true);
      setTimeout(() => setShake(false), 500);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div
        className={`w-full max-w-sm transition-transform ${shake ? "animate-shake" : ""}`}
      >
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Brand Mark */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg mb-4">
              <span className="material-symbols-outlined text-white text-3xl">
                mail_lock
              </span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">
              Email Console
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              Beacon Capital · Authorized Access Only
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label
                htmlFor="console-password"
                className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2"
              >
                Access Password
              </label>
              <input
                ref={inputRef}
                id="console-password"
                type="password"
                value={pw}
                onChange={(e) => {
                  setPw(e.target.value);
                  setError(false);
                }}
                placeholder="Enter password..."
                className={`w-full bg-slate-950 border ${
                  error ? "border-red-500" : "border-slate-700"
                } text-sm text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600`}
              />
              {error && (
                <p className="text-red-400 text-xs mt-2 flex items-center gap-1">
                  <span className="material-symbols-outlined text-sm">
                    error
                  </span>
                  Invalid password. Access denied.
                </p>
              )}
            </div>

            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold py-3 rounded-lg transition-colors"
            >
              Unlock Console
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-slate-700 mt-4">
          Protected internal system · Do not share credentials
        </p>
      </div>

      {/* Shake animation */}
      <style jsx>{`
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          20% { transform: translateX(-8px); }
          40% { transform: translateX(8px); }
          60% { transform: translateX(-6px); }
          80% { transform: translateX(6px); }
        }
        .animate-shake {
          animation: shake 0.4s ease-in-out;
        }
      `}</style>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Sender Dropdown
// ---------------------------------------------------------------------------
function SenderDropdown({
  selectedFrom,
  onSelect,
}: {
  selectedFrom: string;
  onSelect: (from: string) => void;
}) {
  const [open, setOpen] = useState(false);
  const [customMode, setCustomMode] = useState(false);
  const [customName, setCustomName] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handlePresetSelect = (preset: SenderPreset) => {
    onSelect(preset.from);
    setCustomMode(false);
    setOpen(false);
  };

  const handleCustomApply = () => {
    if (customName.trim()) {
      const sanitized = customName.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "");
      const from = `Beacon Capital <${sanitized}@mail.beaconcapital.site>`;
      onSelect(from);
      setOpen(false);
    }
  };

  // Find current preset for display
  const currentPreset = SENDER_PRESETS.find((p) => p.from === selectedFrom);
  const displayLabel = currentPreset
    ? `${currentPreset.label} · ${currentPreset.email}`
    : selectedFrom.replace(/^[^<]*</, "").replace(/>$/, "");

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-4 py-2.5 hover:border-slate-500 transition-colors text-left"
      >
        <div className="flex items-center gap-2 min-w-0">
          <span className="material-symbols-outlined text-blue-400 text-lg flex-shrink-0">
            {currentPreset?.icon || "alternate_email"}
          </span>
          <span className="truncate">{displayLabel}</span>
        </div>
        <span className="material-symbols-outlined text-slate-500 text-lg flex-shrink-0">
          {open ? "expand_less" : "expand_more"}
        </span>
      </button>

      {open && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl overflow-hidden">
          {/* Preset Senders */}
          {SENDER_PRESETS.map((p) => (
            <button
              key={p.email}
              type="button"
              onClick={() => handlePresetSelect(p)}
              className={`w-full flex items-center gap-3 px-4 py-3 text-left text-sm transition-colors ${
                selectedFrom === p.from
                  ? "bg-blue-600/15 text-blue-300"
                  : "text-slate-300 hover:bg-slate-800"
              }`}
            >
              <span className="material-symbols-outlined text-lg">{p.icon}</span>
              <div className="min-w-0">
                <div className="font-medium">{p.label}</div>
                <div className="text-xs text-slate-500 truncate">{p.email}</div>
              </div>
              {selectedFrom === p.from && (
                <span className="material-symbols-outlined text-blue-400 ml-auto text-lg">
                  check
                </span>
              )}
            </button>
          ))}

          {/* Divider */}
          <div className="border-t border-slate-700 mx-3" />

          {/* Custom Sender */}
          <div className="p-3">
            {!customMode ? (
              <button
                type="button"
                onClick={() => setCustomMode(true)}
                className="w-full flex items-center gap-3 px-2 py-2 text-sm text-slate-400 hover:text-slate-200 transition-colors"
              >
                <span className="material-symbols-outlined text-lg">edit</span>
                Custom sender address...
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <input
                  autoFocus
                  type="text"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  placeholder="name"
                  className="flex-1 bg-slate-950 border border-slate-600 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      e.preventDefault();
                      handleCustomApply();
                    }
                  }}
                />
                <span className="text-xs text-slate-500 flex-shrink-0">
                  @mail.beaconcapital.site
                </span>
                <button
                  type="button"
                  onClick={handleCustomApply}
                  className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors"
                >
                  Apply
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Live Preview Component
// ---------------------------------------------------------------------------
function LivePreview({ html }: { html: string }) {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  useEffect(() => {
    if (iframeRef.current) {
      const doc = iframeRef.current.contentDocument;
      if (doc) {
        doc.open();
        doc.write(html);
        doc.close();
      }
    }
  }, [html]);

  return (
    <iframe
      ref={iframeRef}
      title="Email Preview"
      className="w-full h-full border-none bg-white"
      sandbox="allow-same-origin"
    />
  );
}

// ---------------------------------------------------------------------------
// Main Compose Page
// ---------------------------------------------------------------------------
export default function EmailComposePage() {
  const [unlocked, setUnlocked] = useState(false);

  // Compose form state
  const [from, setFrom] = useState(SENDER_PRESETS[0].from);
  const [to, setTo] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");

  // Send state
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{
    success: boolean;
    msg: string;
  } | null>(null);

  // Sidebar
  const [activeLabel, setActiveLabel] = useState("compose");

  // Generate preview HTML client-side (simplified brand wrapper for preview)
  const previewHtml = useCallback(() => {
    const escapedMessage = message
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/\n/g, "<br/>");

    const senderMatch = from.match(/^([^<]*)</);
    const senderLabel = senderMatch ? senderMatch[1].trim() : "Beacon Capital";

    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="utf-8"/>
          <meta name="viewport" content="width=device-width, initial-scale=1.0"/>
          <style>
            * { box-sizing: border-box; }
            body { margin: 0; padding: 16px; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; -webkit-font-smoothing: antialiased; }
            .email-card { max-width: 600px; width: 100%; margin: 0 auto; background: #ffffff; border-radius: 12px; padding: 32px 24px; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.04); }
          </style>
        </head>
        <body>
          <div class="email-card">
            <div style="text-align: center; border-bottom: 2px solid #0f172a; padding-bottom: 16px; margin-bottom: 24px;">
              <div style="font-size: 22px; font-weight: 700; color: #0f172a; letter-spacing: 1px; font-family: 'Segoe UI', Arial, sans-serif;">
                Beacon Capital
              </div>
              <div style="font-size: 11px; color: #64748b; text-transform: uppercase; letter-spacing: 1.5px; margin-top: 4px;">
                Account Notifications
              </div>
            </div>

            <h2 style="color: #0f172a; font-size: 18px; margin-top: 0;">Beacon Capital</h2>
            ${recipientName ? `<p style="color: #334155; line-height: 1.6;">Hello ${recipientName.replace(/</g, "&lt;").replace(/>/g, "&gt;")},</p>` : ""}
            <div style="color: #334155; line-height: 1.7; font-size: 14px; white-space: pre-wrap;">
              ${escapedMessage || '<span style="color: #94a3b8; font-style: italic;">Start typing your message...</span>'}
            </div>

            ${senderLabel ? `
              <div style="margin-top: 28px; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                <p style="color: #64748b; font-size: 13px; margin: 0;">Sent by <strong style="color: #334155;">${senderLabel}</strong></p>
              </div>
            ` : ""}

            <div style="text-align: center; font-size: 12px; color: #94a3b8; margin-top: 32px; border-top: 1px solid #e2e8f0; padding-top: 20px; font-family: sans-serif;">
              <p style="margin: 4px 0;">&copy; ${new Date().getFullYear()} Beacon Capital Services. All rights reserved.</p>
              <p style="margin: 4px 0;">Need help? Contact support at <a href="mailto:support@mail.beaconcapital.site" style="color: #2563eb; text-decoration: none;">support@mail.beaconcapital.site</a>.</p>
              <p style="margin: 4px 0; font-size: 11px; color: #cbd5e1;">You received this automated notification regarding your account activity.</p>
            </div>
          </div>
        </body>
      </html>
    `;
  }, [from, message, recipientName]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!to || !subject || !message) return;

    setSending(true);
    setResult(null);

    try {
      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from,
          to,
          subject,
          message,
          recipientName: recipientName || undefined,
          password: "Email@password",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send email");

      setResult({
        success: true,
        msg: `Email sent to ${to}! Resend ID: ${data.resendId}`,
      });

      // Reset form on success
      setTo("");
      setRecipientName("");
      setSubject("");
      setMessage("");
    } catch (err: any) {
      setResult({
        success: false,
        msg: err.message || "An error occurred.",
      });
    } finally {
      setSending(false);
    }
  };

  // Password gate
  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  const sidebarLabels = [
    { id: "compose", icon: "edit", label: "Compose" },
    { id: "sent", icon: "send", label: "Sent" },
    { id: "drafts", icon: "draft", label: "Drafts" },
    { id: "templates", icon: "description", label: "Templates" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
      {/* ── Header ── */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
            <span className="material-symbols-outlined text-white text-xl">
              mail
            </span>
          </div>
          <div>
            <h1 className="text-base font-bold tracking-tight text-white">
              Beacon Mail
            </h1>
            <p className="text-[11px] text-slate-500">
              Compose &amp; send branded emails · mail.beaconcapital.site
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/admin/emails"
            className="text-xs px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg transition border border-slate-800"
          >
            <span className="material-symbols-outlined text-sm align-middle mr-1">
              preview
            </span>
            Template Studio
          </a>
          <a
            href="/admin/console"
            className="text-xs px-3 py-2 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg transition border border-slate-800"
          >
            Admin Console
          </a>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar ── */}
        <aside className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col p-3 gap-1 flex-shrink-0">
          {sidebarLabels.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveLabel(item.id)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeLabel === item.id
                  ? "bg-blue-600/15 text-blue-300"
                  : "text-slate-500 hover:bg-slate-900 hover:text-slate-300"
              }`}
            >
              <span className="material-symbols-outlined text-lg">
                {item.icon}
              </span>
              {item.label}
            </button>
          ))}

          {/* Sender Info */}
          <div className="mt-auto p-3 bg-slate-900/50 rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase text-slate-600 tracking-wider font-bold mb-1">
              Active Domain
            </div>
            <div className="text-xs text-slate-400">
              mail.beaconcapital.site
            </div>
            <div className="text-[10px] text-slate-600 mt-1">
              5 configured senders + custom
            </div>
          </div>
        </aside>

        {/* ── Main Content ── */}
        <main className="flex-1 flex overflow-hidden">
          {/* ── Left: Compose Form ── */}
          <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
            {/* Result Banner */}
            {result && (
              <div
                className={`px-6 py-2.5 text-xs font-medium border-b flex items-center gap-2 ${
                  result.success
                    ? "bg-emerald-950/60 text-emerald-300 border-emerald-800"
                    : "bg-red-950/60 text-red-300 border-red-800"
                }`}
              >
                <span className="material-symbols-outlined text-sm">
                  {result.success ? "check_circle" : "error"}
                </span>
                {result.msg}
                <button
                  onClick={() => setResult(null)}
                  className="ml-auto text-current opacity-60 hover:opacity-100"
                >
                  <span className="material-symbols-outlined text-sm">
                    close
                  </span>
                </button>
              </div>
            )}

            {/* Compose Form */}
            <form
              onSubmit={handleSend}
              className="flex-1 flex flex-col overflow-y-auto"
            >
              <div className="p-5 space-y-4 flex-1">
                {/* From */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    From
                  </label>
                  <SenderDropdown selectedFrom={from} onSelect={setFrom} />
                </div>

                {/* To */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    To
                  </label>
                  <input
                    type="email"
                    required
                    value={to}
                    onChange={(e) => setTo(e.target.value)}
                    placeholder="recipient@example.com"
                    className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>

                {/* Recipient Name (optional) */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Recipient Name{" "}
                    <span className="text-slate-700 normal-case">(optional — used in greeting)</span>
                  </label>
                  <input
                    type="text"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                    placeholder="e.g. John Doe"
                    className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>

                {/* Subject */}
                <div>
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Subject
                  </label>
                  <input
                    type="text"
                    required
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    placeholder="Email subject line..."
                    className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-4 py-2.5 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                  />
                </div>

                {/* Message Body */}
                <div className="flex-1 flex flex-col">
                  <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1.5">
                    Message
                  </label>
                  <textarea
                    required
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Type your message here... It will be wrapped in the Beacon Capital branded email template."
                    rows={12}
                    className="w-full flex-1 bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 resize-none leading-relaxed"
                  />
                </div>
              </div>

              {/* ── Bottom Toolbar ── */}
              <div className="border-t border-slate-800 px-5 py-3 flex items-center gap-3 bg-slate-900/40 flex-shrink-0">
                <button
                  type="submit"
                  disabled={sending || !to || !subject || !message}
                  className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-semibold px-6 py-2.5 rounded-lg transition-all flex items-center gap-2 shadow-lg shadow-blue-600/20"
                >
                  <span className="material-symbols-outlined text-lg">
                    {sending ? "hourglass_top" : "send"}
                  </span>
                  {sending ? "Sending..." : "Send Email"}
                </button>

                <div className="flex-1" />

                <div className="text-xs text-slate-600 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-sm">
                    lock
                  </span>
                  Sent via Resend · Branded Template
                </div>
              </div>
            </form>
          </div>

          {/* ── Right: Live Preview ── */}
          <div className="w-[480px] flex-shrink-0 flex flex-col bg-slate-900/30 overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-800 flex items-center gap-2 flex-shrink-0">
              <span className="material-symbols-outlined text-blue-400 text-lg">
                visibility
              </span>
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Live Preview
              </span>
              <span className="text-[10px] text-slate-600 ml-auto">
                Real-time branded template render
              </span>
            </div>
            <div className="flex-1 overflow-auto p-4">
              <div className="bg-white rounded-xl shadow-2xl overflow-hidden border border-slate-700 min-h-[500px]">
                <LivePreview html={previewHtml()} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
