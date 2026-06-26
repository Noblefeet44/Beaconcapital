import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function POST(req: NextRequest) {
  try {
    const admin = await getSessionUser(req);
    if (!admin || admin.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { userId, isFrozen, frozenReason } = await req.json();

    if (!userId || typeof isFrozen !== "boolean") {
      return NextResponse.json({ error: "Invalid parameters" }, { status: 400 });
    }

    const updatedUser = await db.freezeUser(userId, isFrozen, frozenReason || "");
    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true, user: updatedUser });
  } catch (error) {
    console.error("Admin User Freeze API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
