import { beforeEach, describe, expect, it, vi } from "vitest";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: authMock }));

const { requireRole } = await import("./authz");

function sessionFor(role: "Admin" | "Editor" | "Visitor") {
  return { user: { id: "user-1", role, name: "test" } };
}

describe("requireRole", () => {
  beforeEach(() => {
    authMock.mockReset();
  });

  it("returns the session when the user's role is in the allowed list", async () => {
    authMock.mockResolvedValue(sessionFor("Admin"));
    const session = await requireRole(["Admin"]);
    expect(session.user.role).toBe("Admin");
  });

  it("allows any role included in a multi-role allow list", async () => {
    authMock.mockResolvedValue(sessionFor("Editor"));
    const session = await requireRole(["Admin", "Editor"]);
    expect(session.user.role).toBe("Editor");
  });

  it("throws when the user's role is not in the allowed list", async () => {
    authMock.mockResolvedValue(sessionFor("Visitor"));
    await expect(requireRole(["Admin", "Editor"])).rejects.toThrow("Forbidden");
  });

  it("throws when there is no session (not logged in)", async () => {
    authMock.mockResolvedValue(null);
    await expect(requireRole(["Admin"])).rejects.toThrow("Forbidden");
  });

  it("throws when the session has no user", async () => {
    authMock.mockResolvedValue({ user: undefined });
    await expect(requireRole(["Admin"])).rejects.toThrow("Forbidden");
  });
});
