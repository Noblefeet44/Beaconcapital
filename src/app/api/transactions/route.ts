import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = req.nextUrl.searchParams;
    const accountId = searchParams.get("accountId");

    if (accountId) {
      // Make sure the account belongs to the user (unless admin)
      const account = await db.getAccountById(accountId);
      if (!account || (account.userId !== user.id && user.role !== "admin")) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
      }
      const transactions = await db.getTransactions(accountId);
      return NextResponse.json({ success: true, transactions });
    }

    if (user.role === "admin") {
      const allTxs = await db.getAllTransactions();
      return NextResponse.json({ success: true, transactions: allTxs });
    }

    // Otherwise return all transactions across all user accounts
    const accounts = await db.getAccounts(user.id);
    const allTxs = [];
    for (const acc of accounts) {
      const txs = await db.getTransactions(acc.id);
      allTxs.push(...txs);
    }
    
    // Sort combined transactions chronologically desc
    allTxs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return NextResponse.json({ success: true, transactions: allTxs });
  } catch (error) {
    console.error("Get Transactions API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const dbUser = await db.getUserById(user.id);
    if (dbUser?.isFrozen) {
      return NextResponse.json(
        { error: `Declined: Your account has been frozen. Reason: ${dbUser.frozenReason}` },
        { status: 403 }
      );
    }

    const {
      type,
      sourceAccountId,
      targetAccountId,
      amount,
      recipient,
      biller,
      recipientName,
      bankName,
      accountNumber,
      routingNumber,
      transferType, // 'ach' | 'wire'
    } = await req.json();

    if (!type || !amount || parseFloat(amount) <= 0) {
      return NextResponse.json({ error: "Invalid transaction parameters" }, { status: 400 });
    }

    const parsedAmount = parseFloat(amount);
    const todayStr = new Date().toISOString().split("T")[0];

    // Helper for Reference Numbers
    const generateRef = (prefix: string, suffix: string) => {
      return `${prefix}-${Math.floor(1000 + Math.random() * 9000)}-${suffix}`;
    };

    // 1. INTERNAL TRANSFER
    if (type === "transfer") {
      if (!sourceAccountId || !targetAccountId) {
        return NextResponse.json({ error: "Source and target accounts are required" }, { status: 400 });
      }

      const srcAcc = await db.getAccountById(sourceAccountId);
      const destAcc = await db.getAccountById(targetAccountId);

      if (!srcAcc || srcAcc.userId !== user.id) {
        return NextResponse.json({ error: "Invalid source account" }, { status: 400 });
      }
      if (!destAcc || destAcc.userId !== user.id) {
        return NextResponse.json({ error: "Invalid target account" }, { status: 400 });
      }

      if (srcAcc.balance < parsedAmount) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
      }

      await db.createTransaction({
        accountId: sourceAccountId,
        title: "Internal Transfer OUT",
        description: `Transfer to account ${destAcc.accountType === "checking" ? "Checking" : "Savings"} ${destAcc.accountNumber}`,
        amount: -parsedAmount,
        status: "Settled",
        effectiveDate: todayStr,
      });

      await db.createTransaction({
        accountId: targetAccountId,
        title: "Internal Transfer IN",
        description: `Transfer from account ${srcAcc.accountType === "checking" ? "Checking" : "Savings"} ${srcAcc.accountNumber}`,
        amount: parsedAmount,
        status: "Settled",
        effectiveDate: todayStr,
      });

      return NextResponse.json({ success: true });
    }

    // 2. EXTERNAL TRANSFER (ACH or Wire)
    if (type === "external_transfer") {
      if (!sourceAccountId || !recipientName || !bankName || !accountNumber || !routingNumber || !transferType) {
        return NextResponse.json({ error: "All recipient and parameters are required" }, { status: 400 });
      }

      const srcAcc = await db.getAccountById(sourceAccountId);
      if (!srcAcc || srcAcc.userId !== user.id) {
        return NextResponse.json({ error: "Invalid source account" }, { status: 400 });
      }

      const fee = transferType === "wire" ? 20.00 : 0.00;
      const totalDebit = parsedAmount + fee;

      if (srcAcc.balance < totalDebit) {
        return NextResponse.json({ error: "Insufficient funds to cover transfer and fees" }, { status: 400 });
      }

      const refNumber = generateRef("TXN", "P");
      
      // Main transfer transaction
      await db.createTransaction({
        accountId: sourceAccountId,
        title: transferType === "wire" ? "Wire Transfer OUT" : "ACH Transfer OUT",
        description: `${transferType === "wire" ? "Wire" : "ACH"} transfer to ${recipientName} at ${bankName} (${accountNumber.slice(-4)})`,
        amount: -parsedAmount,
        status: "Pending",
        effectiveDate: todayStr,
        recipientDetails: `Routing: ${routingNumber}, Acct: ${accountNumber}`,
        authCode: refNumber,
      });

      // Wire fee transaction if applicable
      if (fee > 0) {
        await db.createTransaction({
          accountId: sourceAccountId,
          title: "Wire Transfer Fee",
          description: "Service Fee for Outgoing Wire Transfer",
          amount: -fee,
          status: "Pending",
          effectiveDate: todayStr,
          authCode: refNumber,
        });
      }

      const now = new Date();
      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
        hour12: false,
      }) + " EST";

      const dateFormatted = now.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });

      return NextResponse.json({
        success: true,
        referenceNumber: refNumber,
        details: {
          amount: parsedAmount,
          transferType: transferType === "wire" ? "Wire Transfer" : "ACH Transfer",
          recipientName,
          sendingAccount: `${srcAcc.accountName} (${srcAcc.accountNumber})`,
          sendingAccountMask: srcAcc.accountNumber,
          date: dateFormatted,
          time: timeFormatted,
        }
      });
    }

    // 3. ZELLE TRANSFER
    if (type === "zelle") {
      if (!sourceAccountId || !recipient) {
        return NextResponse.json({ error: "Source account and recipient are required" }, { status: 400 });
      }

      const srcAcc = await db.getAccountById(sourceAccountId);
      if (!srcAcc || srcAcc.userId !== user.id) {
        return NextResponse.json({ error: "Invalid source account" }, { status: 400 });
      }

      if (srcAcc.balance < parsedAmount) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
      }

      const refNumber = generateRef("ZEL", "P");

      await db.createTransaction({
        accountId: sourceAccountId,
        title: "Zelle Transfer",
        description: `Zelle to ${recipient}`,
        amount: -parsedAmount,
        status: "Pending",
        effectiveDate: todayStr,
        recipientDetails: `Zelle Recipient: ${recipient}`,
        authCode: refNumber,
      });

      return NextResponse.json({ success: true, referenceNumber: refNumber });
    }

    // 4. BILL PAY
    if (type === "billpay") {
      if (!sourceAccountId || !biller) {
        return NextResponse.json({ error: "Source account and biller are required" }, { status: 400 });
      }

      const srcAcc = await db.getAccountById(sourceAccountId);
      if (!srcAcc || srcAcc.userId !== user.id) {
        return NextResponse.json({ error: "Invalid source account" }, { status: 400 });
      }

      if (srcAcc.balance < parsedAmount) {
        return NextResponse.json({ error: "Insufficient funds" }, { status: 400 });
      }

      const refNumber = generateRef("BPY", "P");

      await db.createTransaction({
        accountId: sourceAccountId,
        title: "Bill Payment",
        description: `Electronic Payment to ${biller}`,
        amount: -parsedAmount,
        status: "Pending",
        effectiveDate: todayStr,
        recipientDetails: `Biller: ${biller}`,
        authCode: refNumber,
      });

      return NextResponse.json({ success: true, referenceNumber: refNumber });
    }

    // 5. MOBILE DEPOSIT
    if (type === "deposit") {
      if (!targetAccountId) {
        return NextResponse.json({ error: "Target account is required" }, { status: 400 });
      }

      const destAcc = await db.getAccountById(targetAccountId);
      if (!destAcc || destAcc.userId !== user.id) {
        return NextResponse.json({ error: "Invalid target account" }, { status: 400 });
      }

      const refNumber = generateRef("REF", "X");

      await db.createTransaction({
        accountId: targetAccountId,
        title: "Mobile Deposit",
        description: "Check Deposit via Mobile Capture",
        amount: parsedAmount,
        status: "Pending",
        effectiveDate: todayStr,
        authCode: refNumber,
      });

      const now = new Date();
      const timeFormatted = now.toLocaleTimeString("en-US", {
        hour: "2-digit",
        minute: "2-digit",
        hour12: true,
      });

      const dateFormatted = now.toLocaleDateString("en-US", {
        month: "short",
        day: "2-digit",
        year: "numeric"
      });

      return NextResponse.json({
        success: true,
        referenceNumber: refNumber,
        details: {
          amount: parsedAmount,
          targetAccountName: `${destAcc.accountName} (*${destAcc.accountNumber.slice(-4)})`,
          targetAccountType: destAcc.accountType === "checking" ? "Checking" : "Savings",
          targetAccountMask: destAcc.accountNumber.slice(-4),
          date: dateFormatted,
          time: timeFormatted,
        }
      });
    }

    return NextResponse.json({ error: "Invalid transaction type" }, { status: 400 });
  } catch (error) {
    console.error("Create Transaction API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
