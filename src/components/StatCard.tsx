import type { ReactNode } from "react";

const COLOR_CLASSES = {
  blue: { bg: "bg-blue-100", text: "text-blue-600" },
  green: { bg: "bg-green-100", text: "text-green-600" },
  yellow: { bg: "bg-yellow-100", text: "text-yellow-600" },
  red: { bg: "bg-red-100", text: "text-red-600" },
} as const;

export function StatCard({
  icon,
  label,
  value,
  sublabel,
  color,
}: {
  icon: ReactNode;
  label: string;
  value: number;
  sublabel?: string;
  color: keyof typeof COLOR_CLASSES;
}) {
  const { bg, text } = COLOR_CLASSES[color];

  return (
    <div className="flex items-center gap-4 rounded-lg border border-gray-200 bg-white p-4">
      <span className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${bg} ${text}`}>
        {icon}
      </span>
      <div>
        <p className="text-sm text-gray-700">{label}</p>
        <p className="text-2xl font-semibold text-gray-900">{value.toLocaleString("th-TH")}</p>
        {sublabel && <p className="text-xs text-gray-500">{sublabel}</p>}
      </div>
    </div>
  );
}
