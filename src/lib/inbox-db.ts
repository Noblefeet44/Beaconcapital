import { supabase } from "./supabase";
import fs from "fs";
import path from "path";

export interface InboxEmail {
  id: string;
  senderName: string;
  senderEmail: string;
  recipientEmail: string; // e.g. support@mail.beaconcapital.site
  subject: string;
  bodyText: string;
  bodyHtml?: string;
  receivedAt: string;
  isRead: boolean;
  isStarred: boolean;
  folder: "inbox" | "sent" | "starred" | "trash" | "archive";
  replyTo?: string;
  messageId?: string;
  headers?: Record<string, any>;
  attachments?: Array<{
    filename: string;
    contentType: string;
    size?: number;
    url?: string;
  }>;
  threadId?: string;
}

export interface SentEmailLog {
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

// Local fallback store path
const DATA_DIR = path.join(process.cwd(), "data");
const INBOX_FILE = path.join(DATA_DIR, "inbox_emails.json");
const SENT_FILE = path.join(DATA_DIR, "sent_emails.json");

// Initial mock emails for high quality experience if storage is empty
const INITIAL_INBOX_EMAILS: InboxEmail[] = [
  {
    id: "inbox_seed_1",
    senderName: "Marcus Vance",
    senderEmail: "marcus.vance@vanceholdings.com",
    recipientEmail: "support@mail.beaconcapital.site",
    subject: "Inquiry regarding Institutional Wire Settlement Timelines",
    bodyText: "Hello Support Team,\n\nWe are preparing a wire disbursement for our commercial account and would like to confirm the daily cut-off times for same-day Fedwire settlement.\n\nCould you please advise on whether ACH credit limits can be increased for next quarter?\n\nBest regards,\nMarcus Vance\nManaging Director, Vance Holdings LLC",
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <p>Hello Support Team,</p>
      <p>We are preparing a wire disbursement for our commercial account and would like to confirm the daily cut-off times for same-day Fedwire settlement.</p>
      <p>Could you please advise on whether ACH credit limits can be increased for next quarter?</p>
      <br/>
      <p>Best regards,<br/><strong>Marcus Vance</strong><br/>Managing Director, Vance Holdings LLC</p>
    </div>`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(), // 45 mins ago
    isRead: false,
    isStarred: true,
    folder: "inbox",
    replyTo: "marcus.vance@vanceholdings.com",
    messageId: "<msg-vance-001@vanceholdings.com>",
  },
  {
    id: "inbox_seed_2",
    senderName: "Eleanor Sterling",
    senderEmail: "e.sterling@sterlingpartners.io",
    recipientEmail: "support@mail.beaconcapital.site",
    subject: "Re: Application Approved - Beacon Capital Institutional Account",
    bodyText: "Thank you for the quick approval on our institutional account setup. We have uploaded our authorized signatory roster. Please let us know once the secondary portal access credentials have been provisioned.\n\nWarm regards,\nEleanor Sterling",
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <p>Thank you for the quick approval on our institutional account setup. We have uploaded our authorized signatory roster. Please let us know once the secondary portal access credentials have been provisioned.</p>
      <br/>
      <p>Warm regards,<br/><strong>Eleanor Sterling</strong><br/>Sterling Partners</p>
    </div>`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), // 3 hours ago
    isRead: true,
    isStarred: false,
    folder: "inbox",
    replyTo: "e.sterling@sterlingpartners.io",
    messageId: "<msg-sterling-002@sterlingpartners.io>",
  },
  {
    id: "inbox_seed_3",
    senderName: "David Zhao",
    senderEmail: "david.zhao@apexledger.tech",
    recipientEmail: "support@mail.beaconcapital.site",
    subject: "API Integration & Webhook Inbound Query",
    bodyText: "Hi Beacon Capital Support,\n\nWe are testing the automated balance inquiry webhook endpoints and wanted to confirm if the staging environment supports simulated inbound wire credits.\n\nThank you,\nDavid",
    bodyHtml: `<div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; color: #1e293b; line-height: 1.6;">
      <p>Hi Beacon Capital Support,</p>
      <p>We are testing the automated balance inquiry webhook endpoints and wanted to confirm if the staging environment supports simulated inbound wire credits.</p>
      <br/>
      <p>Thank you,<br/><strong>David Zhao</strong><br/>Apex Ledger Tech</p>
    </div>`,
    receivedAt: new Date(Date.now() - 1000 * 60 * 60 * 18).toISOString(), // 18 hours ago
    isRead: true,
    isStarred: false,
    folder: "inbox",
    replyTo: "david.zhao@apexledger.tech",
    messageId: "<msg-zhao-003@apexledger.tech>",
  }
];

function ensureDataDir() {
  try {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }
  } catch (err) {
    console.error("[Inbox DB] Failed to create data dir:", err);
  }
}

function readLocalInbox(): InboxEmail[] {
  ensureDataDir();
  try {
    if (fs.existsSync(INBOX_FILE)) {
      const content = fs.readFileSync(INBOX_FILE, "utf-8");
      return JSON.parse(content);
    } else {
      fs.writeFileSync(INBOX_FILE, JSON.stringify(INITIAL_INBOX_EMAILS, null, 2), "utf-8");
      return INITIAL_INBOX_EMAILS;
    }
  } catch (err) {
    console.error("[Inbox DB] Error reading local inbox:", err);
    return INITIAL_INBOX_EMAILS;
  }
}

function writeLocalInbox(emails: InboxEmail[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(INBOX_FILE, JSON.stringify(emails, null, 2), "utf-8");
  } catch (err) {
    console.error("[Inbox DB] Error writing local inbox:", err);
  }
}

function readLocalSent(): SentEmailLog[] {
  ensureDataDir();
  try {
    if (fs.existsSync(SENT_FILE)) {
      const content = fs.readFileSync(SENT_FILE, "utf-8");
      return JSON.parse(content);
    }
    return [];
  } catch (err) {
    console.error("[Inbox DB] Error reading local sent:", err);
    return [];
  }
}

function writeLocalSent(sent: SentEmailLog[]): void {
  ensureDataDir();
  try {
    fs.writeFileSync(SENT_FILE, JSON.stringify(sent, null, 2), "utf-8");
  } catch (err) {
    console.error("[Inbox DB] Error writing local sent:", err);
  }
}

export const inboxDb = {
  /**
   * Get all received emails with folder, search, and pagination
   */
  async getInboxEmails(options?: {
    folder?: "inbox" | "starred" | "trash" | "all";
    search?: string;
    limit?: number;
    offset?: number;
  }): Promise<{
    emails: InboxEmail[];
    total: number;
    unreadCount: number;
  }> {
    const folder = options?.folder || "inbox";
    const search = options?.search?.toLowerCase().trim() || "";
    const limit = options?.limit || 50;
    const offset = options?.offset || 0;

    let emails: InboxEmail[] = [];

    // 1. Try fetching from Supabase inbox_emails
    try {
      let query = supabase.from("inbox_emails").select("*", { count: "exact" });

      if (folder === "starred") {
        query = query.eq("is_starred", true).neq("folder", "trash");
      } else if (folder === "trash") {
        query = query.eq("folder", "trash");
      } else if (folder === "inbox") {
        query = query.eq("folder", "inbox");
      }

      if (search) {
        query = query.or(
          `subject.ilike.%${search}%,sender_name.ilike.%${search}%,sender_email.ilike.%${search}%,body_text.ilike.%${search}%`
        );
      }

      query = query.order("received_at", { ascending: false }).range(offset, offset + limit - 1);

      const { data, error } = await query;

      if (!error && data && data.length > 0) {
        emails = data.map((item: any) => ({
          id: item.id,
          senderName: item.sender_name || item.sender_email?.split("@")[0] || "Unknown",
          senderEmail: item.sender_email,
          recipientEmail: item.recipient_email || "support@mail.beaconcapital.site",
          subject: item.subject || "(No Subject)",
          bodyText: item.body_text || "",
          bodyHtml: item.body_html || item.body_text || "",
          receivedAt: item.received_at,
          isRead: item.is_read ?? false,
          isStarred: item.is_starred ?? false,
          folder: item.folder || "inbox",
          replyTo: item.reply_to,
          messageId: item.message_id,
          headers: item.headers,
          attachments: item.attachments,
          threadId: item.thread_id,
        }));
      } else {
        // Fallback to local store
        emails = readLocalInbox();
      }
    } catch (err) {
      console.warn("[Inbox DB] Supabase query failed, falling back to local file:", err);
      emails = readLocalInbox();
    }

    // Filter & search locally if loaded from file or fallback
    let filtered = emails;
    if (folder === "starred") {
      filtered = filtered.filter((e) => e.isStarred && e.folder !== "trash");
    } else if (folder === "trash") {
      filtered = filtered.filter((e) => e.folder === "trash");
    } else if (folder === "inbox") {
      filtered = filtered.filter((e) => e.folder === "inbox");
    }

    if (search) {
      filtered = filtered.filter(
        (e) =>
          e.subject.toLowerCase().includes(search) ||
          e.senderName.toLowerCase().includes(search) ||
          e.senderEmail.toLowerCase().includes(search) ||
          e.bodyText.toLowerCase().includes(search)
      );
    }

    // Sort newest first
    filtered.sort(
      (a, b) => new Date(b.receivedAt).getTime() - new Date(a.receivedAt).getTime()
    );

    const unreadCount = emails.filter((e) => !e.isRead && e.folder === "inbox").length;

    return {
      emails: filtered.slice(offset, offset + limit),
      total: filtered.length,
      unreadCount,
    };
  },

  /**
   * Save a newly received inbound email
   */
  async saveInboundEmail(data: {
    senderName?: string;
    senderEmail: string;
    recipientEmail?: string;
    subject: string;
    bodyText: string;
    bodyHtml?: string;
    replyTo?: string;
    messageId?: string;
    headers?: Record<string, any>;
    attachments?: Array<{
      filename: string;
      contentType: string;
      size?: number;
      url?: string;
    }>;
  }): Promise<InboxEmail> {
    const id = "msg_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    const now = new Date().toISOString();

    const senderName =
      data.senderName ||
      data.senderEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase()) ||
      "External Sender";

    const newEmail: InboxEmail = {
      id,
      senderName,
      senderEmail: data.senderEmail,
      recipientEmail: data.recipientEmail || "support@mail.beaconcapital.site",
      subject: data.subject || "(No Subject)",
      bodyText: data.bodyText || "",
      bodyHtml: data.bodyHtml || (data.bodyText ? `<p>${data.bodyText.replace(/\n/g, "<br/>")}</p>` : ""),
      receivedAt: now,
      isRead: false,
      isStarred: false,
      folder: "inbox",
      replyTo: data.replyTo || data.senderEmail,
      messageId: data.messageId || `<${id}@mail.beaconcapital.site>`,
      headers: data.headers,
      attachments: data.attachments || [],
    };

    // 1. Try Supabase insert
    try {
      await supabase.from("inbox_emails").insert({
        id: newEmail.id,
        sender_name: newEmail.senderName,
        sender_email: newEmail.senderEmail,
        recipient_email: newEmail.recipientEmail,
        subject: newEmail.subject,
        body_text: newEmail.bodyText,
        body_html: newEmail.bodyHtml,
        received_at: newEmail.receivedAt,
        is_read: newEmail.isRead,
        is_starred: newEmail.isStarred,
        folder: newEmail.folder,
        reply_to: newEmail.replyTo,
        message_id: newEmail.messageId,
        headers: newEmail.headers,
        attachments: newEmail.attachments,
      });
    } catch (err) {
      console.warn("[Inbox DB] Supabase insert failed:", err);
    }

    // 2. Always maintain local store
    const localEmails = readLocalInbox();
    localEmails.unshift(newEmail);
    writeLocalInbox(localEmails);

    return newEmail;
  },

  /**
   * Update status of an inbox email (isRead, isStarred, folder)
   */
  async updateEmailStatus(
    id: string,
    updates: Partial<Pick<InboxEmail, "isRead" | "isStarred" | "folder">>
  ): Promise<boolean> {
    // 1. Update Supabase
    try {
      const dbUpdates: any = {};
      if (updates.isRead !== undefined) dbUpdates.is_read = updates.isRead;
      if (updates.isStarred !== undefined) dbUpdates.is_starred = updates.isStarred;
      if (updates.folder !== undefined) dbUpdates.folder = updates.folder;

      await supabase.from("inbox_emails").update(dbUpdates).eq("id", id);
    } catch (err) {
      console.warn("[Inbox DB] Supabase update failed:", err);
    }

    // 2. Update local
    const localEmails = readLocalInbox();
    const idx = localEmails.findIndex((e) => e.id === id);
    if (idx !== -1) {
      localEmails[idx] = { ...localEmails[idx], ...updates };
      writeLocalInbox(localEmails);
      return true;
    }
    return false;
  },

  /**
   * Delete an email or move to trash
   */
  async deleteEmail(id: string, permanent: boolean = false): Promise<boolean> {
    if (permanent) {
      try {
        await supabase.from("inbox_emails").delete().eq("id", id);
      } catch (err) {
        console.warn("[Inbox DB] Supabase delete failed:", err);
      }
      const localEmails = readLocalInbox().filter((e) => e.id !== id);
      writeLocalInbox(localEmails);
      return true;
    } else {
      return this.updateEmailStatus(id, { folder: "trash" });
    }
  },

  /**
   * Record a sent email
   */
  async saveSentEmail(data: {
    senderEmail: string;
    recipientEmail: string;
    recipientName?: string;
    subject: string;
    bodyText?: string;
    bodyHtml?: string;
    resendId?: string;
    status?: "sent" | "failed" | "delivered";
    templateName?: string;
  }): Promise<SentEmailLog> {
    const id = "sent_" + Math.random().toString(36).substring(2, 11) + "_" + Date.now().toString(36);
    const sentRecord: SentEmailLog = {
      id,
      senderEmail: data.senderEmail,
      recipientEmail: data.recipientEmail,
      recipientName: data.recipientName,
      subject: data.subject,
      bodyText: data.bodyText,
      bodyHtml: data.bodyHtml,
      sentAt: new Date().toISOString(),
      resendId: data.resendId,
      status: data.status || "sent",
      templateName: data.templateName || "support_compose",
    };

    // Try Supabase insert
    try {
      await supabase.from("email_logs").insert({
        recipient_email: data.recipientEmail,
        sender_email: data.senderEmail,
        subject: data.subject,
        template_name: data.templateName || "support_compose",
        resend_id: data.resendId,
        status: data.status || "sent",
        metadata: {
          recipientName: data.recipientName,
          bodyText: data.bodyText,
        },
      });
    } catch (err) {
      console.warn("[Inbox DB] Supabase sent log failed:", err);
    }

    const localSent = readLocalSent();
    localSent.unshift(sentRecord);
    writeLocalSent(localSent);

    return sentRecord;
  },

  /**
   * Get all sent emails
   */
  async getSentEmails(limit: number = 50): Promise<SentEmailLog[]> {
    try {
      const { data, error } = await supabase
        .from("email_logs")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit);

      if (!error && data && data.length > 0) {
        return data.map((item: any) => ({
          id: item.id || item.resend_id,
          senderEmail: item.sender_email,
          recipientEmail: item.recipient_email,
          recipientName: item.metadata?.recipientName,
          subject: item.subject,
          bodyText: item.metadata?.bodyText || "",
          sentAt: item.created_at,
          resendId: item.resend_id,
          status: item.status || "sent",
          templateName: item.template_name,
        }));
      }
    } catch (err) {
      console.warn("[Inbox DB] Supabase getSentEmails failed:", err);
    }

    return readLocalSent().slice(0, limit);
  },
};
