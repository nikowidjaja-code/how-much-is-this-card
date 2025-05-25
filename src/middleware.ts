import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute =
    request.nextUrl.pathname.startsWith("/add") ||
    request.nextUrl.pathname.startsWith("/edit");

  if (isAdminRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/cards", request.url));
    }

    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/cards", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/add/:path*", "/edit/:path*"],
};
