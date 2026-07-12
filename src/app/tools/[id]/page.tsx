import { notFound } from "next/navigation";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { getToolStatus, STATUS_LABEL, STATUS_BADGE_CLASS } from "@/lib/status";

export default async function ToolHistoryPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();

  const tool = await prisma.tool.findUnique({
    where: { id },
    include: {
      calibrationHistories: {
        orderBy: { date: "desc" },
        include: { performedBy: true },
      },
    },
  });

  if (!tool) notFound();

  const status = getToolStatus(tool.expiryDate);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl space-y-6">
        <Nav role={session?.user.role} />

        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900">{tool.name}</h1>
            <p className="text-sm text-gray-500">
              {tool.toolCode} · {tool.department}
            </p>
          </div>
          <span className={`rounded-full px-3 py-1 text-sm font-medium ${STATUS_BADGE_CLASS[status]}`}>
            {STATUS_LABEL[status]}
          </span>
        </div>

        <div className="grid grid-cols-1 gap-4 rounded-lg border border-gray-200 bg-white p-4 text-sm sm:grid-cols-2">
          <div>
            <span className="block font-medium text-gray-700">สอบเทียบล่าสุด</span>
            <span className="text-gray-900">{tool.lastCalibrationDate.toLocaleDateString("th-TH")}</span>
          </div>
          <div>
            <span className="block font-medium text-gray-700">วันหมดอายุ</span>
            <span className="text-gray-900">{tool.expiryDate.toLocaleDateString("th-TH")}</span>
          </div>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-medium text-gray-900">ประวัติการสอบเทียบ</h2>
          <div className="overflow-x-auto rounded-lg border border-gray-200 bg-white">
            <table className="min-w-full divide-y divide-gray-200 text-sm">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">วันที่สอบเทียบ</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">ผล</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">หมายเหตุ</th>
                  <th className="px-4 py-2 text-left font-medium text-gray-700">ผู้ดำเนินการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {tool.calibrationHistories.map((entry) => (
                  <tr key={entry.id}>
                    <td className="px-4 py-2 text-gray-900">{entry.date.toLocaleDateString("th-TH")}</td>
                    <td className="px-4 py-2">
                      <span
                        className={
                          entry.result === "ผ่าน"
                            ? "rounded-full bg-green-100 px-2 py-1 text-xs font-medium text-green-800"
                            : "rounded-full bg-red-100 px-2 py-1 text-xs font-medium text-red-800"
                        }
                      >
                        {entry.result}
                      </span>
                    </td>
                    <td className="px-4 py-2 text-gray-600">{entry.notes ?? "-"}</td>
                    <td className="px-4 py-2 text-gray-900">{entry.performedBy.username}</td>
                  </tr>
                ))}
                {tool.calibrationHistories.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-4 py-6 text-center text-gray-500">
                      ยังไม่มีประวัติการสอบเทียบ
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </div>
  );
}
