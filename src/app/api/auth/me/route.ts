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
        role: user.role,
        status: user.status,
        isFrozen: user.isFrozen,
        frozenReason: user.frozenReason,
      },
      accounts,
    });
  } catch (error) {
    console.error("Auth Me API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
