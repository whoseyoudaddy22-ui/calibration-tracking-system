import { TEST_DATABASE_URL } from "./testDbPath";

process.env.DATABASE_URL = TEST_DATABASE_URL;
process.env.AUTH_SECRET = process.env.AUTH_SECRET || "test-secret-not-for-production";
