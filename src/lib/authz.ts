import { auth } from "@/auth";
import type { Role } from "@/generated/prisma/enums";

export async function requireRole(allowed: Role[]) {
  const session = await auth();
  if (!session?.user || !allowed.includes(session.user.role)) {
    throw new Error("Forbidden");
  }
  return session;
}
