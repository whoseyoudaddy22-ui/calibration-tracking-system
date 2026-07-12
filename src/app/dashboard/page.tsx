import Link from "next/link";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { Nav } from "@/components/Nav";
import { ToolSearchForm } from "@/components/ToolSearchForm";
import { Pagination } from "@/components/Pagination";
import { StatusDonutChart } from "@/components/StatusDonutChart";
import { StatCard } from "@/components/StatCard";
import { DueSummaryList } from "@/components/DueSummaryList";
import { MonthlyDueChart } from "@/components/MonthlyDueChart";
import { ClipboardListIcon, CheckCircleIcon, ClockIcon, ExclamationTriangleIcon } from "@/components/icons";
import { getToolStatus, getDaysRemaining, STATUS_LABEL, STATUS_BADGE_CLASS, type ToolStatus } from "@/lib/status";

const PAGE_SIZE = 20;
const MONTH_LABELS = [
  "ม.ค.",
  "ก.พ.",
  "มี.ค.",
  "เม.ย.",
  "พ.ค.",
  "มิ.ย.",
  "ก.ค.",
  "ส.ค.",
  "ก.ย.",
  "ต.ค.",
  "พ.ย.",
  "ธ.ค.",
];

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

  const now = new Date();

  const [tools, total, allTools] = await Promise.all([
    prisma.tool.findMany({
      where,
      orderBy: { expiryDate: "asc" },
      skip: (page - 1) * PAGE_SIZE,
      take: PAGE_SIZE,
    }),
    prisma.tool.count({ where }),
    prisma.tool.findMany({ select: { id: true, toolCode: true, name: true, expiryDate: true } }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const withStatus = tools.map((tool) => ({ ...tool, status: getToolStatus(tool.expiryDate, now) }));

  const overview = allTools.map((tool) => ({
    ...tool,
    status: getToolStatus(tool.expiryDate, now),
    daysRemaining: getDaysRemaining(tool.expiryDate, now),
  }));

  const statusCounts = overview.reduce<Record<ToolStatus, number>>(
    (acc, tool) => {
      acc[tool.status] += 1;
      return acc;
    },
    { normal: 0, warning: 0, expired: 0 },
  );

  const totalTools = overview.length;
  const percentOf = (count: number) => (totalTools > 0 ? `${((count / totalTools) * 100).toFixed(1)}%` : undefined);

  const nearDue = overview
    .filter((tool) => tool.status === "warning")
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
    .slice(0, 5)
    .map((tool) => ({
      id: tool.id,
      toolCode: tool.toolCode,
      name: tool.name,
      expiryDate: tool.expiryDate,
      dayLabel: `เหลืออีก ${tool.daysRemaining} วัน`,
    }));

  const expiredList = overview
    .filter((tool) => tool.status === "expired")
    .sort((a, b) => a.expiryDate.getTime() - b.expiryDate.getTime())
    .slice(0, 5)
    .map((tool) => ({
      id: tool.id,
      toolCode: tool.toolCode,
      name: tool.name,
      expiryDate: tool.expiryDate,
      dayLabel: `เกิน ${Math.abs(tool.daysRemaining)} วัน`,
    }));

  const currentYear = now.getFullYear();
  const monthlyDue = MONTH_LABELS.map((label, monthIndex) => ({
    label,
    count: overview.filter(
      (tool) => tool.expiryDate.getFullYear() === currentYear && tool.expiryDate.getMonth() === monthIndex,
    ).length,
  }));

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl space-y-6">
        <Nav role={session?.user.role} />
        <h1 className="text-2xl font-semibold text-gray-900">แดชบอร์ดสถานะเครื่องมือ</h1>

        <div className="grid grid-cols-2 gap-4 md:grid-cols-4">
          <StatCard icon={<ClipboardListIcon />} label="เครื่องมือทั้งหมด" value={totalTools} color="blue" />
          <StatCard
            icon={<CheckCircleIcon />}
            label="ปกติ"
            value={statusCounts.normal}
            sublabel={percentOf(statusCounts.normal)}
            color="green"
          />
          <StatCard
            icon={<ClockIcon />}
            label="ใกล้ครบกำหนด"
            value={statusCounts.warning}
            sublabel={percentOf(statusCounts.warning)}
            color="yellow"
          />
          <StatCard
            icon={<ExclamationTriangleIcon />}
            label="หมดอายุ"
            value={statusCounts.expired}
            sublabel={percentOf(statusCounts.expired)}
            color="red"
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <StatusDonutChart counts={statusCounts} />
          <DueSummaryList
            title="เครื่องมือใกล้ครบกำหนด (ภายใน 30 วัน)"
            emptyText="ไม่มีเครื่องมือที่ใกล้ครบกำหนด"
            dayBadgeClass={STATUS_BADGE_CLASS.warning}
            items={nearDue}
          />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <DueSummaryList
            title="เครื่องมือที่หมดอายุ"
            emptyText="ไม่มีเครื่องมือที่หมดอายุ"
            dayBadgeClass={STATUS_BADGE_CLASS.expired}
            items={expiredList}
          />
          <MonthlyDueChart data={monthlyDue} />
        </div>

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
