"use server";

import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";

function parseDate(value: FormDataEntryValue | null): Date {
  const str = typeof value === "string" ? value : "";
  const date = new Date(str);
  if (Number.isNaN(date.getTime())) {
    throw new Error("Invalid date");
  }
  return date;
}

function parseResult(value: FormDataEntryValue | null): string {
  const str = typeof value === "string" ? value.trim() : "";
  return str === "ไม่ผ่าน" ? "ไม่ผ่าน" : "ผ่าน";
}

function parseNotes(value: FormDataEntryValue | null): string | null {
  const str = typeof value === "string" ? value.trim() : "";
  return str || null;
}

export async function createTool(formData: FormData) {
  const session = await requireRole(["Admin", "Editor"]);

  const toolCode = String(formData.get("toolCode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const lastCalibrationDate = parseDate(formData.get("lastCalibrationDate"));
  const expiryDate = parseDate(formData.get("expiryDate"));
  const result = parseResult(formData.get("result"));
  const notes = parseNotes(formData.get("notes"));

  if (!toolCode || !name || !department) {
    throw new Error("Missing required fields");
  }

  const tool = await prisma.$transaction(async (tx) => {
    const created = await tx.tool.create({
      data: { toolCode, name, department, lastCalibrationDate, expiryDate },
    });
    await tx.calibrationHistory.create({
      data: { toolId: created.id, date: lastCalibrationDate, result, notes, performedById: session.user.id },
    });
    return created;
  });

  revalidatePath("/tools/manage");
  revalidatePath("/dashboard");
  revalidatePath(`/tools/${tool.id}`);
}

export async function updateTool(formData: FormData) {
  const session = await requireRole(["Admin", "Editor"]);

  const id = String(formData.get("id") ?? "");
  const toolCode = String(formData.get("toolCode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const lastCalibrationDate = parseDate(formData.get("lastCalibrationDate"));
  const expiryDate = parseDate(formData.get("expiryDate"));
  const result = parseResult(formData.get("result"));
  const notes = parseNotes(formData.get("notes"));

  if (!id || !toolCode || !name || !department) {
    throw new Error("Missing required fields");
  }

  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) throw new Error("Tool not found");

  await prisma.$transaction(async (tx) => {
    await tx.tool.update({
      where: { id },
      data: { toolCode, name, department, lastCalibrationDate, expiryDate },
    });

    if (existing.lastCalibrationDate.getTime() !== lastCalibrationDate.getTime()) {
      await tx.calibrationHistory.create({
        data: { toolId: id, date: lastCalibrationDate, result, notes, performedById: session.user.id },
      });
    }
  });

  revalidatePath("/tools/manage");
  revalidatePath("/dashboard");
  revalidatePath(`/tools/${id}`);
}

export async function deleteTool(formData: FormData) {
  await requireRole(["Admin", "Editor"]);

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");

  await prisma.calibrationHistory.deleteMany({ where: { toolId: id } });
  await prisma.tool.delete({ where: { id } });

  revalidatePath("/tools/manage");
  revalidatePath("/dashboard");
}
