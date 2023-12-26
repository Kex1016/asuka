/*
  Warnings:

  - You are about to drop the `Archive` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Member` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Roles` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Settings` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `Voting` table. If the table is not empty, all the data it contains will be lost.
  - The primary key for the `Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `settingsId` on the `Server` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `Server` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - The primary key for the `ClubTs` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `archiveReason` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `archivedAt` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `createdAt` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `description` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `isArchived` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `isPending` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `owner` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to drop the column `updatedAt` on the `ClubTs` table. All the data in the column will be lost.
  - You are about to alter the column `id` on the `ClubTs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - You are about to alter the column `serverId` on the `ClubTs` table. The data in that column could be lost. The data in that column will be cast from `String` to `Int`.
  - Added the required column `clubAnnouncementChannel` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `clubListChannel` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumVotesToBlacklist` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumVotesToFail` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `minimumVotesToPass` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Added the required column `name` to the `Server` table without a default value. This is not possible if the table is not empty.
  - Made the column `serverId` on table `ClubTs` required. This step will fail if there are existing NULL values in that column.

*/
-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Archive";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Member";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Roles";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Settings";
PRAGMA foreign_keys=on;

-- DropTable
PRAGMA foreign_keys=off;
DROP TABLE "Voting";
PRAGMA foreign_keys=on;

-- CreateTable
CREATE TABLE "User" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "clubId" INTEGER NOT NULL,
    "serverId" INTEGER NOT NULL,
    CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "ClubTs" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Submission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploaderId" INTEGER NOT NULL,
    CONSTRAINT "Submission_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submissionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "Vote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Server" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "clubAnnouncementChannel" TEXT NOT NULL,
    "clubListChannel" TEXT NOT NULL,
    "minimumVotesToPass" INTEGER NOT NULL,
    "minimumVotesToFail" INTEGER NOT NULL,
    "minimumVotesToBlacklist" INTEGER NOT NULL
);
INSERT INTO "new_Server" ("id") SELECT "id" FROM "Server";
DROP TABLE "Server";
ALTER TABLE "new_Server" RENAME TO "Server";
CREATE TABLE "new_Club" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "name" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "serverId" INTEGER NOT NULL,
    CONSTRAINT "Club_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Club" ("channel", "id", "name", "serverId") SELECT "channel", "id", "name", "serverId" FROM "ClubTs";
DROP TABLE "ClubTs";
ALTER TABLE "new_Club" RENAME TO "ClubTs";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
