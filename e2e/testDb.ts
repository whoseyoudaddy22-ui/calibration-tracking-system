import path from "node:path";

export const E2E_DB_FILE = path.resolve(__dirname, "../e2e-test.db");
export const E2E_DATABASE_URL = `file:${E2E_DB_FILE}`;

export const E2E_PORT = 3100;
export const E2E_BASE_URL = `http://localhost:${E2E_PORT}`;

export const E2E_USERNAME = "e2e-editor";
export const E2E_PASSWORD = "E2ePassword123!";
export const E2E_AUTH_SECRET = "e2e-test-secret-not-for-production";
