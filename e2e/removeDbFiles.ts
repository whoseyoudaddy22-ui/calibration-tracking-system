import fs from "node:fs";
import { E2E_DB_FILE } from "./testDb";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// On Windows the previous Next.js dev server process can hold a brief file
// lock on the sqlite file even after Playwright has killed it, so this is
// best-effort: retry a few times, then warn and move on rather than fail the
// whole run over a leftover gitignored file (the next run's setup will
// retry removal, and seeding upserts so a stale file doesn't break it).
export async function removeDbFiles() {
  for (const suffix of ["", "-journal", "-wal", "-shm"]) {
    const file = E2E_DB_FILE + suffix;
    for (let attempt = 1; attempt <= 5; attempt++) {
      try {
        if (fs.existsSync(file)) fs.rmSync(file);
        break;
      } catch (error) {
        if (attempt === 5) {
          console.warn(`[e2e] could not remove ${file}, leaving it in place:`, error);
          break;
        }
        await sleep(200 * attempt);
      }
    }
  }
}
