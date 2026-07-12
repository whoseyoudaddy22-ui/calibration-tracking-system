import Link from "next/link";
import type { Role } from "@/generated/prisma/enums";
import { AuthStatus } from "@/components/AuthStatus";

export function Nav({ role }: { role?: Role }) {
  return (
    <nav className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-200 pb-4">
      <div className="flex gap-4 text-sm font-medium">
        <Link href="/dashboard" className="hover:underline">
          แดชบอร์ด
        </Link>
        {(role === "Admin" || role === "Editor") && (
          <Link href="/tools/manage" className="hover:underline">
            จัดการเครื่องมือ
          </Link>
        )}
        {role === "Admin" && (
          <Link href="/admin" className="hover:underline">
            จัดการผู้ใช้
          </Link>
        )}
      </div>
      <AuthStatus />
    </nav>
  );
}
