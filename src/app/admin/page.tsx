import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { createUser, updateUserRole, deleteUser } from "./actions";

export default async function AdminPage() {
  const session = await auth();
  const users = await prisma.user.findMany({ orderBy: { username: "asc" } });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-3xl space-y-8">
      <Nav role={session?.user.role} />
      <h1 className="text-2xl font-semibold text-gray-900">จัดการผู้ใช้งาน</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">เพิ่มผู้ใช้ใหม่</h2>
        <form action={createUser} className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          <label className="space-y-1 text-sm">
            <span className="block font-medium text-gray-700">ชื่อผู้ใช้</span>
            <input name="username" required className="w-full rounded-md border border-gray-300 px-3 py-2" />
          </label>
          <label className="space-y-1 text-sm">
            <span className="block font-medium text-gray-700">รหัสผ่าน</span>
            <input
              name="password"
              type="password"
              required
              minLength={8}
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            />
          </label>
          <label className="space-y-1 text-sm">
            <span className="block font-medium text-gray-700">สิทธิ์การใช้งาน</span>
            <select
              name="role"
              defaultValue="Visitor"
              className="w-full rounded-md border border-gray-300 px-3 py-2"
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Visitor">Visitor</option>
            </select>
          </label>
          <div className="sm:col-span-3">
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              เพิ่มผู้ใช้
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-medium text-gray-900">รายชื่อผู้ใช้</h2>
        {users.map((user) => (
          <form
            key={user.id}
            action={updateUserRole}
            className="flex flex-wrap items-center gap-3 rounded-lg border border-gray-200 bg-white p-4"
          >
            <input type="hidden" name="id" value={user.id} />
            <span className="min-w-[10rem] font-medium text-gray-900">{user.username}</span>
            <select
              name="role"
              defaultValue={user.role}
              className="rounded-md border border-gray-300 px-3 py-2 text-sm"
            >
              <option value="Admin">Admin</option>
              <option value="Editor">Editor</option>
              <option value="Visitor">Visitor</option>
            </select>
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-3 py-2 text-sm font-medium text-white"
            >
              บันทึกสิทธิ์
            </button>
            <button
              type="submit"
              formAction={deleteUser}
              disabled={user.id === session?.user.id}
              className="rounded-md border border-red-300 px-3 py-2 text-sm font-medium text-red-700 hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              ลบผู้ใช้
            </button>
          </form>
        ))}
      </section>
      </div>
    </div>
  );
}
