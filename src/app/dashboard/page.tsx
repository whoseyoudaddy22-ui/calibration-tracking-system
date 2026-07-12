import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { ToolSearchForm } from "@/components/ToolSearchForm";
import { Pagination } from "@/components/Pagination";
import { getToolStatus, STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/status";

const PAGE_SIZE = 20;

export default async function DashboardPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  const { q: qParam, page: pageParam } = await searchParams;
  const q = (qParam ?? "").trim();
  const page = Math.max(1, Number(pageParam) || 1);

  const session = await auth();

  const where = q
    ? {
        OR: [
          { toolCode: { contains: q } },
          { name: { contains: q } },
          { department: { contains: q } },
        ],
      }
    : undefined;

  const [tools, total] = await Promise.all([
    prisma.tool.findMany({
      where,
      orderBy: { expiryDate: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.tool.count({ where }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const withStatus = tools.map((tool) => ({ ...tool, status: getToolStatus(tool.expiryDate) }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Nav role={session?.user.role} />
        <h1 className="text-2xl font-semibold text-gray-900">แดชบอร์ดสถานะเครื่องมือ</h1>

        <ToolSearchForm basePath="/dashboard" query={q} />

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
                    {q ? "ไม่พบเครื่องมือที่ค้นหา" : "ยังไม่มีข้อมูลเครื่องมือ"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <Pagination basePath="/dashboard" page={page} totalPages={totalPages} query={q} />
      </div>
    </div>
  );
}
