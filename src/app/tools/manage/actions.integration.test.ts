import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from "vitest";
import type { Role } from "@/generated/prisma/enums";

const authMock = vi.fn();
vi.mock("@/auth", () => ({ auth: authMock }));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

const { prisma } = await import("@/lib/prisma");
const { createTool, updateTool, deleteTool } = await import("./actions");

function sessionFor(userId: string, role: Role) {
  return { user: { id: userId, role, name: "test" } };
}

function toolFormData(overrides: Partial<Record<string, string>> = {}) {
  const fd = new FormData();
  fd.set("toolCode", overrides.toolCode ?? `TC-${crypto.randomUUID()}`);
  fd.set("name", overrides.name ?? "Test Tool");
  fd.set("department", overrides.department ?? "QA");
  fd.set("lastCalibrationDate", overrides.lastCalibrationDate ?? "2026-01-01");
  fd.set("expiryDate", overrides.expiryDate ?? "2026-12-31");
  fd.set("result", overrides.result ?? "ผ่าน");
  if (overrides.notes !== undefined) fd.set("notes", overrides.notes);
  if (overrides.id !== undefined) fd.set("id", overrides.id);
  return fd;
}

async function cleanupTool(id: string) {
  await prisma.calibrationHistory.deleteMany({ where: { toolId: id } });
  await prisma.tool.deleteMany({ where: { id } });
}

let editorId: string;

beforeAll(async () => {
  const editor = await prisma.user.create({
    data: { username: `editor-${crypto.randomUUID()}`, password: "hashed", role: "Editor" },
  });
  editorId = editor.id;
});

afterAll(async () => {
  await prisma.calibrationHistory.deleteMany({ where: { performedById: editorId } });
  await prisma.user.delete({ where: { id: editorId } });
  await prisma.$disconnect();
});

afterEach(() => {
  authMock.mockReset();
});

describe("createTool", () => {
  it("creates a tool and its initial calibration history for an authorized editor", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const fd = toolFormData();
    const toolCode = fd.get("toolCode") as string;

    await createTool(fd);

    const tool = await prisma.tool.findUnique({
      where: { toolCode },
      include: { calibrationHistories: true },
    });
    expect(tool).not.toBeNull();
    expect(tool!.name).toBe("Test Tool");
    expect(tool!.calibrationHistories).toHaveLength(1);
    expect(tool!.calibrationHistories[0].performedById).toBe(editorId);
    expect(tool!.calibrationHistories[0].result).toBe("ผ่าน");

    await cleanupTool(tool!.id);
  });

  it("rejects users without Admin/Editor role", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Visitor"));
    const fd = toolFormData();

    await expect(createTool(fd)).rejects.toThrow("Forbidden");

    const tool = await prisma.tool.findUnique({ where: { toolCode: fd.get("toolCode") as string } });
    expect(tool).toBeNull();
  });

  it("rejects when required fields are missing", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const fd = toolFormData({ name: "" });

    await expect(createTool(fd)).rejects.toThrow("Missing required fields");
  });

  it("rejects an invalid calibration date", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const fd = toolFormData({ lastCalibrationDate: "not-a-date" });

    await expect(createTool(fd)).rejects.toThrow("Invalid date");
  });
});

describe("updateTool", () => {
  it("updates fields and appends a new calibration history when the calibration date changes", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const createFd = toolFormData();
    await createTool(createFd);
    const created = await prisma.tool.findUniqueOrThrow({
      where: { toolCode: createFd.get("toolCode") as string },
    });

    const updateFd = toolFormData({
      id: created.id,
      toolCode: created.toolCode,
      name: "Updated Name",
      lastCalibrationDate: "2026-02-01",
    });
    await updateTool(updateFd);

    const updated = await prisma.tool.findUniqueOrThrow({
      where: { id: created.id },
      include: { calibrationHistories: true },
    });
    expect(updated.name).toBe("Updated Name");
    expect(updated.calibrationHistories).toHaveLength(2);

    await cleanupTool(created.id);
  });

  it("does not append a calibration history when the calibration date is unchanged", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const createFd = toolFormData();
    await createTool(createFd);
    const created = await prisma.tool.findUniqueOrThrow({
      where: { toolCode: createFd.get("toolCode") as string },
    });

    const updateFd = toolFormData({
      id: created.id,
      toolCode: created.toolCode,
      name: "Renamed Only",
      lastCalibrationDate: "2026-01-01",
    });
    await updateTool(updateFd);

    const updated = await prisma.tool.findUniqueOrThrow({
      where: { id: created.id },
      include: { calibrationHistories: true },
    });
    expect(updated.name).toBe("Renamed Only");
    expect(updated.calibrationHistories).toHaveLength(1);

    await cleanupTool(created.id);
  });

  it("throws when the tool does not exist", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const fd = toolFormData({ id: "nonexistent-id" });

    await expect(updateTool(fd)).rejects.toThrow("Tool not found");
  });

  it("rejects users without Admin/Editor role", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Visitor"));
    const fd = toolFormData({ id: "irrelevant-id" });

    await expect(updateTool(fd)).rejects.toThrow("Forbidden");
  });
});

describe("deleteTool", () => {
  it("deletes a tool and its calibration history", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Editor"));
    const createFd = toolFormData();
    await createTool(createFd);
    const created = await prisma.tool.findUniqueOrThrow({
      where: { toolCode: createFd.get("toolCode") as string },
    });

    const deleteFd = new FormData();
    deleteFd.set("id", created.id);
    await deleteTool(deleteFd);

    const tool = await prisma.tool.findUnique({ where: { id: created.id } });
    const histories = await prisma.calibrationHistory.findMany({ where: { toolId: created.id } });
    expect(tool).toBeNull();
    expect(histories).toHaveLength(0);
  });

  it("rejects users without Admin/Editor role", async () => {
    authMock.mockResolvedValue(sessionFor(editorId, "Visitor"));
    const fd = new FormData();
    fd.set("id", "whatever");

    await expect(deleteTool(fd)).rejects.toThrow("Forbidden");
  });
});
