"use client";

import React, { useState, useCallback, useRef, useEffect } from "react";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------
interface InboxEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string;
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  folder: "inbox" | "sent" | "starred" | "trash" | "archive";
  replyTo?: string;
  messageId?: string;
}

interface SentEmailLog {
  id: string;
  senderEmail: string;
  recipientEmail: string;
  recipientName?: string;
  subject: string;
  bodyText?: string;
  bodyHtml?: string;
  sentAt: string;
  resendId?: string;
  status: "sent" | "failed" | "delivered";
  templateName?: string;
}

interface SenderPreset {
  label: string;
  email: string;
  from: string;
  icon: string;
}

// ---------------------------------------------------------------------------
// Sender Presets
// ---------------------------------------------------------------------------
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

// Helper: Format relative timestamp
function formatTimeAgo(isoDateString: string) {
  try {
    const date = new Date(isoDateString);
    const now = new Date();
    const diffSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffSeconds < 60) return "just now";
    const diffMinutes = Math.floor(diffSeconds / 60);
    if (diffMinutes < 60) return `${diffMinutes}m ago`;
    const diffHours = Math.floor(diffMinutes / 60);
    if (diffHours < 24) return `${diffHours}h ago`;
    const diffDays = Math.floor(diffHours / 24);
    if (diffDays === 1) return "Yesterday";
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  } catch {
    return isoDateString;
  }
}

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
      <div className={`w-full max-w-sm transition-transform ${shake ? "animate-shake" : ""}`}>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 shadow-2xl">
          {/* Brand Mark */}
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-14 h-14 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 shadow-lg mb-4">
              <span className="material-symbols-outlined text-white text-3xl">mail_lock</span>
            </div>
            <h1 className="text-xl font-bold text-white tracking-tight">Email Console</h1>
            <p className="text-xs text-slate-500 mt-1">Beacon Capital · Authorized Access Only</p>
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
                  <span className="material-symbols-outlined text-sm">error</span>
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

      <style jsx>{`
        @keyframes shake {
          0%,
          100% {
            transform: translateX(0);
          }
          20% {
            transform: translateX(-8px);
          }
          40% {
            transform: translateX(8px);
          }
          60% {
            transform: translateX(-6px);
          }
          80% {
            transform: translateX(6px);
          }
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
                <span className="material-symbols-outlined text-blue-400 ml-auto text-lg">check</span>
              )}
            </button>
          ))}

          <div className="border-t border-slate-700 mx-3" />

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
// Live Preview Component (Iframe Sandbox)
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
// Setup Webhook Guide Modal
// ---------------------------------------------------------------------------
function WebhookModal({ onClose }: { onClose: () => void }) {
  const [copied, setCopied] = useState(false);
  const webhookUrl = "https://beaconcapital.site/api/email/inbound";

  const handleCopy = () => {
    navigator.clipboard.writeText(webhookUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-400 text-2xl">webhook</span>
            <h3 className="font-bold text-white text-lg">Inbound Email &amp; Webhook Setup</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <div className="space-y-4 my-4 text-sm leading-relaxed">
          <p className="text-slate-300">
            Whenever someone sends an email to{" "}
            <code className="text-blue-300 bg-slate-950 px-1.5 py-0.5 rounded text-xs">
              support@mail.beaconcapital.site
            </code>{" "}
            or replies to your emails, your inbound webhook receives and deposits it right into this
            Inbox.
          </p>

          <div>
            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
              Your Inbound Webhook URL
            </label>
            <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl p-2 px-3">
              <span className="text-xs text-blue-400 font-mono flex-1 select-all break-all">
                {webhookUrl}
              </span>
              <button
                onClick={handleCopy}
                className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1 transition-colors flex-shrink-0"
              >
                <span className="material-symbols-outlined text-sm">
                  {copied ? "check" : "content_copy"}
                </span>
                {copied ? "Copied!" : "Copy URL"}
              </button>
            </div>
          </div>

          <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2 text-xs text-slate-400">
            <div className="font-semibold text-slate-200 flex items-center gap-1.5">
              <span className="material-symbols-outlined text-emerald-400 text-sm">tune</span>
              Connecting via Resend Dashboard:
            </div>
            <ol className="list-decimal list-inside space-y-1.5 pl-1">
              <li>Log in to your <strong>Resend.com</strong> dashboard.</li>
              <li>Go to <strong>Webhooks</strong> &rarr; <strong>Add Webhook</strong>.</li>
              <li>Paste the URL above: <code className="text-slate-300">{webhookUrl}</code>.</li>
              <li>Select event: <strong className="text-blue-300">email.received</strong>.</li>
              <li>Click <strong>Add</strong>. All inbound emails will stream into this console automatically!</li>
            </ol>
          </div>
        </div>

        <div className="flex justify-end pt-3 border-t border-slate-800">
          <button
            onClick={onClose}
            className="bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold px-4 py-2 rounded-lg transition-colors"
          >
            Got it, Close
          </button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Simulate Inbound Email Modal
// ---------------------------------------------------------------------------
function SimulateInboundModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [senderName, setSenderName] = useState("Alex Harrison");
  const [senderEmail, setSenderEmail] = useState("alex.harrison@horizoncap.org");
  const [subject, setSubject] = useState("Wire Confirmation & Statement Request for Q3");
  const [bodyText, setBodyText] = useState(
    "Hello Beacon Capital Support Team,\n\nWe would like to request an updated institutional statement for our commercial checking account covering Q3 settlement activity.\n\nPlease confirm if wire confirmation receipts are also available in PDF.\n\nThank you,\nAlex Harrison"
  );
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await fetch("/api/email/inbox", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          senderName,
          senderEmail,
          recipientEmail: "support@mail.beaconcapital.site",
          subject,
          bodyText,
        }),
      });

      if (res.ok) {
        onSuccess();
        onClose();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl text-slate-200">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-amber-400 text-2xl">bolt</span>
            <h3 className="font-bold text-white text-base">Simulate Inbound Message</h3>
          </div>
          <button
            onClick={onClose}
            className="text-slate-500 hover:text-slate-300 transition-colors p-1"
          >
            <span className="material-symbols-outlined">close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5 my-4 text-xs">
          <div>
            <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sender Name
            </label>
            <input
              type="text"
              required
              value={senderName}
              onChange={(e) => setSenderName(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Sender Email
            </label>
            <input
              type="email"
              required
              value={senderEmail}
              onChange={(e) => setSenderEmail(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Subject Line
            </label>
            <input
              type="text"
              required
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-400 uppercase tracking-wider mb-1">
              Message Content
            </label>
            <textarea
              required
              rows={4}
              value={bodyText}
              onChange={(e) => setBodyText(e.target.value)}
              className="w-full bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-500 resize-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white font-semibold rounded-lg flex items-center gap-1.5 transition-colors disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-base">
                {loading ? "hourglass_top" : "send_and_archive"}
              </span>
              {loading ? "Sending..." : "Inject into Inbox"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Main Application Component
// ---------------------------------------------------------------------------
export default function EmailConsolePage() {
  const [unlocked, setUnlocked] = useState(false);

  // Navigation
  const [activeLabel, setActiveLabel] = useState<"inbox" | "compose" | "sent" | "drafts">(
    "inbox"
  );

  // Compose State
  const [from, setFrom] = useState(SENDER_PRESETS[0].from);
  const [to, setTo] = useState("");
  const [recipientName, setRecipientName] = useState("");
  const [subject, setSubject] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<{ success: boolean; msg: string } | null>(null);

  // Inbox State
  const [inboxEmails, setInboxEmails] = useState<InboxEmail[]>([]);
  const [selectedEmail, setSelectedEmail] = useState<InboxEmail | null>(null);
  const [inboxFilter, setInboxFilter] = useState<"inbox" | "starred" | "all">("inbox");
  const [searchQuery, setSearchQuery] = useState("");
  const [unreadCount, setUnreadCount] = useState(0);
  const [loadingInbox, setLoadingInbox] = useState(false);

  // Quick reply state in Reader view
  const [quickReplyText, setQuickReplyText] = useState("");
  const [quickReplying, setQuickReplying] = useState(false);
  const [quickReplyStatus, setQuickReplyStatus] = useState<string | null>(null);

  // Sent Emails State
  const [sentEmails, setSentEmails] = useState<SentEmailLog[]>([]);
  const [loadingSent, setLoadingSent] = useState(false);
  const [selectedSentEmail, setSelectedSentEmail] = useState<SentEmailLog | null>(null);

  // Modals
  const [showWebhookModal, setShowWebhookModal] = useState(false);
  const [showSimulateModal, setShowSimulateModal] = useState(false);

  // Fetch Inbox Data
  const fetchInbox = useCallback(async () => {
    try {
      setLoadingInbox(true);
      const queryParams = new URLSearchParams();
      if (inboxFilter !== "all") queryParams.set("folder", inboxFilter);
      if (searchQuery.trim()) queryParams.set("search", searchQuery.trim());

      const res = await fetch(`/api/email/inbox?${queryParams.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch inbox");
      const data = await res.json();

      setInboxEmails(data.emails || []);
      setUnreadCount(data.unreadCount || 0);

      // Keep selected email updated if already viewing
      if (selectedEmail) {
        const found = (data.emails || []).find((e: InboxEmail) => e.id === selectedEmail.id);
        if (found) {
          setSelectedEmail(found);
        }
      } else if (data.emails && data.emails.length > 0) {
        setSelectedEmail(data.emails[0]);
      }
    } catch (err) {
      console.error("Inbox fetch error:", err);
    } finally {
      setLoadingInbox(false);
    }
  }, [inboxFilter, searchQuery, selectedEmail]);

  // Fetch Sent Data
  const fetchSent = useCallback(async () => {
    try {
      setLoadingSent(true);
      const res = await fetch("/api/email/sent");
      if (!res.ok) throw new Error("Failed to fetch sent emails");
      const data = await res.json();
      setSentEmails(data.emails || []);
      if (data.emails && data.emails.length > 0 && !selectedSentEmail) {
        setSelectedSentEmail(data.emails[0]);
      }
    } catch (err) {
      console.error("Sent fetch error:", err);
    } finally {
      setLoadingSent(false);
    }
  }, [selectedSentEmail]);

  // Initial and Periodic Fetching (Auto-polling every 25 seconds)
  useEffect(() => {
    if (!unlocked) return;
    fetchInbox();

    const interval = setInterval(() => {
      fetchInbox();
    }, 25000);

    return () => clearInterval(interval);
  }, [unlocked, fetchInbox]);

  useEffect(() => {
    if (!unlocked) return;
    if (activeLabel === "sent") {
      fetchSent();
    }
  }, [unlocked, activeLabel, fetchSent]);

  // Mark as Read/Unread
  const handleToggleRead = async (email: InboxEmail, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStatus = !email.isRead;

    // Optimistic UI update
    setInboxEmails((prev) =>
      prev.map((item) => (item.id === email.id ? { ...item, isRead: newStatus } : item))
    );
    if (selectedEmail?.id === email.id) {
      setSelectedEmail((prev) => (prev ? { ...prev, isRead: newStatus } : null));
    }
    setUnreadCount((c) => (newStatus ? Math.max(0, c - 1) : c + 1));

    try {
      await fetch("/api/email/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id, isRead: newStatus }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Toggle Star
  const handleToggleStar = async (email: InboxEmail, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const newStarred = !email.isStarred;

    // Optimistic UI update
    setInboxEmails((prev) =>
      prev.map((item) => (item.id === email.id ? { ...item, isStarred: newStarred } : item))
    );
    if (selectedEmail?.id === email.id) {
      setSelectedEmail((prev) => (prev ? { ...prev, isStarred: newStarred } : null));
    }

    try {
      await fetch("/api/email/inbox", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: email.id, isStarred: newStarred }),
      });
    } catch (err) {
      console.error(err);
    }
  };

  // Delete Email
  const handleDeleteEmail = async (email: InboxEmail, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (!confirm(`Delete message from ${email.senderName}?`)) return;

    // Optimistic UI update
    setInboxEmails((prev) => prev.filter((item) => item.id !== email.id));
    if (selectedEmail?.id === email.id) {
      const remaining = inboxEmails.filter((item) => item.id !== email.id);
      setSelectedEmail(remaining[0] || null);
    }

    try {
      await fetch(`/api/email/inbox?id=${email.id}`, {
        method: "DELETE",
      });
      fetchInbox();
    } catch (err) {
      console.error(err);
    }
  };

  // Select Email & Mark as Read
  const handleSelectEmail = (email: InboxEmail) => {
    setSelectedEmail(email);
    if (!email.isRead) {
      handleToggleRead(email);
    }
  };

  // Reply to Email (prefill Compose form or switch to compose tab)
  const handleReplyToEmail = (email: InboxEmail) => {
    setTo(email.replyTo || email.senderEmail);
    setRecipientName(email.senderName);
    const sub = email.subject.toLowerCase().startsWith("re:")
      ? email.subject
      : `Re: ${email.subject}`;
    setSubject(sub);
    setFrom("Beacon Capital Support <support@mail.beaconcapital.site>");
    setMessage(
      `\n\n--- Original Message from ${email.senderName} (${email.senderEmail}) on ${new Date(
        email.receivedAt
      ).toLocaleString()} ---\n${email.bodyText}`
    );
    setActiveLabel("compose");
  };

  // Quick Reply handler from reading pane
  const handleSendQuickReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmail || !quickReplyText.trim()) return;

    setQuickReplying(true);
    setQuickReplyStatus(null);

    try {
      const sub = selectedEmail.subject.toLowerCase().startsWith("re:")
        ? selectedEmail.subject
        : `Re: ${selectedEmail.subject}`;

      const res = await fetch("/api/send-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: "Beacon Capital Support <support@mail.beaconcapital.site>",
          to: selectedEmail.replyTo || selectedEmail.senderEmail,
          recipientName: selectedEmail.senderName,
          subject: sub,
          message: `${quickReplyText.trim()}\n\n--- Quoted Message ---\n${selectedEmail.bodyText}`,
          password: "Email@password",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to send quick reply");

      setQuickReplyStatus(`Reply sent to ${selectedEmail.senderEmail}!`);
      setQuickReplyText("");
      setTimeout(() => setQuickReplyStatus(null), 4000);
    } catch (err: any) {
      setQuickReplyStatus(`Error: ${err.message}`);
    } finally {
      setQuickReplying(false);
    }
  };

  // Generate preview HTML for Compose
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

  // Handle Full Compose Send
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

      // Reset form
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

  // Password gate check
  if (!unlocked) {
    return <PasswordGate onUnlock={() => setUnlocked(true)} />;
  }

  const sidebarLabels = [
    { id: "inbox", icon: "inbox", label: "Inbox", count: unreadCount },
    { id: "compose", icon: "edit", label: "Compose" },
    { id: "sent", icon: "send", label: "Sent" },
    { id: "drafts", icon: "draft", label: "Drafts" },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-blue-600 selection:text-white">
      {/* ── Top Header Bar ── */}
      <header className="bg-slate-950 border-b border-slate-800 px-6 py-3 flex items-center justify-between flex-shrink-0">
        <div className="flex items-center space-x-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg shadow-blue-600/20">
            <span className="material-symbols-outlined text-white text-xl">mark_email_read</span>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold tracking-tight text-white">Beacon Mail</h1>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-600/20 text-blue-400 border border-blue-500/30">
                Live Console
              </span>
            </div>
            <p className="text-[11px] text-slate-500">
              Inbound &amp; Outbound Support Hub · support@mail.beaconcapital.site
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setShowWebhookModal(true)}
            className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-blue-400 rounded-lg transition border border-slate-800 flex items-center gap-1.5"
          >
            <span className="material-symbols-outlined text-sm">webhook</span>
            Webhook Setup
          </button>
          <button
            onClick={() => setShowSimulateModal(true)}
            className="text-xs px-3 py-1.5 bg-amber-950/40 hover:bg-amber-900/50 text-amber-300 rounded-lg transition border border-amber-800/60 flex items-center gap-1.5 font-medium"
          >
            <span className="material-symbols-outlined text-sm">bolt</span>
            Simulate Inbound
          </button>
          <a
            href="/admin/emails"
            className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg transition border border-slate-800 flex items-center gap-1"
          >
            <span className="material-symbols-outlined text-sm">preview</span>
            Templates
          </a>
          <a
            href="/admin/console"
            className="text-xs px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg transition border border-slate-800"
          >
            Admin Console
          </a>
        </div>
      </header>

      {/* ── Main Layout ── */}
      <div className="flex-1 flex overflow-hidden">
        {/* ── Sidebar Navigation ── */}
        <aside className="w-56 bg-slate-950 border-r border-slate-800 flex flex-col p-3 gap-1 flex-shrink-0">
          <button
            onClick={() => {
              setActiveLabel("compose");
              // Reset compose form if empty
              if (!to) {
                setFrom(SENDER_PRESETS[0].from);
              }
            }}
            className="w-full mb-3 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white text-sm font-semibold py-2.5 rounded-xl shadow-lg shadow-blue-600/25 transition-all"
          >
            <span className="material-symbols-outlined text-lg">add</span>
            New Message
          </button>

          {sidebarLabels.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveLabel(item.id as any)}
              className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all ${
                activeLabel === item.id
                  ? "bg-blue-600/15 text-blue-300 font-semibold"
                  : "text-slate-400 hover:bg-slate-900 hover:text-slate-200"
              }`}
            >
              <div className="flex items-center gap-3">
                <span
                  className={`material-symbols-outlined text-lg ${
                    activeLabel === item.id ? "text-blue-400" : "text-slate-500"
                  }`}
                >
                  {item.icon}
                </span>
                {item.label}
              </div>
              {typeof item.count === "number" && item.count > 0 && (
                <span className="bg-blue-600 text-white text-[11px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                  {item.count}
                </span>
              )}
            </button>
          ))}

          {/* Connected Mailbox Badge */}
          <div className="mt-auto p-3 bg-slate-900/60 rounded-xl border border-slate-800/80">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-[10px] uppercase text-emerald-400 tracking-wider font-bold">
                Receiving Active
              </div>
            </div>
            <div className="text-xs text-slate-300 font-medium truncate">
              support@mail.beaconcapital.site
            </div>
            <div className="text-[10px] text-slate-500 mt-1">
              Dual storage: Supabase + Fallback
            </div>
          </div>
        </aside>

        {/* ── View Switcher ── */}
        <main className="flex-1 flex overflow-hidden">
          {/* ========================================================================= */}
          {/* 1. INBOX VIEW */}
          {/* ========================================================================= */}
          {activeLabel === "inbox" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left Pane: Email List */}
              <div className="w-[380px] lg:w-[420px] flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/80">
                {/* Search and Filters Header */}
                <div className="p-3 border-b border-slate-800 space-y-2.5">
                  {/* Search Bar */}
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-2.5 text-slate-500 text-base">
                      search
                    </span>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      placeholder="Search sender, subject, words..."
                      className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 rounded-xl pl-9 pr-8 py-2 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600"
                    />
                    {searchQuery && (
                      <button
                        onClick={() => setSearchQuery("")}
                        className="absolute right-2.5 top-2 text-slate-500 hover:text-slate-300"
                      >
                        <span className="material-symbols-outlined text-sm">close</span>
                      </button>
                    )}
                  </div>

                  {/* Filter Pills + Refresh */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      {(["inbox", "starred", "all"] as const).map((filter) => (
                        <button
                          key={filter}
                          onClick={() => setInboxFilter(filter)}
                          className={`text-xs px-2.5 py-1 rounded-lg capitalize transition-colors font-medium ${
                            inboxFilter === filter
                              ? "bg-slate-800 text-blue-300 font-semibold"
                              : "text-slate-500 hover:text-slate-300 hover:bg-slate-900"
                          }`}
                        >
                          {filter === "inbox" ? "Inbox" : filter === "starred" ? "Starred" : "All"}
                        </button>
                      ))}
                    </div>

                    <button
                      onClick={() => fetchInbox()}
                      disabled={loadingInbox}
                      title="Refresh Inbox"
                      className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition border border-slate-800"
                    >
                      <span
                        className={`material-symbols-outlined text-sm block ${
                          loadingInbox ? "animate-spin text-blue-400" : ""
                        }`}
                      >
                        refresh
                      </span>
                    </button>
                  </div>
                </div>

                {/* Email Items List */}
                <div className="flex-1 overflow-y-auto divide-y divide-slate-900/60">
                  {inboxEmails.length === 0 ? (
                    <div className="text-center py-16 px-4">
                      <div className="w-12 h-12 rounded-full bg-slate-900 flex items-center justify-center mx-auto mb-3 text-slate-600">
                        <span className="material-symbols-outlined text-2xl">mail_outline</span>
                      </div>
                      <h3 className="text-sm font-semibold text-slate-400">No emails found</h3>
                      <p className="text-xs text-slate-600 mt-1 max-w-[220px] mx-auto">
                        Your inbox is clear. New incoming emails to support@mail.beaconcapital.site will
                        appear here.
                      </p>
                      <button
                        onClick={() => setShowSimulateModal(true)}
                        className="mt-4 text-xs px-3 py-1.5 bg-blue-600/20 hover:bg-blue-600/30 text-blue-400 border border-blue-500/30 rounded-lg transition-colors font-medium"
                      >
                        + Simulate Test Email
                      </button>
                    </div>
                  ) : (
                    inboxEmails.map((email) => {
                      const isSelected = selectedEmail?.id === email.id;
                      return (
                        <div
                          key={email.id}
                          onClick={() => handleSelectEmail(email)}
                          className={`p-3.5 cursor-pointer transition-all relative group ${
                            isSelected
                              ? "bg-blue-600/10 border-l-4 border-blue-500"
                              : "hover:bg-slate-900/50 border-l-4 border-transparent"
                          } ${!email.isRead ? "font-semibold bg-slate-900/20" : ""}`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-1">
                            {/* Sender Info & Avatar */}
                            <div className="flex items-center gap-2 min-w-0">
                              <div
                                className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0 ${
                                  !email.isRead
                                    ? "bg-blue-600 text-white"
                                    : "bg-slate-800 text-slate-400"
                                }`}
                              >
                                {email.senderName.charAt(0).toUpperCase()}
                              </div>
                              <span
                                className={`text-xs truncate ${
                                  !email.isRead ? "text-white font-bold" : "text-slate-300"
                                }`}
                              >
                                {email.senderName}
                              </span>
                            </div>

                            {/* Timestamp & Star */}
                            <div className="flex items-center gap-1.5 flex-shrink-0">
                              <span className="text-[11px] text-slate-500">
                                {formatTimeAgo(email.receivedAt)}
                              </span>
                              <button
                                onClick={(e) => handleToggleStar(email, e)}
                                className={`p-0.5 transition-colors ${
                                  email.isStarred
                                    ? "text-amber-400"
                                    : "text-slate-600 opacity-0 group-hover:opacity-100 hover:text-amber-300"
                                }`}
                              >
                                <span className="material-symbols-outlined text-sm">
                                  {email.isStarred ? "star" : "star_border"}
                                </span>
                              </button>
                            </div>
                          </div>

                          {/* Subject */}
                          <div className="flex items-center gap-2 mb-1">
                            {!email.isRead && (
                              <span className="w-1.5 h-1.5 rounded-full bg-blue-500 flex-shrink-0" />
                            )}
                            <p
                              className={`text-xs truncate ${
                                !email.isRead ? "text-slate-100 font-semibold" : "text-slate-300"
                              }`}
                            >
                              {email.subject}
                            </p>
                          </div>

                          {/* Preview snippet */}
                          <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                            {email.bodyText}
                          </p>

                          {/* Recipient Badge */}
                          <div className="mt-2 flex items-center gap-2">
                            <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/80">
                              To: {email.recipientEmail.replace(/^support@/, "")}
                            </span>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Right Pane: Email Detail / Reader */}
              <div className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
                {selectedEmail ? (
                  <div className="flex-1 flex flex-col overflow-hidden">
                    {/* Reader Header Actions */}
                    <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/90 flex-shrink-0">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleReplyToEmail(selectedEmail)}
                          className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                        >
                          <span className="material-symbols-outlined text-base">reply</span>
                          Reply
                        </button>
                        <button
                          onClick={() => handleToggleStar(selectedEmail)}
                          className={`text-xs px-2.5 py-1.5 rounded-lg border border-slate-800 transition flex items-center gap-1 ${
                            selectedEmail.isStarred
                              ? "bg-amber-950/30 border-amber-800/60 text-amber-400"
                              : "bg-slate-900 hover:bg-slate-800 text-slate-400"
                          }`}
                        >
                          <span className="material-symbols-outlined text-sm">
                            {selectedEmail.isStarred ? "star" : "star_border"}
                          </span>
                          {selectedEmail.isStarred ? "Starred" : "Star"}
                        </button>
                        <button
                          onClick={() => handleToggleRead(selectedEmail)}
                          className="text-xs px-2.5 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 rounded-lg border border-slate-800 transition flex items-center gap-1"
                        >
                          <span className="material-symbols-outlined text-sm">
                            {selectedEmail.isRead ? "mark_email_unread" : "mark_email_read"}
                          </span>
                          {selectedEmail.isRead ? "Mark Unread" : "Mark Read"}
                        </button>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleDeleteEmail(selectedEmail)}
                          title="Delete Email"
                          className="p-1.5 bg-slate-900 hover:bg-red-950/40 text-slate-400 hover:text-red-400 rounded-lg border border-slate-800 transition"
                        >
                          <span className="material-symbols-outlined text-sm">delete</span>
                        </button>
                      </div>
                    </div>

                    {/* Email Message Content Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-5">
                      {/* Subject */}
                      <div>
                        <h2 className="text-xl font-bold text-white tracking-tight">
                          {selectedEmail.subject}
                        </h2>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[11px] px-2 py-0.5 rounded-md bg-blue-600/20 text-blue-400 border border-blue-500/30">
                            Inbound
                          </span>
                          <span className="text-xs text-slate-500">
                            Received {new Date(selectedEmail.receivedAt).toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Sender / Recipient Card */}
                      <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-4 flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-indigo-700 flex items-center justify-center text-white font-bold text-base shadow-md">
                            {selectedEmail.senderName.charAt(0).toUpperCase()}
                          </div>
                          <div>
                            <div className="text-sm font-semibold text-white">
                              {selectedEmail.senderName}
                            </div>
                            <div className="text-xs text-blue-400 font-mono">
                              &lt;{selectedEmail.senderEmail}&gt;
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              To:{" "}
                              <span className="text-slate-300 font-mono">
                                {selectedEmail.recipientEmail}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="text-right text-[11px] text-slate-500">
                          <div>{formatTimeAgo(selectedEmail.receivedAt)}</div>
                        </div>
                      </div>

                      {/* Email Body */}
                      <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-6 min-h-[220px]">
                        {selectedEmail.bodyHtml ? (
                          <div
                            className="prose prose-invert max-w-none text-sm text-slate-200 leading-relaxed font-sans"
                            dangerouslySetInnerHTML={{ __html: selectedEmail.bodyHtml }}
                          />
                        ) : (
                          <p className="text-sm text-slate-200 whitespace-pre-wrap leading-relaxed font-sans">
                            {selectedEmail.bodyText}
                          </p>
                        )}
                      </div>

                      {/* ── Quick Reply Section ── */}
                      <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="text-xs font-semibold text-slate-300 flex items-center gap-1.5">
                            <span className="material-symbols-outlined text-blue-400 text-sm">
                              reply
                            </span>
                            Quick Reply to {selectedEmail.senderName}
                          </div>
                          <span className="text-[11px] text-slate-500">
                            Sending from: support@mail.beaconcapital.site
                          </span>
                        </div>

                        {quickReplyStatus && (
                          <div
                            className={`p-2.5 rounded-lg text-xs font-medium ${
                              quickReplyStatus.startsWith("Error")
                                ? "bg-red-950/60 text-red-300 border border-red-800"
                                : "bg-emerald-950/60 text-emerald-300 border border-emerald-800"
                            }`}
                          >
                            {quickReplyStatus}
                          </div>
                        )}

                        <form onSubmit={handleSendQuickReply} className="space-y-2.5">
                          <textarea
                            rows={3}
                            value={quickReplyText}
                            onChange={(e) => setQuickReplyText(e.target.value)}
                            placeholder={`Type quick reply to ${selectedEmail.senderEmail}...`}
                            className="w-full bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg p-3 focus:outline-none focus:border-blue-500 placeholder:text-slate-600 resize-none"
                          />
                          <div className="flex items-center justify-between">
                            <button
                              type="button"
                              onClick={() => handleReplyToEmail(selectedEmail)}
                              className="text-xs text-slate-400 hover:text-blue-300 transition-colors"
                            >
                              Open in Full Template Composer &rarr;
                            </button>

                            <button
                              type="submit"
                              disabled={quickReplying || !quickReplyText.trim()}
                              className="bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs font-semibold px-4 py-2 rounded-lg flex items-center gap-1.5 transition-colors shadow-sm"
                            >
                              <span className="material-symbols-outlined text-sm">
                                {quickReplying ? "hourglass_top" : "send"}
                              </span>
                              {quickReplying ? "Sending..." : "Send Reply"}
                            </button>
                          </div>
                        </form>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6 text-slate-600">
                    <div className="w-16 h-16 rounded-2xl bg-slate-900 flex items-center justify-center mb-3">
                      <span className="material-symbols-outlined text-3xl">mark_email_unread</span>
                    </div>
                    <h3 className="text-sm font-semibold text-slate-400">Select an email to read</h3>
                    <p className="text-xs text-slate-600 mt-1 max-w-xs">
                      Choose an email from the left pane to view headers, full body, and send instant
                      replies.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 2. SENT VIEW */}
          {/* ========================================================================= */}
          {activeLabel === "sent" && (
            <div className="flex-1 flex overflow-hidden">
              <div className="w-[400px] flex-shrink-0 border-r border-slate-800 flex flex-col bg-slate-950/80">
                <div className="p-3 border-b border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-blue-400 text-lg">send</span>
                    <h2 className="text-xs font-bold uppercase tracking-wider text-slate-300">
                      Outbound Dispatches
                    </h2>
                  </div>
                  <button
                    onClick={() => fetchSent()}
                    disabled={loadingSent}
                    className="p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-400 transition border border-slate-800"
                  >
                    <span
                      className={`material-symbols-outlined text-sm block ${
                        loadingSent ? "animate-spin text-blue-400" : ""
                      }`}
                    >
                      refresh
                    </span>
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto divide-y divide-slate-900">
                  {sentEmails.length === 0 ? (
                    <div className="text-center py-16 px-4 text-slate-600">
                      <p className="text-xs">No sent emails recorded yet.</p>
                    </div>
                  ) : (
                    sentEmails.map((email) => {
                      const isSelected = selectedSentEmail?.id === email.id;
                      return (
                        <div
                          key={email.id}
                          onClick={() => setSelectedSentEmail(email)}
                          className={`p-3.5 cursor-pointer transition-all ${
                            isSelected
                              ? "bg-blue-600/10 border-l-4 border-blue-500"
                              : "hover:bg-slate-900/50 border-l-4 border-transparent"
                          }`}
                        >
                          <div className="flex items-center justify-between text-xs mb-1">
                            <span className="font-semibold text-slate-200 truncate">
                              To: {email.recipientEmail}
                            </span>
                            <span className="text-[10px] text-slate-500">
                              {formatTimeAgo(email.sentAt)}
                            </span>
                          </div>
                          <p className="text-xs text-slate-300 truncate mb-1">{email.subject}</p>
                          <div className="flex items-center gap-2 text-[10px] text-slate-500">
                            <span className="bg-emerald-950/60 text-emerald-400 border border-emerald-800/60 px-1.5 py-0.2 rounded">
                              {email.status}
                            </span>
                            {email.resendId && (
                              <span className="font-mono text-slate-600 truncate">
                                ID: {email.resendId.slice(0, 12)}...
                              </span>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </div>

              {/* Sent Email Details */}
              <div className="flex-1 p-6 overflow-y-auto bg-slate-950">
                {selectedSentEmail ? (
                  <div className="space-y-4 max-w-2xl">
                    <h2 className="text-lg font-bold text-white">{selectedSentEmail.subject}</h2>
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-1.5 text-xs text-slate-300">
                      <div>
                        From:{" "}
                        <span className="text-blue-400 font-mono">
                          {selectedSentEmail.senderEmail}
                        </span>
                      </div>
                      <div>
                        To:{" "}
                        <span className="text-slate-100 font-mono">
                          {selectedSentEmail.recipientEmail}
                        </span>
                      </div>
                      <div>
                        Dispatched:{" "}
                        <span className="text-slate-400">
                          {new Date(selectedSentEmail.sentAt).toLocaleString()}
                        </span>
                      </div>
                      {selectedSentEmail.resendId && (
                        <div>
                          Resend ID:{" "}
                          <span className="text-slate-400 font-mono">
                            {selectedSentEmail.resendId}
                          </span>
                        </div>
                      )}
                    </div>

                    <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 text-sm text-slate-200 whitespace-pre-wrap font-sans">
                      {selectedSentEmail.bodyText || "Branded HTML template dispatched."}
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-20 text-slate-600 text-xs">
                    Select a sent email to view dispatch details.
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 3. DRAFTS VIEW */}
          {/* ========================================================================= */}
          {activeLabel === "drafts" && (
            <div className="flex-1 flex items-center justify-center p-6 text-center text-slate-600">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-slate-900 flex items-center justify-center mx-auto mb-3">
                  <span className="material-symbols-outlined text-3xl">draft</span>
                </div>
                <h3 className="text-sm font-semibold text-slate-400">Drafts is Empty</h3>
                <p className="text-xs text-slate-600 mt-1">
                  Compose a new email and save it for later review.
                </p>
                <button
                  onClick={() => setActiveLabel("compose")}
                  className="mt-4 text-xs px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg transition-colors font-semibold"
                >
                  Start New Compose
                </button>
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* 4. COMPOSE VIEW (with Live Preview) */}
          {/* ========================================================================= */}
          {activeLabel === "compose" && (
            <div className="flex-1 flex overflow-hidden">
              {/* Left: Compose Form */}
              <div className="flex-1 flex flex-col min-w-0 border-r border-slate-800">
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
                      <span className="material-symbols-outlined text-sm">close</span>
                    </button>
                  </div>
                )}

                <form onSubmit={handleSend} className="flex-1 flex flex-col overflow-y-auto">
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
                        <span className="text-slate-700 normal-case">
                          (optional — used in greeting)
                        </span>
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
                        rows={11}
                        className="w-full flex-1 bg-slate-950 border border-slate-700 text-sm text-slate-200 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-500 transition-colors placeholder:text-slate-600 resize-none leading-relaxed"
                      />
                    </div>
                  </div>

                  {/* Bottom Toolbar */}
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
                      <span className="material-symbols-outlined text-sm">lock</span>
                      Sent via Resend · Branded Template
                    </div>
                  </div>
                </form>
              </div>

              {/* Right: Live Preview */}
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
            </div>
          )}
        </main>
      </div>

      {/* Webhook Modal */}
      {showWebhookModal && <WebhookModal onClose={() => setShowWebhookModal(false)} />}

      {/* Simulate Inbound Modal */}
      {showSimulateModal && (
        <SimulateInboundModal
          onClose={() => setShowSimulateModal(false)}
          onSuccess={() => {
            fetchInbox();
            setActiveLabel("inbox");
          }}
        />
      )}
    </div>
  );
}
