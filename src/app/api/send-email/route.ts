import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import { getSupportEmail } from "@/lib/email-templates";

const ACCESS_PASSWORD = "Email@password";

export async function POST(req: NextRequest) {
  try {
    const { from, to, subject, message, recipientName, password } = await req.json();

    // Validate password
    if (password !== ACCESS_PASSWORD) {
      return NextResponse.json(
        { error: "Unauthorized. Invalid access password." },
        { status: 401 }
      );
    }

    // Validate required fields
    if (!from || !to || !subject || !message) {
      return NextResponse.json(
        { error: "From, To, Subject, and Message are all required." },
        { status: 400 }
      );
    }

    // Validate sender domain
    const fromEmailMatch = from.match(/<([^>]+)>$/);
    const rawFromEmail = fromEmailMatch ? fromEmailMatch[1] : from;
    if (!rawFromEmail.endsWith("@mail.beaconcapital.site")) {
      return NextResponse.json(
        { error: "Sender must use the @mail.beaconcapital.site domain." },
        { status: 400 }
      );
    }

    // Extract sender label from the "from" field for the template footer
    const senderLabelMatch = from.match(/^([^<]+)</);
    const senderLabel = senderLabelMatch ? senderLabelMatch[1].trim() : "Beacon Capital";

    // Generate branded email HTML using the support template
    const html = getSupportEmail({
      recipientName: recipientName || undefined,
      messageBody: message,
      senderLabel,
    });

    // Send via Resend + audit log
    const result = await sendEmail({
      to,
      from,
      subject,
      templateName: "support_compose",
      html,
      metadata: {
        source: "email_console",
        senderLabel,
      },
    });

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || "Failed to send email via Resend." },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      resendId: result.id,
      message: `Email sent to ${to} successfully.`,
    });
  } catch (error: any) {
    console.error("[Send-Email API Error]", error);
    return NextResponse.json(
      { error: error.message || "Internal server error." },
      { status: 500 }
    );
  }
}
