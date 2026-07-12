import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import { E2E_USERNAME, E2E_PASSWORD } from "./testDb";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

async function main() {
  const hashed = await bcrypt.hash(E2E_PASSWORD, 12);
  await prisma.user.upsert({
    where: { username: E2E_USERNAME },
    create: { username: E2E_USERNAME, password: hashed, role: "Editor" },
    update: { password: hashed, role: "Editor" },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
