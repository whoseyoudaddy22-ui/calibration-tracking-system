import { execSync } from "node:child_process";
import fs from "node:fs";
import { TEST_DB_FILE, TEST_DATABASE_URL } from "./testDbPath";

function removeDbFiles() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const file = TEST_DB_FILE + suffix;
    if (fs.existsSync(file)) fs.rmSync(file);
  }
}

export default function setup() {
  removeDbFiles();

  execSync("npx prisma migrate deploy", {
    env: { ...process.env, DATABASE_URL: TEST_DATABASE_URL },
    stdio: "inherit",
  });

  return () => {
    removeDbFiles();
  };
}
