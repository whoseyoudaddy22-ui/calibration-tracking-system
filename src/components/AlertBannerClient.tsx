"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

type AlertItem = {
  id: string;
  toolCode: string;
  name: string;
  expiryDate: string;
  status: "warning" | "expired";
};

function dismissalKey() {
  const today = new Date().toISOString().slice(0, 10);
  return `calibration-alert-dismissed-${today}`;
}

export function AlertBannerClient({ items }: { items: AlertItem[] }) {
  const [dismissed, setDismissed] = useState(false);
  const [expanded, setExpanded] = useState(false);

  useEffect(() => {
    setDismissed(sessionStorage.getItem(dismissalKey()) === "1");
  }, []);

  if (dismissed) return null;

  const expiredCount = items.filter((item) => item.status === "expired").length;
  const warningCount = items.filter((item) => item.status === "warning").length;

  return (
    <div className="border-b border-amber-300 bg-amber-50 text-amber-900">
      <div className="mx-auto flex max-w-5xl flex-wrap items-center gap-3 px-4 py-2 text-sm">
        <button
          type="button"
          onClick={() => setExpanded((v) => !v)}
          className="flex flex-1 flex-wrap items-center gap-3 text-left"
        >
          {expiredCount > 0 && <span>🔴 เครื่องมือหมดอายุ {expiredCount} รายการ</span>}
          {warningCount > 0 && <span>🟡 ใกล้ครบกำหนด {warningCount} รายการ</span>}
          <span className="text-xs underline underline-offset-2">
            {expanded ? "ซ่อนรายการ" : "ดูรายการ"}
          </span>
        </button>
        <button
          type="button"
          onClick={() => {
            sessionStorage.setItem(dismissalKey(), "1");
            setDismissed(true);
          }}
          aria-label="ปิดการแจ้งเตือน"
          className="rounded-full px-2 py-1 leading-none text-amber-700 hover:bg-amber-100"
        >
          ✕
        </button>
      </div>
      {expanded && (
        <ul className="mx-auto max-w-5xl divide-y divide-amber-200 px-4 pb-2 text-sm">
          {items.map((item) => (
            <li key={item.id} className="flex items-center justify-between gap-3 py-1.5">
              <Link href={`/tools/${item.id}`} className="hover:underline">
                {item.status === "expired" ? "🔴" : "🟡"} {item.toolCode} · {item.name}
              </Link>
              <span className="text-xs whitespace-nowrap text-amber-700">
                {new Date(item.expiryDate).toLocaleDateString("th-TH")}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
