import type { Role } from "@/generated/prisma/enums";

const EDITOR_ROLES = new Set(["Admin", "Editor"]);
const ADMIN_ROLES = new Set(["Admin"]);

/**
 * Pure decision logic behind the route-protection middleware in src/proxy.ts,
 * kept free of NextRequest/NextAuth imports so it can be unit tested directly.
 */
export function decideRedirect(input: {
  pathname: string;
  origin: string;
  isAuthenticated: boolean;
  role?: Role;
}): { type: "redirect"; location: string } | { type: "next" } {
  const { pathname, origin, isAuthenticated, role } = input;

  if (!isAuthenticated) {
    const loginUrl = new URL("/login", origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return { type: "redirect", location: loginUrl.toString() };
  }

  if (pathname.startsWith("/admin") && !ADMIN_ROLES.has(role ?? "")) {
    return { type: "redirect", location: new URL("/", origin).toString() };
  }

  if (pathname.startsWith("/tools/manage") && !EDITOR_ROLES.has(role ?? "")) {
    return { type: "redirect", location: new URL("/", origin).toString() };
  }

  return { type: "next" };
}
