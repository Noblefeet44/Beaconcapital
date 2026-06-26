import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const allUsers = await db.getUsers();
    const users = allUsers.filter(
      (u) => u.role !== "admin" && u.username !== "alexander" && u.username !== "eleanor"
    );
    const usersWithAccounts = await Promise.all(users.map(async (u) => {
      const accounts = await db.getAccounts(u.id);
      return {
        ...u,
        passwordHash: undefined, // Hide password hashes
        accounts,
      };
    }));

    return NextResponse.json({ success: true, users: usersWithAccounts });
  } catch (error) {
    console.error("Admin Users API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
