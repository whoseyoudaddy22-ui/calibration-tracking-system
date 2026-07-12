-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_CalibrationHistory" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "toolId" TEXT NOT NULL,
    "date" DATETIME NOT NULL,
    "result" TEXT NOT NULL DEFAULT 'ผ่าน',
    "notes" TEXT,
    "performedById" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "CalibrationHistory_toolId_fkey" FOREIGN KEY ("toolId") REFERENCES "Tool" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "CalibrationHistory_performedById_fkey" FOREIGN KEY ("performedById") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_CalibrationHistory" ("createdAt", "date", "id", "performedById", "toolId") SELECT "createdAt", "date", "id", "performedById", "toolId" FROM "CalibrationHistory";
DROP TABLE "CalibrationHistory";
ALTER TABLE "new_CalibrationHistory" RENAME TO "CalibrationHistory";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;
