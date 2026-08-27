import { NextRequest, NextResponse } from "next/server";
import { inboxDb } from "@/lib/inbox-db";

/**
 * Inbound Email Webhook
 * Handles incoming emails and replies sent to support@mail.beaconcapital.site
 * Compatible with Resend Inbound Webhooks, Svix, SendGrid, Postmark, and custom webhooks.
 */
export async function POST(req: NextRequest) {
  try {
    const rawBody = await req.json();

    // 1. Unpack payload from different provider structures (Resend, SendGrid, Postmark, etc.)
    let fromRaw = "";
    let toRaw: string | string[] = "";
    let subject = "";
    let text = "";
    let html = "";
    let replyTo = "";
    let messageId = "";
    let headers: Record<string, any> = {};
    let attachments: any[] = [];

    // Resend Inbound Webhook format: { type: "email.received", data: { from, to, subject, text, html, ... } }
    if (rawBody.type === "email.received" && rawBody.data) {
      const data = rawBody.data;
      fromRaw = data.from || "";
      toRaw = data.to || "";
      subject = data.subject || "";
      text = data.text || "";
      html = data.html || "";
      replyTo = Array.isArray(data.reply_to) ? data.reply_to[0] : (data.reply_to || "");
      messageId = data.email_id || data.message_id || "";
      headers = data.headers || {};
      attachments = data.attachments || [];
    }
    // Generic direct format: { from, to, subject, text, html, ... }
    else {
      fromRaw = rawBody.from || rawBody.sender || rawBody["from-address"] || "";
      toRaw = rawBody.to || rawBody.recipient || rawBody["to-address"] || "support@mail.beaconcapital.site";
      subject = rawBody.subject || "(No Subject)";
      text = rawBody.text || rawBody.body || rawBody["stripped-text"] || rawBody.message || "";
      html = rawBody.html || rawBody["stripped-html"] || rawBody.bodyHtml || "";
      replyTo = rawBody.replyTo || rawBody["reply-to"] || "";
      messageId = rawBody.messageId || rawBody["message-id"] || "";
      headers = rawBody.headers || {};
      attachments = rawBody.attachments || [];
    }

    // 2. Parse Sender Name and Email Address
    let senderName = "";
    let senderEmail = "";

    if (typeof fromRaw === "string") {
      const nameAndEmailMatch = fromRaw.match(/^(.*?)\s*<([^>]+)>$/);
      if (nameAndEmailMatch) {
        senderName = nameAndEmailMatch[1].replace(/["']/g, "").trim();
        senderEmail = nameAndEmailMatch[2].trim().toLowerCase();
      } else {
        senderEmail = fromRaw.trim().toLowerCase();
        senderName = senderEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
      }
    } else if (typeof fromRaw === "object" && fromRaw !== null) {
      senderName = (fromRaw as any).name || (fromRaw as any).displayName || "";
      senderEmail = (fromRaw as any).email || (fromRaw as any).address || "";
    }

    // Fallback if missing
    if (!senderEmail) {
      senderEmail = "unknown-sender@mail.beaconcapital.site";
    }
    if (!senderName) {
      senderName = senderEmail.split("@")[0].replace(/[._-]/g, " ").replace(/\b\w/g, (l) => l.toUpperCase());
    }

    // 3. Parse Recipient Address
    let recipientEmail = "support@mail.beaconcapital.site";
    if (Array.isArray(toRaw) && toRaw.length > 0) {
      recipientEmail = String(toRaw[0]);
    } else if (typeof toRaw === "string" && toRaw.trim()) {
      const toMatch = toRaw.match(/<([^>]+)>/);
      recipientEmail = toMatch ? toMatch[1] : toRaw.trim();
    }

    // 4. Clean and format body
    if (!text && html) {
      text = html.replace(/<[^>]*>?/gm, "").trim();
    }

    // 5. Persist to Inbox database
    const saved = await inboxDb.saveInboundEmail({
      senderName,
      senderEmail,
      recipientEmail,
      subject: subject || "(No Subject)",
      bodyText: text,
      bodyHtml: html || (text ? `<p style="white-space: pre-wrap; font-family: sans-serif;">${text.replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/\n/g, "<br/>")}</p>` : ""),
      replyTo: replyTo || senderEmail,
      messageId: messageId || `<inbound-${Date.now()}@beaconcapital.site>`,
      headers,
      attachments: attachments.map((a: any) => ({
        filename: a.filename || a.name || "attachment",
        contentType: a.contentType || a.type || "application/octet-stream",
        size: a.size,
        url: a.url,
      })),
    });

    console.log(`[Inbound Email Webhook] Successfully processed incoming email from ${senderEmail} to ${recipientEmail} with ID: ${saved.id}`);

    return NextResponse.json({
      success: true,
      id: saved.id,
      message: "Email received and queued into Beacon Inbox.",
    });
  } catch (error: any) {
    console.error("[Inbound Email Webhook Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to process inbound email." },
      { status: 500 }
    );
  }
}

/**
 * GET Handler for Webhook Verification (Health check)
 */
export async function GET() {
  return NextResponse.json({
    status: "active",
    endpoint: "/api/email/inbound",
    domain: "mail.beaconcapital.site",
    supportedEvents: ["email.received", "direct.post"],
    timestamp: new Date().toISOString(),
  });
}
