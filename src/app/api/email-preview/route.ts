import { NextRequest, NextResponse } from "next/server";
import { sendEmail } from "@/lib/resend";
import {
  getWelcomeVerificationEmail,
  getApplicationSubmittedEmail,
  getApplicationApprovedEmail,
  getApplicationRejectedEmail,
  getTransferInitiatedEmail,
  getTransferReceivedEmail,
  getTransferSettledEmail,
  getTransferRejectedEmail,
  getDepositReceivedPendingEmail,
  getDepositSettledEmail,
  getLedgerAdjustmentNoticeEmail,
  getAccountFrozenEmail,
  getAccountUnfrozenEmail,
  getPasswordResetEmail,
  getAdminNewApplicantEmail,
  getAdminHighValueTxEmail,
} from "@/lib/email-templates";

export function getMockTemplateHtml(templateKey: string): string {
  const sampleName = "Alex Mercer";
  const sampleDate = new Date().toLocaleDateString("en-US", {
    month: "short",
    day: "2-digit",
    year: "numeric",
  }) + " 14:30:00 EST";

  switch (templateKey) {
    case "welcome_verification":
      return getWelcomeVerificationEmail(sampleName, "https://beaconcapital.site/verify?token=mock_123");
    
    case "application_submitted":
      return getApplicationSubmittedEmail(sampleName);
    
    case "application_approved":
      return getApplicationApprovedEmail(sampleName);
    
    case "application_rejected":
      return getApplicationRejectedEmail(sampleName, "Identity document expired prior to application date.");
    
    case "transfer_initiated":
      return getTransferInitiatedEmail({
        userName: sampleName,
        transferType: "Wire Transfer",
        amount: 15400.00,
        fee: 20.00,
        recipientName: "J.P. Morgan Chase / Horizon Holdings LLC",
        recipientDetails: "Bank: Chase N.A., Routing: 021000021, Acct: ****8819",
        sendingAccountMask: "4912",
        referenceNumber: "TXN-9418-P",
        date: sampleDate,
      });

    case "transfer_received":
      return getTransferReceivedEmail({
        senderName: sampleName,
        transferType: "Zelle Transfer",
        amount: 350.00,
        recipientName: "chimayyy@outlook.com",
        referenceNumber: "ZEL-4019-P",
        date: sampleDate,
        note: "Dinner & Drinks reimbursement",
      });

    case "transfer_settled":
      return getTransferSettledEmail({
        userName: sampleName,
        transferType: "Wire Transfer OUT",
        amount: 15400.00,
        recipientName: "Horizon Holdings LLC",
        referenceNumber: "TXN-9418-P",
        date: sampleDate,
      });

    case "transfer_rejected":
      return getTransferRejectedEmail({
        userName: sampleName,
        transferType: "Wire Transfer OUT",
        amount: 15400.00,
        referenceNumber: "TXN-9418-P",
        reason: "Compliance hold: Destination routing number flagged for secondary verification.",
      });

    case "zelle_initiated":
      return getTransferInitiatedEmail({
        userName: sampleName,
        transferType: "Zelle Transfer",
        amount: 350.00,
        recipientName: "sarah.jenkins@example.com",
        sendingAccountMask: "4912",
        referenceNumber: "ZEL-4019-P",
        date: sampleDate,
      });

    case "billpay_initiated":
      return getTransferInitiatedEmail({
        userName: sampleName,
        transferType: "Bill Payment",
        amount: 1250.00,
        recipientName: "ConEdison Electric Utility",
        sendingAccountMask: "4912",
        referenceNumber: "BPY-8812-P",
        date: sampleDate,
      });

    case "deposit_received_pending":
      return getDepositReceivedPendingEmail({
        userName: sampleName,
        targetAccountName: "Beacon Premier Checking",
        targetAccountMask: "4912",
        amount: 4850.00,
        referenceNumber: "REF-3910-X",
        date: sampleDate,
      });

    case "deposit_settled":
      return getDepositSettledEmail({
        userName: sampleName,
        targetAccountMask: "4912",
        amount: 4850.00,
        referenceNumber: "REF-3910-X",
      });

    case "ledger_adjustment_notice":
      return getLedgerAdjustmentNoticeEmail({
        userName: sampleName,
        accountMask: "4912",
        adjustmentType: "credit",
        method: "WIRE DEPOSIT",
        amount: 25000.00,
        reference: "MAN-9912",
        date: sampleDate,
      });

    case "account_frozen":
      return getAccountFrozenEmail(sampleName, "Automated compliance lock triggered due to multi-device login activity.");

    case "account_unfrozen":
      return getAccountUnfrozenEmail(sampleName);

    case "password_reset":
      return getPasswordResetEmail(sampleName, "https://beaconcapital.site/reset-password?token=mock_reset_456");

    case "admin_new_applicant_alert":
      return getAdminNewApplicantEmail("Eleanor Vance", "eleanor.vance@example.com");

    case "admin_high_value_tx_alert":
      return getAdminHighValueTxEmail({
        userName: sampleName,
        transferType: "Outgoing Wire Transfer",
        amount: 75000.00,
        referenceNumber: "TXN-9941-P",
      });

    default:
      return `<h2>Template "${templateKey}" not found</h2>`;
  }
}

// GET handler: renders raw HTML in browser
export async function GET(req: NextRequest) {
  const template = req.nextUrl.searchParams.get("template") || "transfer_initiated";
  const html = getMockTemplateHtml(template);

  return new NextResponse(html, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
    },
  });
}

// POST handler: send real test email via Resend
export async function POST(req: NextRequest) {
  try {
    const { template, testEmail } = await req.json();
    if (!template || !testEmail) {
      return NextResponse.json({ error: "template and testEmail are required" }, { status: 400 });
    }

    const html = getMockTemplateHtml(template);

    const res = await sendEmail({
      to: testEmail,
      from: process.env.SENDER_SUPPORT || "Beacon Capital Support <support@beaconcapital.site>",
      subject: `[TEST PREVIEW] Beacon Capital Template: ${template}`,
      templateName: `preview_${template}`,
      html,
    });

    if (!res.success) {
      return NextResponse.json({ error: res.error || "Failed to send test email" }, { status: 500 });
    }

    return NextResponse.json({ success: true, resendId: res.id });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Internal server error" }, { status: 500 });
  }
}
