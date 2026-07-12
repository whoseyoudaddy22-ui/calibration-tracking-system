import Link from "next/link";

export function DueSummaryList({
  title,
  emptyText,
  dayBadgeClass,
  items,
}: {
  title: string;
  emptyText: string;
  dayBadgeClass: string;
  items: { id: string; toolCode: string; name: string; expiryDate: Date; dayLabel: string }[];
}) {
  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-medium text-gray-900">{title}</h2>
      <div className="mt-4 overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 text-sm">
          <thead>
            <tr>
              <th className="px-2 py-2 text-left font-medium text-gray-700">รหัสเครื่องมือ</th>
              <th className="px-2 py-2 text-left font-medium text-gray-700">ชื่อเครื่องมือ</th>
              <th className="px-2 py-2 text-left font-medium text-gray-700">วันครบกำหนด</th>
              <th className="px-2 py-2 text-left font-medium text-gray-700"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {items.map((item) => (
              <tr key={item.id}>
                <td className="px-2 py-2 text-gray-900">{item.toolCode}</td>
                <td className="px-2 py-2">
                  <Link href={`/tools/${item.id}`} className="text-blue-700 hover:underline">
                    {item.name}
                  </Link>
                </td>
                <td className="px-2 py-2 text-gray-900">{item.expiryDate.toLocaleDateString("th-TH")}</td>
                <td className="px-2 py-2">
                  <span className={`rounded-full px-2 py-1 text-xs font-medium ${dayBadgeClass}`}>
                    {item.dayLabel}
                  </span>
                </td>
              </tr>
            ))}
            {items.length === 0 && (
              <tr>
                <td colSpan={4} className="px-2 py-6 text-center text-gray-500">
                  {emptyText}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
