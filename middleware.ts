import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const role = request.cookies.get("role")?.value;
  const pathname = request.nextUrl.pathname;
  const locale = pathname.split("/")[1] || "he";

  if (pathname.includes("/coach/") && role && role !== "coach") {
    return NextResponse.redirect(new URL(`/${locale}/athlete/dashboard`, request.url));
  }

  if (pathname.includes("/athlete/") && role && role !== "athlete") {
    return NextResponse.redirect(new URL(`/${locale}/coach/dashboard`, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/:locale/coach/:path*", "/:locale/athlete/:path*"]
};
