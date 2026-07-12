export type ToolStatus = "normal" | "warning" | "expired";

const WARNING_THRESHOLD_DAYS = 30;

export function getToolStatus(expiryDate: Date, now: Date = new Date()): ToolStatus {
  const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (diffDays < 0) return "expired";
  if (diffDays <= WARNING_THRESHOLD_DAYS) return "warning";
  return "normal";
}

export const STATUS_LABEL: Record<ToolStatus, string> = {
  normal: "🟢 ปกติ",
  warning: "🟡 ใกล้ครบกำหนด",
  expired: "🔴 หมดอายุ",
};

export const STATUS_BADGE_CLASS: Record<ToolStatus, string> = {
  normal: "bg-green-100 text-green-800",
  warning: "bg-yellow-100 text-yellow-800",
  expired: "bg-red-100 text-red-800",
};
