import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/resend";
import {
  getApplicationApprovedEmail,
  getApplicationRejectedEmail,
} from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }

    const { userId, action, reason } = await req.json();

    if (!userId || !action || !["approve", "reject"].includes(action)) {
      return NextResponse.json(
        { error: "Invalid parameters. 'userId' and 'action' ('approve' | 'reject') are required." },
        { status: 400 }
      );
    }

    const targetUser = await db.getUserById(userId);
    if (!targetUser) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    let updatedUser;
    let emailDetails;

    if (action === "approve") {
      updatedUser = await db.updateUserStatus(userId, "Active");
      const fullName = `${targetUser.firstName} ${targetUser.lastName}`;
      emailDetails = {
        recipient: targetUser.username,
        recipientName: fullName,
        subject: "Your Beacon Capital Account Has Been Approved!",
        body: `Dear ${targetUser.firstName},\n\nWe are pleased to inform you that Customer Service and Bank Compliance have completed your background verification. Your Beacon Capital account is now APPROVED and ACTIVE.`,
      };

      await sendEmail({
        to: targetUser.username,
        from: process.env.SENDER_SUPPORT || "Beacon Capital Support <support@beaconcapital.site>",
        subject: "Your Beacon Capital Account Has Been Approved!",
        templateName: "application_approved",
        userId: targetUser.id,
        html: getApplicationApprovedEmail(fullName),
      });
    } else {
      const rejectionReason = reason || "Background verification check failed to meet compliance requirements.";
      updatedUser = await db.updateUserStatus(userId, "Rejected", rejectionReason);
      emailDetails = null; // No email sent on rejection per requirement
    }

    if (!updatedUser) {
      return NextResponse.json({ error: "Failed to update applicant status" }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: action === "approve" ? "Applicant approved successfully!" : "Applicant application rejected.",
      user: {
        id: updatedUser.id,
        username: updatedUser.username,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        status: updatedUser.status,
        rejectionReason: updatedUser.rejectionReason,
      },
      emailDetails,
    });
  } catch (error) {
    console.error("Admin User Status API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
