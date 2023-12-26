/*
  Warnings:

  - You are about to alter the column `userId` on the `Vote` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `Server` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Server` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `User` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `clubId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `id` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `serverId` on the `User` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - The primary key for the `Club` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to alter the column `id` on the `Club` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `ownerId` on the `Club` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `serverId` on the `Club` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.
  - You are about to alter the column `uploaderId` on the `Submission` table. The data in that column could be lost. The data in that column will be cast from `Int` to `BigInt`.

*/
-- RedefineTables
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Vote" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "submissionId" INTEGER NOT NULL,
    "userId" BIGINT NOT NULL,
    "value" INTEGER NOT NULL,
    CONSTRAINT "Vote_submissionId_fkey" FOREIGN KEY ("submissionId") REFERENCES "Submission" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Vote_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Vote" ("id", "submissionId", "userId", "value") SELECT "id", "submissionId", "userId", "value" FROM "Vote";
DROP TABLE "Vote";
ALTER TABLE "new_Vote" RENAME TO "Vote";
CREATE TABLE "new_Server" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "clubAnnouncementChannel" TEXT NOT NULL,
    "clubListChannel" TEXT NOT NULL,
    "minimumVotesToPass" INTEGER NOT NULL,
    "minimumVotesToFail" INTEGER NOT NULL,
    "minimumVotesToBlacklist" INTEGER NOT NULL
);
INSERT INTO "new_Server" ("clubAnnouncementChannel", "clubListChannel", "id", "minimumVotesToBlacklist", "minimumVotesToFail", "minimumVotesToPass", "name") SELECT "clubAnnouncementChannel", "clubListChannel", "id", "minimumVotesToBlacklist", "minimumVotesToFail", "minimumVotesToPass", "name" FROM "Server";
DROP TABLE "Server";
ALTER TABLE "new_Server" RENAME TO "Server";
CREATE TABLE "new_User" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "clubId" BIGINT NOT NULL,
    "serverId" BIGINT NOT NULL,
    CONSTRAINT "User_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "User_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_User" ("clubId", "id", "serverId") SELECT "clubId", "id", "serverId" FROM "User";
DROP TABLE "User";
ALTER TABLE "new_User" RENAME TO "User";
CREATE TABLE "new_Club" (
    "id" BIGINT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "topics" TEXT NOT NULL,
    "serverId" BIGINT NOT NULL,
    "ownerId" BIGINT NOT NULL,
    "isPending" BOOLEAN NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    CONSTRAINT "Club_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Club_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Club" ("archivedAt", "channel", "createdAt", "description", "id", "isPending", "name", "ownerId", "serverId", "topics", "updatedAt") SELECT "archivedAt", "channel", "createdAt", "description", "id", "isPending", "name", "ownerId", "serverId", "topics", "updatedAt" FROM "Club";
DROP TABLE "Club";
ALTER TABLE "new_Club" RENAME TO "Club";
CREATE UNIQUE INDEX "Club_ownerId_key" ON "Club"("ownerId");
CREATE TABLE "new_Submission" (
    "id" INTEGER NOT NULL PRIMARY KEY AUTOINCREMENT,
    "url" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "uploaderId" BIGINT NOT NULL,
    CONSTRAINT "Submission_uploaderId_fkey" FOREIGN KEY ("uploaderId") REFERENCES "User" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Submission" ("id", "text", "type", "uploaderId", "url") SELECT "id", "text", "type", "uploaderId", "url" FROM "Submission";
DROP TABLE "Submission";
ALTER TABLE "new_Submission" RENAME TO "Submission";
PRAGMA foreign_key_check;
PRAGMA foreign_keys=ON;
