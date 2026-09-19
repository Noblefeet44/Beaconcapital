import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const allAccounts = await db.getAccounts(user.id);
    const loans = allAccounts.filter((a) => a.accountType === "loan");

    return NextResponse.json({ success: true, loans });
  } catch (error) {
    console.error("Loans GET API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const { action } = body;

    if (action === "pay") {
      const { loanAccountId, sourceAccountId, amount } = body;
      const numAmount = parseFloat(amount);

      if (!loanAccountId || !sourceAccountId || isNaN(numAmount) || numAmount <= 0) {
        return NextResponse.json({ error: "Invalid payment parameters" }, { status: 400 });
      }

      const result = await db.payLoan({
        userId: user.id,
        loanAccountId,
        sourceAccountId,
        amount: numAmount,
      });

      if (!result.success) {
        return NextResponse.json({ error: result.error || "Payment failed" }, { status: 400 });
      }

      return NextResponse.json({ success: true, message: "Loan payment settled successfully" });
    }

    if (action === "apply") {
      const { loanName, amount, interestRate = 5.25, termMonths = 60 } = body;
      const numAmount = parseFloat(amount);

      if (isNaN(numAmount) || numAmount < 1000) {
        return NextResponse.json({ error: "Minimum loan request amount is $1,000.00" }, { status: 400 });
      }

      const newLoan = await db.createLoanAccount({
        userId: user.id,
        loanName: loanName || "Beacon Commercial Term Facility",
        amount: numAmount,
        interestRate: parseFloat(interestRate),
        termMonths: parseInt(termMonths, 10),
      });

      if (!newLoan) {
        return NextResponse.json({ error: "Failed to create loan facility" }, { status: 500 });
      }

      return NextResponse.json({ success: true, loan: newLoan });
    }

    return NextResponse.json({ error: "Invalid loan action" }, { status: 400 });
  } catch (error) {
    console.error("Loans POST API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
