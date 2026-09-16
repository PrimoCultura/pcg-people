import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * Admin is not production-ready without auth.
 * In production, /admin is blocked unless ADMIN_ENABLED=true
 * (temporary ops switch — replace with Clerk or equivalent).
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  if (process.env.NODE_ENV === "production") {
    if (process.env.ADMIN_ENABLED !== "true") {
      return new NextResponse(
        "Area Admin non disponibile in produzione finché non è configurata l’autenticazione.",
        { status: 403 },
      );
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*"],
};
