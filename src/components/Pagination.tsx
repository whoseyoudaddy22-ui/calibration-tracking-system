import Link from "next/link";

export function Pagination({
  basePath,
  page,
  totalPages,
  query,
}: {
  basePath: string;
  page: number;
  totalPages: number;
  query: string;
}) {
  if (totalPages <= 1) return null;

  const hrefFor = (targetPage: number) => {
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (targetPage > 1) params.set("page", String(targetPage));
    const qs = params.toString();
    return qs ? `${basePath}?${qs}` : basePath;
  };

  return (
    <div className="flex items-center justify-between text-sm text-gray-700">
      <span>
        หน้า {page} จาก {totalPages}
      </span>
      <div className="flex gap-2">
        <PageLink href={hrefFor(page - 1)} disabled={page <= 1}>
          ก่อนหน้า
        </PageLink>
        <PageLink href={hrefFor(page + 1)} disabled={page >= totalPages}>
          ถัดไป
        </PageLink>
      </div>
    </div>
  );
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return (
      <span className="cursor-not-allowed rounded-md border border-gray-200 px-3 py-1.5 text-gray-400">
        {children}
      </span>
    );
  }
  return (
    <Link href={href} className="rounded-md border border-gray-300 px-3 py-1.5 hover:bg-gray-50">
      {children}
    </Link>
  );
}
