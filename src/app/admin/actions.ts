"use server";

import { revalidatePath } from "next/cache";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { requireRole } from "@/lib/authz";
import { Role } from "@/generated/prisma/enums";

function parseRole(value: FormDataEntryValue | null): Role {
  const str = typeof value === "string" ? value : "";
  if (str !== Role.Admin && str !== Role.Editor && str !== Role.Visitor) {
    throw new Error("Invalid role");
  }
  return str;
}

export async function createUser(formData: FormData) {
  await requireRole(["Admin"]);

  const username = String(formData.get("username") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const role = parseRole(formData.get("role"));

  if (!username || password.length < 8) {
    throw new Error("Invalid username or password (min 8 characters)");
  }

  const hashed = await bcrypt.hash(password, 12);
  await prisma.user.create({
    data: { username, password: hashed, role },
  });

  revalidatePath("/admin");
}

export async function updateUserRole(formData: FormData) {
  const session = await requireRole(["Admin"]);

  const id = String(formData.get("id") ?? "");
  const role = parseRole(formData.get("role"));
  if (!id) throw new Error("Missing id");

  if (id === session.user.id && role !== Role.Admin) {
    throw new Error("Cannot remove your own Admin role");
  }

  await prisma.user.update({ where: { id }, data: { role } });

  revalidatePath("/admin");
}

export async function deleteUser(formData: FormData) {
  const session = await requireRole(["Admin"]);

  const id = String(formData.get("id") ?? "");
  if (!id) throw new Error("Missing id");
  if (id === session.user.id) {
    throw new Error("Cannot delete your own account");
  }

  await prisma.user.delete({ where: { id } });

  revalidatePath("/admin");
}
