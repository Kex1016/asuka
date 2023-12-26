/*
  Warnings:

  - You are about to drop the `ClubTs` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "ClubTs";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,
    CONSTRAINT "Club_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clubId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,
    CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("clubId", "id", "serverId") SELECT "clubId", "id", "serverId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
