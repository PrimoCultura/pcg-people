import { NextResponse } from "next/server";
import { ConvexHttpClient } from "convex/browser";
import { api } from "@/convex/_generated/api";
import {
  ADMIN_SESSION_COOKIE,
  PURGE_CONFIRM_PHRASE,
  getAdminPassword,
  isAdminSessionCookie,
} from "@/lib/adminAuth";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const match = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${ADMIN_SESSION_COOKIE}=`));
  const value = match?.slice(ADMIN_SESSION_COOKIE.length + 1);
  if (!isAdminSessionCookie(value)) {
    return NextResponse.json(
      { ok: false, message: "Sessione Admin non valida. Effettua di nuovo l’accesso." },
      { status: 401 },
    );
  }

  let body: { confirmPhrase?: string; acknowledged?: boolean };
  try {
    body = (await request.json()) as {
      confirmPhrase?: string;
      acknowledged?: boolean;
    };
  } catch {
    return NextResponse.json(
      { ok: false, message: "Richiesta non valida." },
      { status: 400 },
    );
  }

  if (body.acknowledged !== true) {
    return NextResponse.json(
      { ok: false, message: "Devi confermare di voler eliminare tutti i dati." },
      { status: 400 },
    );
  }

  if (body.confirmPhrase !== PURGE_CONFIRM_PHRASE) {
    return NextResponse.json(
      {
        ok: false,
        message: `Digita esattamente ${PURGE_CONFIRM_PHRASE} per procedere.`,
      },
      { status: 400 },
    );
  }

  const convexUrl = process.env.NEXT_PUBLIC_CONVEX_URL;
  if (!convexUrl) {
    return NextResponse.json(
      { ok: false, message: "Convex non configurato." },
      { status: 503 },
    );
  }

  try {
    const client = new ConvexHttpClient(convexUrl);
    const result = await client.mutation(api.adminDatabase.purgeAll, {
      confirmPhrase: PURGE_CONFIRM_PHRASE,
      adminPassword: getAdminPassword(),
    });
    return NextResponse.json({ ok: true, result });
  } catch (error) {
    console.error("[admin/purge]", error);
    const message =
      error instanceof Error && error.message
        ? error.message
        : "Eliminazione non riuscita.";
    return NextResponse.json({ ok: false, message }, { status: 500 });
  }
}
