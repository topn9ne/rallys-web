import { getToken } from "next-auth/jwt";
import { NextRequest, NextResponse } from "next/server";

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const cookieName =
    process.env.NODE_ENV === "production"
      ? "__Secure-authjs.session-token"
      : "authjs.session-token";

  const token = await getToken({
    req,
    secret: process.env.AUTH_SECRET,
    cookieName,
  });

  // Admin routes: require role = ADMIN
  if (pathname.startsWith("/admin")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/admin", req.url));
    }
    if (token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  // Operator routes: require role = OPERATOR or ADMIN
  if (pathname.startsWith("/operator")) {
    if (!token) {
      return NextResponse.redirect(new URL("/auth/signin?callbackUrl=/operator", req.url));
    }
    const role = token.role as string | undefined;
    if (role !== "OPERATOR" && role !== "ADMIN" && role !== "DRIVER") {
      return NextResponse.redirect(new URL("/unauthorized", req.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/operator/:path*"],
};
