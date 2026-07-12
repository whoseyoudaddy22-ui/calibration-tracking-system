import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

const EDITOR_ROLES = new Set(["Admin", "Editor"]);
const ADMIN_ROLES = new Set(["Admin"]);

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const role = req.auth?.user?.role;

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.has(role ?? "")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  if (pathname.startsWith("/tools/manage") && !EDITOR_ROLES.has(role ?? "")) {
    return NextResponse.redirect(new URL("/", req.url));
  }

  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/tools/:path*", "/admin/:path*"],
};
