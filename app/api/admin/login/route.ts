import { NextResponse } from "next/server";
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_VALUE,
  isValidAdminPassword,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  let body: { password?: string };
  try {
    body = (await request.json()) as { password?: string };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Richiesta non valida." },
      { status: 400 },
    );
  }

  const password = typeof body.password === "string" ? body.password : "";
  if (!isValidAdminPassword(password)) {
    return NextResponse.json(
      { ok: false, message: "Password non corretta." },
      { status: 401 },
    );
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(ADMIN_SESSION_COOKIE, ADMIN_SESSION_VALUE, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 12, // 12 hours
  });
  return response;
}
