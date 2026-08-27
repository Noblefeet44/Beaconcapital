import { NextRequest, NextResponse } from "next/server";
import { inboxDb } from "@/lib/inbox-db";

/**
 * GET /api/email/sent
 * Returns history of sent emails
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const limit = parseInt(searchParams.get("limit") || "50", 10);

    const sentEmails = await inboxDb.getSentEmails(limit);

    return NextResponse.json({
      success: true,
      emails: sentEmails,
      total: sentEmails.length,
    });
  } catch (error: any) {
    console.error("[Sent API GET Error]", error);
    return NextResponse.json(
      { error: error.message || "Failed to fetch sent emails." },
      { status: 500 }
    );
  }
}
