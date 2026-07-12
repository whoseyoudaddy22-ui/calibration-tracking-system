import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { PrismaClient } from "../src/generated/prisma/client";
import type { Role } from "../src/generated/prisma/enums";

const adapter = new PrismaBetterSqlite3({ url: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

const DAY_MS = 24 * 60 * 60 * 1000;

function daysFromNow(days: number): Date {
  return new Date(Date.now() + days * DAY_MS);
}

async function ensureUser(username: string, password: string, role: Role) {
  const existing = await prisma.user.findUnique({ where: { username } });
  if (existing) {
    console.log(`User "${username}" already exists, skipping.`);
    return existing;
  }

  const hashed = await bcrypt.hash(password, 12);
  const created = await prisma.user.create({
    data: { username, password: hashed, role },
  });

  console.log(`Created ${role} user "${username}".`);
  return created;
}

async function ensureAdminUser() {
  const username = process.env.SEED_ADMIN_USERNAME ?? "admin";
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  return ensureUser(username, password, "Admin");
}

// Same password as the Admin account — this is a graduation project handed
// off to the customer as-is, not something with ongoing security upkeep.
async function ensureDemoUsers() {
  const password = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";
  await ensureUser("editor", password, "Editor");
  await ensureUser("visitor", password, "Visitor");
}

async function ensureSampleTools(performedById: string) {
  const toolCount = await prisma.tool.count();
  if (toolCount > 0) {
    console.log("Tools already exist, skipping sample data.");
    return;
  }

  // expiryOffsetDays chosen to demonstrate all three dashboard statuses:
  // > 30 days = normal (green), 0-30 days = warning (yellow), < 0 = expired (red).
  const samples = [
    { toolCode: "TH-001", name: "เครื่องชั่งดิจิตอล", department: "แผนก QC", expiryOffsetDays: 120 },
    { toolCode: "TH-002", name: "เวอร์เนียคาลิปเปอร์", department: "แผนกผลิต", expiryOffsetDays: 200 },
    { toolCode: "TH-003", name: "เทอร์โมมิเตอร์อินฟราเรด", department: "แผนกคลังสินค้า", expiryOffsetDays: 12 },
    { toolCode: "TH-004", name: "เกจวัดแรงดัน", department: "แผนกวิศวกรรม", expiryOffsetDays: 25 },
    { toolCode: "TH-005", name: "ประแจทอร์ค", department: "แผนกซ่อมบำรุง", expiryOffsetDays: -15 },
    { toolCode: "TH-006", name: "มัลติมิเตอร์", department: "แผนกไฟฟ้า", expiryOffsetDays: -60 },
  ];

  for (const sample of samples) {
    const expiryDate = daysFromNow(sample.expiryOffsetDays);
    const lastCalibrationDate = daysFromNow(sample.expiryOffsetDays - 365);
    const priorCalibrationDate = daysFromNow(sample.expiryOffsetDays - 730);

    const tool = await prisma.tool.create({
      data: {
        toolCode: sample.toolCode,
        name: sample.name,
        department: sample.department,
        lastCalibrationDate,
        expiryDate,
      },
    });

    await prisma.calibrationHistory.create({
      data: {
        toolId: tool.id,
        date: priorCalibrationDate,
        result: "ผ่าน",
        notes: null,
        performedById,
      },
    });
    await prisma.calibrationHistory.create({
      data: {
        toolId: tool.id,
        date: lastCalibrationDate,
        result: "ผ่าน",
        notes: null,
        performedById,
      },
    });
  }

  console.log(`Created ${samples.length} sample tools with calibration history.`);
}

async function main() {
  const admin = await ensureAdminUser();
  await ensureDemoUsers();
  await ensureSampleTools(admin.id);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
