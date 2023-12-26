/*
  Warnings:

  - Added the required column `description` to the `Club` table without a default value. This is not possible if the table is not empty.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,
    "isPending" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    CONSTRAINT "Club_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Club" ("archivedAt", "channel", "createdAt", "id", "isPending", "name", "serverId", "topics", "updatedAt") SELECT "archivedAt", "channel", "createdAt", "id", "isPending", "name", "serverId", "topics", "updatedAt" FROM "Club";
DROP TABLE "Club";
ALTER TABLE "new_Club" RENAME TO "Club";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
