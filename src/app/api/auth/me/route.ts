import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const accounts = await db.getAccounts(user.id);
    const cards = await db.getCards(user.id);

    return NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        email: user.username, // username is stored as email
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        dob: user.dob,
        issuance: user.issuance,
        address: (user as any).address || user.issuance || "",
        idType: user.idType || "dl",
        idNumber: user.idNumber || "",
        expiry: user.expiry || "",
        role: user.role,
        status: user.status,
        createdAt: user.createdAt,
        isFrozen: user.isFrozen,
        frozenReason: user.frozenReason,
      },
      accounts,
      cards,
      routingNumber: "026014881",
    });
  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
