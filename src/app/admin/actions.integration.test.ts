import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import bcrypt from "bcryptjs";
import type { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { prisma } = await import("@/lib/prisma");
const { createUser, updateUserRole, deleteUser } = await import("./actions");

function sessionFor(userId: string, role: Role) {
  return { user: { id: userId, role, name: "test" } };
}

function userFormData(overrides: Partial<Record<string, string>> = {}) {
  const fd = new FormData();
  fd.set("username", overrides.username ?? `user-${crypto.randomUUID()}`);
  fd.set("password", overrides.password ?? "ValidPass123!");
  fd.set("role", overrides.role ?? "Visitor");
  if (overrides.id !== undefined) fd.set("id", overrides.id);
  return fd;
}

let adminId: string;

beforeAll(async () => {
  const admin = await prisma.user.create({
    data: { username: `admin-${crypto.randomUUID()}`, password: "hashed", role: "Admin" },
  });
  adminId = admin.id;
});

afterAll(async () => {
  await prisma.user.delete({ where: { id: adminId } });
  await prisma.$disconnect();
});

afterEach(() => {
  authMock.mockReset();
});

describe("createUser", () => {
  it("creates a user with a hashed password for an authorized admin", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const fd = userFormData({ password: "ValidPass123!", role: "Editor" });
    const username = fd.get("username") as string;

    await createUser(fd);

    const created = await prisma.user.findUniqueOrThrow({ where: { username } });
    expect(created.role).toBe("Editor");
    expect(created.password).not.toBe("ValidPass123!");
    expect(await bcrypt.compare("ValidPass123!", created.password)).toBe(true);

    await prisma.user.delete({ where: { id: created.id } });
  });

  it("rejects non-admins", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Editor"));
    const fd = userFormData();

    await expect(createUser(fd)).rejects.toThrow("Forbidden");

    const found = await prisma.user.findUnique({ where: { username: fd.get("username") as string } });
    expect(found).toBeNull();
  });

  it("rejects a password shorter than 8 characters", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const fd = userFormData({ password: "short" });

    await expect(createUser(fd)).rejects.toThrow("Invalid username or password");
  });

  it("rejects an invalid role", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const fd = userFormData({ role: "SuperAdmin" });

    await expect(createUser(fd)).rejects.toThrow("Invalid role");
  });
});

describe("updateUserRole", () => {
  it("updates another user's role for an authorized admin", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const target = await prisma.user.create({
      data: { username: `target-${crypto.randomUUID()}`, password: "hashed", role: "Visitor" },
    });

    const fd = new FormData();
    fd.set("id", target.id);
    fd.set("role", "Editor");
    await updateUserRole(fd);

    const updated = await prisma.user.findUniqueOrThrow({ where: { id: target.id } });
    expect(updated.role).toBe("Editor");

    await prisma.user.delete({ where: { id: target.id } });
  });

  it("prevents an admin from removing their own Admin role", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const fd = new FormData();
    fd.set("id", adminId);
    fd.set("role", "Editor");

    await expect(updateUserRole(fd)).rejects.toThrow("Cannot remove your own Admin role");

    const self = await prisma.user.findUniqueOrThrow({ where: { id: adminId } });
    expect(self.role).toBe("Admin");
  });

  it("rejects non-admins", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Visitor"));
    const fd = new FormData();
    fd.set("id", adminId);
    fd.set("role", "Editor");

    await expect(updateUserRole(fd)).rejects.toThrow("Forbidden");
  });
});

describe("deleteUser", () => {
  it("deletes another user for an authorized admin", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const target = await prisma.user.create({
      data: { username: `target-${crypto.randomUUID()}`, password: "hashed", role: "Visitor" },
    });

    const fd = new FormData();
    fd.set("id", target.id);
    await deleteUser(fd);

    const found = await prisma.user.findUnique({ where: { id: target.id } });
    expect(found).toBeNull();
  });

  it("prevents an admin from deleting their own account", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Admin"));
    const fd = new FormData();
    fd.set("id", adminId);

    await expect(deleteUser(fd)).rejects.toThrow("Cannot delete your own account");

    const self = await prisma.user.findUnique({ where: { id: adminId } });
    expect(self).not.toBeNull();
  });

  it("rejects non-admins", async () => {
    authMock.mockResolvedValue(sessionFor(adminId, "Editor"));
    const fd = new FormData();
    fd.set("id", adminId);

    await expect(deleteUser(fd)).rejects.toThrow("Forbidden");
  });
});
