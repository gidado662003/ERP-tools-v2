import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(req: NextRequest) {
  const token = req.cookies.get("erp_token");

  const { pathname } = req.nextUrl;

  // 🚨 allow app root to always load
  if (pathname === "/") {
    return NextResponse.next();
  }

  // allow Next internals
  if (pathname.startsWith("/_next") || pathname.includes("favicon")) {
    return NextResponse.next();
  }

  // protect only API or private routes if needed
  if (!token && pathname.startsWith("/modules")) {
    return NextResponse.redirect(
      new URL(process.env.NEXT_PUBLIC_LARAVEL as string),
    );
  }

  return NextResponse.next();
}
