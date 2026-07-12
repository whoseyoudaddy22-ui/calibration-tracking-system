import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { createTool, updateTool, deleteTool } from "./actions";

function toDateInputValue(date: Date) {
  return date.toISOString().slice(0, 10);
}

export default async function ManageToolsPage() {
  const session = await auth();
  const tools = await prisma.tool.findMany({ orderBy: { toolCode: "asc" } });

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-8">
      <Nav role={session?.user.role} />
      <h1 className="text-2xl font-semibold text-gray-900">จัดการข้อมูลเครื่องมือ</h1>

      <section className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="mb-4 text-lg font-medium text-gray-900">เพิ่มเครื่องมือใหม่</h2>
        <form action={createTool} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="รหัสเครื่องมือ" name="toolCode" required />
          <Field label="ชื่อเครื่องมือ" name="name" required />
          <Field label="แผนก" name="department" required />
          <Field label="วันที่สอบเทียบล่าสุด" name="lastCalibrationDate" type="date" required />
          <Field label="วันหมดอายุ" name="expiryDate" type="date" required />
          <ResultField />
          <NotesField />
          <div className="sm:col-span-2">
            <button
              type="submit"
              className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
            >
              เพิ่มเครื่องมือ
            </button>
          </div>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="text-lg font-medium text-gray-900">รายการเครื่องมือ</h2>
        {tools.map((tool) => (
          <form
            key={tool.id}
            action={updateTool}
            className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 sm:grid-cols-2"
          >
            <input type="hidden" name="id" value={tool.id} />
            <Field label="รหัสเครื่องมือ" name="toolCode" defaultValue={tool.toolCode} required />
            <Field label="ชื่อเครื่องมือ" name="name" defaultValue={tool.name} required />
            <Field label="แผนก" name="department" defaultValue={tool.department} required />
            <Field
              label="วันที่สอบเทียบล่าสุด"
              name="lastCalibrationDate"
              type="date"
              defaultValue={toDateInputValue(tool.lastCalibrationDate)}
              required
            />
            <Field
              label="วันหมดอายุ"
              name="expiryDate"
              type="date"
              defaultValue={toDateInputValue(tool.expiryDate)}
              required
            />
            <ResultField />
            <NotesField />
            <div className="flex items-end gap-2 sm:col-span-2">
              <button
                type="submit"
                className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
              >
                บันทึก
              </button>
              <button
                type="submit"
                formAction={deleteTool}
                className="rounded-md border border-red-300 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-50"
              >
                ลบ
              </button>
              <Link
                href={`/tools/${tool.id}`}
                className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                ดูประวัติ
              </Link>
            </div>
          </form>
        ))}
        {tools.length === 0 && <p className="text-sm text-gray-500">ยังไม่มีข้อมูลเครื่องมือ</p>}
      </section>
      </div>
    </div>
  );
}

function ResultField() {
  return (
    <label className="space-y-1 text-sm">
      <span className="block font-medium text-gray-700">ผลการสอบเทียบ</span>
      <select
        name="result"
        defaultValue="ผ่าน"
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      >
        <option value="ผ่าน">ผ่าน</option>
        <option value="ไม่ผ่าน">ไม่ผ่าน</option>
      </select>
    </label>
  );
}

function NotesField() {
  return (
    <label className="space-y-1 text-sm sm:col-span-2">
      <span className="block font-medium text-gray-700">หมายเหตุ</span>
      <input name="notes" className="w-full rounded-md border border-gray-300 px-3 py-2" />
    </label>
  );
}

function Field({
  label,
  name,
  type = "text",
  defaultValue,
  required,
}: {
  label: string;
  name: string;
  type?: string;
  defaultValue?: string;
  required?: boolean;
}) {
  return (
    <label className="space-y-1 text-sm">
      <span className="block font-medium text-gray-700">{label}</span>
      <input
        name={name}
        type={type}
        defaultValue={defaultValue}
        required={required}
        className="w-full rounded-md border border-gray-300 px-3 py-2"
      />
    </label>
  );
}
