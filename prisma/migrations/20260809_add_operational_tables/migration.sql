-- ScheduleTemplate: one row per assessor, stores their weekly availability
CREATE TABLE "ScheduleTemplate" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "schedule"  JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ScheduleTemplate_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "ScheduleTemplate_userId_key" ON "ScheduleTemplate"("userId");

ALTER TABLE "ScheduleTemplate"
    ADD CONSTRAINT "ScheduleTemplate_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- SlotRequest: assessor schedule change requests pending admin approval
CREATE TABLE "SlotRequest" (
    "id"               TEXT NOT NULL,
    "assessorId"       TEXT NOT NULL,
    "currentSchedule"  JSONB,
    "proposedSchedule" JSONB NOT NULL,
    "reason"           TEXT NOT NULL,
    "status"           TEXT NOT NULL DEFAULT 'pending',
    "adminNote"        TEXT,
    "resolvedAt"       TIMESTAMP(3),
    "resolvedById"     TEXT,
    "resolvedByName"   TEXT,
    "createdAt"        TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "SlotRequest_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "SlotRequest"
    ADD CONSTRAINT "SlotRequest_assessorId_fkey"
    FOREIGN KEY ("assessorId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- Notification: in-app notifications for users and admins
CREATE TABLE "Notification" (
    "id"            TEXT NOT NULL,
    "recipientType" TEXT NOT NULL,
    "recipientId"   TEXT,
    "type"          TEXT NOT NULL,
    "title"         TEXT NOT NULL,
    "body"          TEXT NOT NULL,
    "meta"          JSONB NOT NULL,
    "read"          BOOLEAN NOT NULL DEFAULT false,
    "createdAt"     TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

ALTER TABLE "Notification"
    ADD CONSTRAINT "Notification_recipientId_fkey"
    FOREIGN KEY ("recipientId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- AssessorPreference: accent and topic preferences per assessor
CREATE TABLE "AssessorPreference" (
    "id"        TEXT NOT NULL,
    "userId"    TEXT NOT NULL,
    "accent"    TEXT NOT NULL DEFAULT 'american',
    "topics"    TEXT[] NOT NULL DEFAULT ARRAY[]::TEXT[],
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AssessorPreference_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "AssessorPreference_userId_key" ON "AssessorPreference"("userId");

ALTER TABLE "AssessorPreference"
    ADD CONSTRAINT "AssessorPreference_userId_fkey"
    FOREIGN KEY ("userId") REFERENCES "User"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;

-- ScheduleConfig: singleton row for admin-configurable schedule limits
CREATE TABLE "ScheduleConfig" (
    "id"       TEXT NOT NULL,
    "minDays"  INTEGER NOT NULL DEFAULT 2,
    "maxDays"  INTEGER NOT NULL DEFAULT 5,
    "minSlots" INTEGER NOT NULL DEFAULT 4,
    "maxSlots" INTEGER NOT NULL DEFAULT 32,

    CONSTRAINT "ScheduleConfig_pkey" PRIMARY KEY ("id")
);
