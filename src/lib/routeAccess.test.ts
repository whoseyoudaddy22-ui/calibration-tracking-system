import { describe, expect, it } from "vitest";
import { decideRedirect } from "./routeAccess";

const origin = "http://localhost:3000";

describe("decideRedirect", () => {
  it("redirects unauthenticated requests to /login with a callbackUrl", () => {
    const decision = decideRedirect({
      pathname: "/dashboard",
      origin,
      isAuthenticated: false,
    });
    expect(decision).toEqual({
      type: "redirect",
      location: "http://localhost:3000/login?callbackUrl=%2Fdashboard",
    });
  });

  it.each(["Admin", "Editor", "Visitor"] as const)(
    "lets an authenticated %s through to /dashboard",
    (role) => {
      const decision = decideRedirect({ pathname: "/dashboard", origin, isAuthenticated: true, role });
      expect(decision).toEqual({ type: "next" });
    },
  );

  it.each(["Admin", "Editor"] as const)("lets %s through to /tools/manage", (role) => {
    const decision = decideRedirect({
      pathname: "/tools/manage",
      origin,
      isAuthenticated: true,
      role,
    });
    expect(decision).toEqual({ type: "next" });
  });

  it("redirects Visitor away from /tools/manage", () => {
    const decision = decideRedirect({
      pathname: "/tools/manage",
      origin,
      isAuthenticated: true,
      role: "Visitor",
    });
    expect(decision).toEqual({ type: "redirect", location: "http://localhost:3000/" });
  });

  it("lets Admin through to /admin", () => {
    const decision = decideRedirect({ pathname: "/admin", origin, isAuthenticated: true, role: "Admin" });
    expect(decision).toEqual({ type: "next" });
  });

  it.each(["Editor", "Visitor"] as const)("redirects %s away from /admin", (role) => {
    const decision = decideRedirect({ pathname: "/admin", origin, isAuthenticated: true, role });
    expect(decision).toEqual({ type: "redirect", location: "http://localhost:3000/" });
  });
});
