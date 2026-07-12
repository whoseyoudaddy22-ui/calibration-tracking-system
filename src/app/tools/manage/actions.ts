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

export async function createTool(formData: FormData) {
  const session = await requireRole(["Admin", "Editor"]);

  const toolCode = String(formData.get("toolCode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const lastCalibrationDate = parseDate(formData.get("lastCalibrationDate"));
  const expiryDate = parseDate(formData.get("expiryDate"));

  if (!toolCode || !name || !department) {
    throw new Error("Missing required fields");
  }

  const tool = await prisma.tool.create({
    data: { toolCode, name, department, lastCalibrationDate, expiryDate },
  });

  await prisma.calibrationHistory.create({
    data: { toolId: tool.id, date: lastCalibrationDate, performedById: session.user.id },
  });

  revalidatePath("/tools/manage");
  revalidatePath("/dashboard");
}

export async function updateTool(formData: FormData) {
  const session = await requireRole(["Admin", "Editor"]);

  const id = String(formData.get("id") ?? "");
  const toolCode = String(formData.get("toolCode") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();
  const department = String(formData.get("department") ?? "").trim();
  const lastCalibrationDate = parseDate(formData.get("lastCalibrationDate"));
  const expiryDate = parseDate(formData.get("expiryDate"));

  if (!id || !toolCode || !name || !department) {
    throw new Error("Missing required fields");
  }

  const existing = await prisma.tool.findUnique({ where: { id } });
  if (!existing) throw new Error("Tool not found");

  await prisma.tool.update({
    where: { id },
    data: { toolCode, name, department, lastCalibrationDate, expiryDate },
  });

  if (existing.lastCalibrationDate.getTime() !== lastCalibrationDate.getTime()) {
    await prisma.calibrationHistory.create({
      data: { toolId: id, date: lastCalibrationDate, performedById: session.user.id },
    });
  }

  revalidatePath("/tools/manage");
  revalidatePath("/dashboard");
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
