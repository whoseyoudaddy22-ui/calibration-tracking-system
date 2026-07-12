import { STATUS_LABEL, type ToolStatus } from "@/lib/status";

const STATUS_ORDER: ToolStatus[] = ["normal", "warning", "expired"];

const STATUS_CHART_COLOR: Record<ToolStatus, string> = {
  normal: "#22c55e",
  warning: "#eab308",
  expired: "#ef4444",
};

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 70;
const STROKE_WIDTH = 28;
const CIRCUMFERENCE = 2 * Math.PI * RADIUS;

export function StatusDonutChart({ counts }: { counts: Record<ToolStatus, number> }) {
  const total = STATUS_ORDER.reduce((sum, status) => sum + counts[status], 0);

  if (total === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">สรุปสถานะการสอบเทียบเครื่องมือ</h2>
        <p className="mt-4 text-sm text-gray-500">ยังไม่มีข้อมูลเครื่องมือ</p>
      </div>
    );
  }

  const activeStatuses = STATUS_ORDER.filter((status) => counts[status] > 0);
  const fractions = activeStatuses.map((status) => counts[status] / total);
  const segments = activeStatuses.map((status, i) => {
    const priorFraction = fractions.slice(0, i).reduce((sum, fraction) => sum + fraction, 0);
    return {
      status,
      dash: fractions[i] * CIRCUMFERENCE,
      offset: -priorFraction * CIRCUMFERENCE,
    };
  });

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-medium text-gray-900">สรุปสถานะการสอบเทียบเครื่องมือ</h2>
      <div className="mt-4 flex flex-col items-center gap-6 sm:flex-row">
        <div className="relative shrink-0">
          <svg
            viewBox={`0 0 ${SIZE} ${SIZE}`}
            width={SIZE}
            height={SIZE}
            role="img"
            aria-label="สัดส่วนสถานะการสอบเทียบเครื่องมือ"
          >
            <g transform={`rotate(-90 ${CENTER} ${CENTER})`}>
              {segments.map(({ status, dash, offset }) => (
                <circle
                  key={status}
                  cx={CENTER}
                  cy={CENTER}
                  r={RADIUS}
                  fill="none"
                  stroke={STATUS_CHART_COLOR[status]}
                  strokeWidth={STROKE_WIDTH}
                  strokeDasharray={`${dash} ${CIRCUMFERENCE - dash}`}
                  strokeDashoffset={offset}
                />
              ))}
            </g>
          </svg>
          <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-xl font-semibold text-gray-900">{total}</span>
            <span className="text-xs text-gray-500">รายการทั้งหมด</span>
          </div>
        </div>
        <ul className="w-full space-y-2 text-sm">
          {STATUS_ORDER.map((status) => {
            const count = counts[status];
            const percent = ((count / total) * 100).toFixed(1);
            return (
              <li key={status} className="flex items-center justify-between gap-3">
                <span className="flex items-center gap-2 text-gray-700">
                  <span
                    className="inline-block h-3 w-3 shrink-0 rounded-full"
                    style={{ backgroundColor: STATUS_CHART_COLOR[status] }}
                    aria-hidden
                  />
                  {STATUS_LABEL[status]}
                </span>
                <span className="text-gray-900">
                  {count} รายการ ({percent}%)
                </span>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
