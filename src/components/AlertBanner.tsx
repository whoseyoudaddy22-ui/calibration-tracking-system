import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { getToolStatus } from "@/lib/status";
import { AlertBannerClient } from "@/components/AlertBannerClient";

export async function AlertBanner() {
  const session = await auth();
  if (!session?.user) return null;

  const tools = await prisma.tool.findMany({ orderBy: { expiryDate: "asc" } });

  const items = tools
    .map((tool) => ({
      id: tool.id,
      toolCode: tool.toolCode,
      name: tool.name,
      expiryDate: tool.expiryDate.toISOString(),
      status: getToolStatus(tool.expiryDate),
    }))
    .filter((tool): tool is typeof tool & { status: "warning" | "expired" } => tool.status !== "normal");

  if (items.length === 0) return null;

  return <AlertBannerClient items={items} />;
}
