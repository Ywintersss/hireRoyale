/*
  Warnings:

  - Added the required column `updatedAt` to the `Event` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `Resume` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "role" ADD COLUMN "description" TEXT;
ALTER TABLE "role" ADD COLUMN "displayName" TEXT;

-- CreateTable
CREATE TABLE "connection" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "senderId" TEXT NOT NULL,
    "receiverId" TEXT NOT NULL,
    "eventId" TEXT,
    "status" TEXT NOT NULL,
    "message" TEXT,
    "roomId" TEXT,
    "callStatus" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "connection_senderId_fkey" FOREIGN KEY ("senderId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "connection_receiverId_fkey" FOREIGN KEY ("receiverId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "connection_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- RedefineTables
PRAGMA defer_foreign_keys=ON;
PRAGMA foreign_keys=OFF;
CREATE TABLE "new_Event" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "date" DATETIME,
    "time" DATETIME,
    "requirements" TEXT,
    "status" TEXT,
    "maxParticipants" INTEGER,
    "industry" TEXT,
    "level" TEXT,
    "imgUrl" TEXT,
    "eventType" TEXT,
    "location" TEXT,
    "timezone" TEXT,
    "tags" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "createdById" TEXT NOT NULL,
    CONSTRAINT "Event_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "user" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);
INSERT INTO "new_Event" ("createdById", "date", "description", "id", "imgUrl", "industry", "level", "maxParticipants", "name", "requirements", "status", "time") SELECT "createdById", "date", "description", "id", "imgUrl", "industry", "level", "maxParticipants", "name", "requirements", "status", "time" FROM "Event";
DROP TABLE "Event";
ALTER TABLE "new_Event" RENAME TO "Event";
CREATE TABLE "new_Resume" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "resumeUrl" TEXT NOT NULL,
    "fileName" TEXT,
    "fileSize" INTEGER,
    "summary" TEXT,
    "workHistory" TEXT,
    "education" TEXT,
    "skills" TEXT,
    "parsedData1" TEXT,
    "parsedData2" TEXT,
    "parsedData3" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);
INSERT INTO "new_Resume" ("id", "parsedData1", "parsedData2", "parsedData3", "resumeUrl") SELECT "id", "parsedData1", "parsedData2", "parsedData3", "resumeUrl" FROM "Resume";
DROP TABLE "Resume";
ALTER TABLE "new_Resume" RENAME TO "Resume";
CREATE TABLE "new_user" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "image" TEXT,
    "contact" TEXT,
    "password" TEXT,
    "location" TEXT,
    "bio" TEXT,
    "experience" TEXT,
    "skills" TEXT,
    "company" TEXT,
    "position" TEXT,
    "industry" TEXT,
    "rating" REAL DEFAULT 0.0,
    "isOnline" BOOLEAN NOT NULL DEFAULT false,
    "lastActive" DATETIME,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    "roleId" TEXT,
    "resumeId" TEXT,
    CONSTRAINT "user_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES "role" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "user_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);
INSERT INTO "new_user" ("contact", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "resumeId", "roleId", "updatedAt") SELECT "contact", "createdAt", "email", "emailVerified", "id", "image", "name", "password", "resumeId", "roleId", "updatedAt" FROM "user";
DROP TABLE "user";
ALTER TABLE "new_user" RENAME TO "user";
CREATE UNIQUE INDEX "user_email_key" ON "user"("email");
CREATE UNIQUE INDEX "user_resumeId_key" ON "user"("resumeId");
CREATE TABLE "new_user_event" (
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "requirements" TEXT,
    "joinedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY ("userId", "eventId"),
    CONSTRAINT "user_event_userId_fkey" FOREIGN KEY ("userId") REFERENCES "user" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "user_event_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);
INSERT INTO "new_user_event" ("eventId", "userId") SELECT "eventId", "userId" FROM "user_event";
DROP TABLE "user_event";
ALTER TABLE "new_user_event" RENAME TO "user_event";
PRAGMA foreign_keys=ON;
PRAGMA defer_foreign_keys=OFF;

-- CreateIndex
CREATE UNIQUE INDEX "connection_senderId_receiverId_eventId_key" ON "connection"("senderId", "receiverId", "eventId");
