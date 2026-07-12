export function ToolSearchForm({ basePath, query }: { basePath: string; query: string }) {
  return (
    <form action={basePath} method="GET" className="flex flex-wrap gap-2">
      <input
        type="text"
        name="q"
        defaultValue={query}
        placeholder="ค้นหารหัส, ชื่อ, หรือแผนก..."
        className="w-full max-w-sm rounded-md border border-gray-300 px-3 py-2 text-sm"
      />
      <button type="submit" className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white">
        ค้นหา
      </button>
      {query && (
        <a
          href={basePath}
          className="rounded-md border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
        >
          ล้างการค้นหา
        </a>
      )}
    </form>
  );
}
