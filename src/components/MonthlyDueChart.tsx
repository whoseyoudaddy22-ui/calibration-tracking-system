const WIDTH = 600;
const HEIGHT = 240;
const PADDING = { top: 24, right: 16, bottom: 28, left: 16 };
const INNER_WIDTH = WIDTH - PADDING.left - PADDING.right;
const INNER_HEIGHT = HEIGHT - PADDING.top - PADDING.bottom;

export function MonthlyDueChart({ data }: { data: { label: string; count: number }[] }) {
  const total = data.reduce((sum, d) => sum + d.count, 0);

  if (total === 0) {
    return (
      <div className="rounded-lg border border-gray-200 bg-white p-6">
        <h2 className="text-lg font-medium text-gray-900">จำนวนเครื่องมือแยกตามเดือนที่ครบกำหนด</h2>
        <p className="mt-4 text-sm text-gray-500">ยังไม่มีข้อมูลเครื่องมือ</p>
      </div>
    );
  }

  const maxCount = Math.max(...data.map((d) => d.count));
  const yMax = Math.ceil(maxCount * 1.2) || 1;

  const points = data.map((d, i) => ({
    ...d,
    x: PADDING.left + (INNER_WIDTH / (data.length - 1)) * i,
    y: PADDING.top + INNER_HEIGHT - (d.count / yMax) * INNER_HEIGHT,
  }));

  const linePath = points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ");
  const baseline = PADDING.top + INNER_HEIGHT;
  const areaPath = `${linePath} L${points[points.length - 1].x},${baseline} L${points[0].x},${baseline} Z`;

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-6">
      <h2 className="text-lg font-medium text-gray-900">จำนวนเครื่องมือแยกตามเดือนที่ครบกำหนด</h2>
      <svg
        viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
        className="mt-4 w-full"
        role="img"
        aria-label="จำนวนเครื่องมือแยกตามเดือนที่ครบกำหนด"
      >
        <line
          x1={PADDING.left}
          y1={baseline}
          x2={WIDTH - PADDING.right}
          y2={baseline}
          stroke="#e5e7eb"
          strokeWidth={1}
        />
        <path d={areaPath} fill="#3b82f6" opacity={0.12} />
        <path d={linePath} fill="none" stroke="#3b82f6" strokeWidth={2} />
        {points.map((p) => (
          <g key={p.label}>
            <circle cx={p.x} cy={p.y} r={4} fill="#3b82f6" />
            {p.count > 0 && (
              <text x={p.x} y={p.y - 10} textAnchor="middle" fontSize={11} className="fill-gray-700">
                {p.count}
              </text>
            )}
            <text x={p.x} y={HEIGHT - 8} textAnchor="middle" fontSize={11} className="fill-gray-500">
              {p.label}
            </text>
          </g>
        ))}
      </svg>
    </div>
  );
}
