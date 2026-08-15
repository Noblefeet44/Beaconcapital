import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { sendEmail } from "@/lib/resend";
import {
  getDepositSettledEmail,
  getTransferSettledEmail,
  getTransferRejectedEmail,
} from "@/lib/email-templates";

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { transactionId, action } = await req.json();

    if (!transactionId || (action !== "approve" && action !== "reject")) {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const newStatus = action === "approve" ? "Settled" : "Rejected";

    const allTransactions = await db.getAllTransactions();
    const targetTx = allTransactions.find((t) => t.id === transactionId);

    if (!targetTx) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 });
    }

    if (targetTx.status !== "Pending") {
      return NextResponse.json({ error: "Transaction is not in Pending state" }, { status: 400 });
    }

    // Update target transaction
    await db.updateTransactionStatus(targetTx.id, newStatus);

    // Also update any other pending transaction sharing the same authCode (such as wire fees)
    if (targetTx.authCode) {
      const associated = allTransactions.filter(
        (t) => t.authCode === targetTx.authCode && t.id !== targetTx.id && t.status === "Pending"
      );
      for (const assoc of associated) {
        await db.updateTransactionStatus(assoc.id, newStatus);
      }
    }

    // Send email notification to account owner
    const targetAccount = await db.getAccountById(targetTx.accountId);
    if (targetAccount) {
      const ownerUser = await db.getUserById(targetAccount.userId);
      if (ownerUser) {
        const isDeposit = targetTx.title.toLowerCase().includes("deposit");
        if (action === "approve") {
          if (isDeposit) {
            await sendEmail({
              to: ownerUser.username,
              from: process.env.SENDER_PAYMENTS,
              subject: `Deposit Cleared - Ref: ${targetTx.authCode || targetTx.id}`,
              templateName: "deposit_settled",
              userId: ownerUser.id,
              html: getDepositSettledEmail({
                userName: `${ownerUser.firstName} ${ownerUser.lastName}`,
                targetAccountMask: targetAccount.accountNumber.slice(-4),
                amount: Math.abs(targetTx.amount),
                referenceNumber: targetTx.authCode || targetTx.id,
              }),
            });
          } else {
            await sendEmail({
              to: ownerUser.username,
              from: process.env.SENDER_PAYMENTS,
              subject: `Transfer Completed - Ref: ${targetTx.authCode || targetTx.id}`,
              templateName: "transfer_settled",
              userId: ownerUser.id,
              html: getTransferSettledEmail({
                userName: `${ownerUser.firstName} ${ownerUser.lastName}`,
                transferType: targetTx.title,
                amount: Math.abs(targetTx.amount),
                recipientName: targetTx.recipientDetails || targetTx.title,
                referenceNumber: targetTx.authCode || targetTx.id,
                date: new Date().toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }),
              }),
            });
          }
        } else {
          await sendEmail({
            to: ownerUser.username,
            from: process.env.SENDER_PAYMENTS,
            subject: `Transfer Declined - Ref: ${targetTx.authCode || targetTx.id}`,
            templateName: "transfer_rejected",
            userId: ownerUser.id,
            html: getTransferRejectedEmail({
              userName: `${ownerUser.firstName} ${ownerUser.lastName}`,
              transferType: targetTx.title,
              amount: Math.abs(targetTx.amount),
              referenceNumber: targetTx.authCode || targetTx.id,
              reason: "Transaction declined during compliance verification review",
            }),
          });
        }
      }
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Approval API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
