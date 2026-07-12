import { NextResponse } from "next/server";
import NextAuth from "next-auth";
import { authConfig } from "@/auth.config";
import { decideRedirect } from "@/lib/routeAccess";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  const decision = decideRedirect({
    pathname: req.nextUrl.pathname,
    origin: req.nextUrl.origin,
    isAuthenticated: !!req.auth,
    role: req.auth?.user?.role,
  });

  if (decision.type === "redirect") {
    return NextResponse.redirect(decision.location);
  }
  return NextResponse.next();
});

export const config = {
  matcher: ["/dashboard/:path*", "/tools/:path*", "/admin/:path*"],
};
