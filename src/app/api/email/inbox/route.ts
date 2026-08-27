import { NextRequest, NextResponse } from "next/server";
import { inboxDb } from "@/lib/inbox-db";

/**
 * GET /api/email/inbox
 * Returns inbox emails with folder filter, search, and unread counts
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const folder = (searchParams.get("folder") || "inbox") as "inbox" | "starred" | "trash" | "all";
    const search = searchParams.get("search") || "";
    const limit = parseInt(searchParams.get("limit") || "50", 10);
    const offset = parseInt(searchParams.get("offset") || "0", 10);

    const result = await inboxDb.getInboxEmails({
      folder,
      search,
      limit,
      offset,
    });

    return NextResponse.json({
      success: true,
      emails: result.emails,
      total: result.total,
      unreadCount: result.unreadCount,
    });
  } catch (error: any) {
    console.error("[Inbox API GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch inbox emails." },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/email/inbox
 * Updates email read/unread, starred, or folder (trash/archive)
 */
export async function PATCH(req: NextRequest) {
  try {
    const body = await req.json();
    const { id, isRead, isStarred, folder } = body;

    if (!id) {
      return NextResponse.json({ error: "Email ID is required." }, { status: 400 });
    }

    const updated = await inboxDb.updateEmailStatus(id, {
      isRead,
      isStarred,
      folder,
    });

    return NextResponse.json({ success: updated });
  } catch (error: any) {
    console.error("[Inbox API PATCH Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to update email." },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/email/inbox
 * Moves email to trash or permanently deletes
 */
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    let id = searchParams.get("id");
    let permanent = searchParams.get("permanent") === "true";

    if (!id) {
      try {
        const body = await req.json();
        id = body.id;
        permanent = !!body.permanent;
      } catch {
        // no body
      }
    }

    if (!id) {
      return NextResponse.json({ error: "Email ID is required." }, { status: 400 });
    }

    const deleted = await inboxDb.deleteEmail(id, permanent);
    return NextResponse.json({ success: deleted });
  } catch (error: any) {
    console.error("[Inbox API DELETE Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to delete email." },
      { status: 500 }
    );
  }
}

/**
 * POST /api/email/inbox
 * Simulates receiving an incoming email (useful for instant testing from the UI)
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      senderName,
      senderEmail,
      recipientEmail = "support@mail.beaconcapital.site",
      subject,
      bodyText,
      bodyHtml,
    } = body;

    if (!senderEmail || !subject || !bodyText) {
      return NextResponse.json(
        { error: "senderEmail, subject, and bodyText are required." },
        { status: 400 }
      );
    }

    const saved = await inboxDb.saveInboundEmail({
      senderName: senderName || senderEmail.split("@")[0],
      senderEmail,
      recipientEmail,
      subject,
      bodyText,
      bodyHtml,
      replyTo: senderEmail,
    });

    return NextResponse.json({
      success: true,
      email: saved,
      message: "Test incoming email created successfully.",
    });
  } catch (error: any) {
    console.error("[Inbox API POST Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to create simulated email." },
      { status: 500 }
    );
  }
}
