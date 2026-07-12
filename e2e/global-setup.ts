import { execSync } from "node:child_process";
import { E2E_DATABASE_URL } from "./testDb";
import { removeDbFiles } from "./removeDbFiles";

export default async function globalSetup() {
  await removeDbFiles();

  const env = { ...process.env, DATABASE_URL: E2E_DATABASE_URL };
  execSync("npx prisma migrate deploy", { env, stdio: "inherit" });
  execSync("npx tsx e2e/seed.ts", { env, stdio: "inherit" });
}
