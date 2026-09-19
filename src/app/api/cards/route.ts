import { NextRequest, NextResponse } from "next/server";
import { getSessionUser } from "@/lib/auth";
import { db } from "@/lib/db";

export async function GET(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const cards = await db.getCards(user.id);
    return NextResponse.json({ success: true, cards });
  } catch (error) {
    console.error("Cards GET API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const user = await getSessionUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { cardId, action } = await req.json();
    if (!cardId || !action) {
      return NextResponse.json({ error: "Missing required parameters" }, { status: 400 });
    }

    if (action === "freeze" || action === "unfreeze") {
      const isFrozen = action === "freeze";
      await db.toggleCardFreeze(cardId, isFrozen);
      return NextResponse.json({ success: true, isFrozen });
    }

    return NextResponse.json({ error: "Invalid action" }, { status: 400 });
  } catch (error) {
    console.error("Cards POST API error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
