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
      method, // 'wire' | 'ach' | 'zelle' | 'deposit' | 'billpay'
      amount,
      effectiveDate,
      customTime,
      reference,
    } = await req.json();

    if (!accountId || !type || !method || !amount || parseFloat(amount) <= 0 || !effectiveDate) {
      return NextResponse.json(
        { error: "Required fields are missing or invalid" },
        { status: 400 }
      );
    }

    const account = await db.getAccountById(accountId);
    if (!account) {
      return NextResponse.json({ error: "Account not found" }, { status: 404 });
    }

    // Execute adjustment
    const transaction = await db.executeAdjustment({
      accountId,
      type,
      method,
      amount: parseFloat(amount),
      effectiveDate,
      customTime: customTime || undefined,
      reference: reference || undefined,
    });

    return NextResponse.json({
      success: true,
      transaction,
    });
  } catch (error) {
    console.error("Admin Adjust API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
