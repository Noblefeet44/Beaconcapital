import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { signToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const {
      username,
      password,
      firstName,
      lastName,
      phone,
      dob,
      idType,
      idNumber,
      issuance,
      expiry,
    } = await req.json();

    if (!username || !password || !firstName || !lastName) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    const existingUser = await db.getUserByUsername(username);
    if (existingUser) {
      return NextResponse.json(
        { error: "Username/Email is already registered" },
        { status: 409 }
      );
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);

    // Create user in DB
    const user = await db.createUser({
      username,
      passwordHash,
      firstName,
      lastName,
      phone: phone || "",
      dob: dob || "",
      idType: idType || "",
      idNumber: idNumber || "",
      issuance: issuance || "",
      expiry: expiry || "",
    });

    if (!user) {
      return NextResponse.json({ error: "Failed to create user" }, { status: 500 });
    }

    // Auto-create initial checking and savings accounts with mock balances for demo
    await db.createAccount(user.id, "Beacon Premier Checking", "checking", 1500.00);
    await db.createAccount(user.id, "Beacon High-Yield Savings", "savings", 10000.00);

    // Set secure cookie
    const token = signToken({
      userId: user.id,
      username: user.username,
      role: user.role,
    });

    const response = NextResponse.json({
      success: true,
      user: {
        id: user.id,
        username: user.username,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role,
      },
    });

    response.cookies.set("beacon_session", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 60 * 60 * 24, // 1 day
      path: "/",
    });

    return response;
  } catch (error) {
    console.error("Signup API Error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
