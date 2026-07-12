import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));

export const TEST_DB_FILE = path.resolve(here, "../../test-integration.db");
export const TEST_DATABASE_URL = `file:${TEST_DB_FILE}`;
