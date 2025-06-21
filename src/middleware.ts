import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request });
  const isAdminRoute = request.nextUrl.pathname.startsWith("/edit");
  const isProtectedRoute =
    request.nextUrl.pathname.startsWith("/add") ||
    isAdminRoute ||
    request.nextUrl.pathname === "/profile";

  if (isProtectedRoute) {
    if (!token) {
      return NextResponse.redirect(new URL("/login", request.url));
    }

    if (isAdminRoute && token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/cards", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/add/:path*", "/edit/:path*", "/profile"],
};
