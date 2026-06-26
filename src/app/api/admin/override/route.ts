import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const {
      accountId,
      type, // 'credit' | 'debit'
      amount,
      effectiveDate,
      reason,
      justification,
      authCode,
    } = await req.json();

    if (!accountId || !type || !amount || amount <= 0 || !effectiveDate || !reason || !authCode) {
      return NextResponse.json(
        { error: "Required fields are missing or invalid" },
        { status: 400 }
      );
    }

    const account = await db.getAccountById(accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Execute ledger override transaction
    const transaction = await db.executeOverride({
      accountId,
      type,
      amount: parseFloat(amount),
      effectiveDate,
      reason,
      justification: justification || "",
      authCode,
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Admin Override API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
