-- CreateTable
CREATE TABLE "Club" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "channel" TEXT NOT NULL,
    "owner" TEXT NOT NULL,
    "isPending" BOOLEAN NOT NULL,
    "isArchived" BOOLEAN NOT NULL,
    "archiveReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "archivedAt" DATETIME,
    "serverId" TEXT,
    CONSTRAINT "Club_serverId_fkey" FOREIGN KEY ("serverId") REFERENCES "Server" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Member" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clubId" TEXT NOT NULL,
    "user" TEXT NOT NULL,
    CONSTRAINT "Member_clubId_fkey" FOREIGN KEY ("clubId") REFERENCES "Club" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Server" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "settingsId" TEXT NOT NULL,
    CONSTRAINT "Server_settingsId_fkey" FOREIGN KEY ("settingsId") REFERENCES "Settings" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Voting" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "minimum" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Archive" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "archiveInactivity" BOOLEAN NOT NULL,
    "archiveInactivityDays" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "Roles" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "createClub" TEXT NOT NULL,
    "adminCommands" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "Settings" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "clubListChannel" TEXT NOT NULL,
    "clubAnnounceChannel" TEXT NOT NULL,
    "clubArchiveCategory" TEXT NOT NULL,
    "votingId" TEXT NOT NULL,
    "archiveId" TEXT NOT NULL,
    "rolesId" TEXT NOT NULL,
    CONSTRAINT "Settings_votingId_fkey" FOREIGN KEY ("votingId") REFERENCES "Voting" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Settings_archiveId_fkey" FOREIGN KEY ("archiveId") REFERENCES "Archive" ("id") ON DELETE RESTRICT ON UPDATE CASCADE,
    CONSTRAINT "Settings_rolesId_fkey" FOREIGN KEY ("rolesId") REFERENCES "Roles" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
