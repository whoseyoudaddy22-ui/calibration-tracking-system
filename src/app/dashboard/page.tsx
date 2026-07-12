import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { getToolStatus, STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/status";

export default async function DashboardPage() {
  const session = await auth();
  const tools = await prisma.tool.findMany({ orderBy: { expiryDate: "asc" } });

  const withStatus = tools.map((tool) => ({ ...tool, status: getToolStatus(tool.expiryDate) }));
  const warningCount = withStatus.filter((t) => t.status === "warning").length;
  const expiredCount = withStatus.filter((t) => t.status === "expired").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Nav role={session?.user.role} />
        <h1 className="text-2xl font-semibold text-gray-900">แดชบอร์ดสถานะเครื่องมือ</h1>

        {(warningCount > 0 || expiredCount > 0) && (
          <div className="space-y-1 rounded-md border border-amber-300 bg-amber-50 p-4 text-sm text-amber-900">
            {expiredCount > 0 && <p>🔴 มีเครื่องมือหมดอายุ {expiredCount} รายการ</p>}
            {warningCount > 0 && <p>🟡 มีเครื่องมือใกล้ครบกำหนด {warningCount} รายการ</p>}
          </div>
        )}

        <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
          <table className="min-w-full divide-y divide-gray-200 text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-4 py-2 text-left font-medium text-gray-700">รหัสเครื่องมือ</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">ชื่อ</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">แผนก</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">สอบเทียบล่าสุด</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">วันหมดอายุ</th>
                <th className="px-4 py-2 text-left font-medium text-gray-700">สถานะ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {withStatus.map((tool) => (
                <tr key={tool.id}>
                  <td className="px-4 py-2 text-gray-900">{tool.toolCode}</td>
                  <td className="px-4 py-2">
                    <Link href={`/tools/${tool.id}`} className="text-blue-700 hover:underline">
                      {tool.name}
                    </Link>
                  </td>
                  <td className="px-4 py-2 text-gray-900">{tool.department}</td>
                  <td className="px-4 py-2 text-gray-900">
                    {tool.lastCalibrationDate.toLocaleDateString("th-TH")}
                  </td>
                  <td className="px-4 py-2 text-gray-900">{tool.expiryDate.toLocaleDateString("th-TH")}</td>
                  <td className="px-4 py-2">
                    <span
                      className={`rounded-full px-2 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[tool.status]}`}
                    >
                      {STATUS_LABEL[tool.status]}
                    </span>
                  </td>
                </tr>
              ))}
              {withStatus.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-6 text-center text-gray-500">
                    ยังไม่มีข้อมูลเครื่องมือ
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
