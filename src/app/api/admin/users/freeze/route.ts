import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/resend";
import {
  getAccountFrozenEmail,
  getAccountUnfrozenEmail,
} from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isFrozen, frozenReason } = await req.json();

    if (!userId || typeof isFrozen !== "boolean") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updatedUser = await db.freezeUser(userId, isFrozen, frozenReason || "");
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Dispatch security alert email
    const fullName = `${updatedUser.firstName} ${updatedUser.lastName}`;
    if (isFrozen) {
      await sendEmail({
        to: updatedUser.username,
        from: process.env.SENDER_SECURITY || "Beacon Capital Security <security@beaconcapital.site>",
        subject: "SECURITY ALERT: Account Access Restricted",
        templateName: "account_frozen",
        userId: updatedUser.id,
        html: getAccountFrozenEmail(fullName, frozenReason || "Compliance security check"),
      });
    } else {
      await sendEmail({
        to: updatedUser.username,
        from: process.env.SENDER_SECURITY || "Beacon Capital Security <security@beaconcapital.site>",
        subject: "SECURITY NOTICE: Account Access Restored",
        templateName: "account_unfrozen",
        userId: updatedUser.id,
        html: getAccountUnfrozenEmail(fullName),
      });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin User Freeze API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
