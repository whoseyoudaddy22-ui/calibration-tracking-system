import Link from "next/link";
import { auth } from "@/auth";
import { AuthStatus } from "@/components/AuthStatus";

export default async function Home() {
  const session = await auth();

  return (
    <div className="flex flex-1 flex-col bg-gray-50">
      <div className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-12 px-8 py-8">
        <div className="flex justify-end">
          <AuthStatus />
        </div>

        <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold text-gray-900 sm:text-4xl">
              ระบบแสดงผลและติดตามสถานะการสอบเทียบเครื่องมือ
            </h1>
            <p className="mx-auto max-w-xl text-base text-gray-600">
              จัดเก็บ ตรวจสอบ และติดตามสถานะการสอบเทียบเครื่องมือวัด พร้อมแจ้งเตือนล่วงหน้าก่อนครบกำหนด
              และประวัติการสอบเทียบที่สืบค้นได้ง่าย
            </p>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-3 text-sm">
            <span className="rounded-full bg-green-100 px-3 py-1 font-medium text-green-800">
              🟢 ปกติ
            </span>
            <span className="rounded-full bg-yellow-100 px-3 py-1 font-medium text-yellow-800">
              🟡 ใกล้ครบกำหนด
            </span>
            <span className="rounded-full bg-red-100 px-3 py-1 font-medium text-red-800">
              🔴 หมดอายุ
            </span>
          </div>

          <Link
            href={session?.user ? "/dashboard" : "/login"}
            className="rounded-md bg-gray-900 px-6 py-3 text-sm font-medium text-white hover:bg-gray-800"
          >
            {session?.user ? "ไปที่แดชบอร์ด" : "เข้าสู่ระบบ"}
          </Link>
        </div>
      </div>
    </div>
  );
}
