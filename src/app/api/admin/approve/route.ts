import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Admin Approval API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
