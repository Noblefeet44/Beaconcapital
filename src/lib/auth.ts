import jwt from "jsonwebtoken";
import { NextRequest } from "next/server";
import { db, User } from "./db";

const JWT_SECRET = process.env.JWT_SECRET || "beacon-capital-super-secret-key-129038";

export interface SessionPayload {
  userId: string;
  username: string;
  role: "user" | "admin";
}

export function signToken(payload: SessionPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: "1d" });
}

export function verifyToken(token: string): SessionPayload | null {
  try {
    return jwt.verify(token, JWT_SECRET) as SessionPayload;
  } catch (error) {
    return null;
  }
}

export function getSessionFromCookies(req: NextRequest): SessionPayload | null {
  const token = req.cookies.get("beacon_session")?.value;
  if (!token) return null;
  return verifyToken(token);
}

export async function getSessionUser(req: NextRequest): Promise<User | null> {
  const session = getSessionFromCookies(req);
  if (!session) return null;
  const user = await db.getUserById(session.userId);
  return user || null;
}
