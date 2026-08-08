-- Remove Google Calendar fields from User table
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleCalendarAccessToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleCalendarRefreshToken";
ALTER TABLE "User" DROP COLUMN IF EXISTS "googleCalendarSyncedAt";

-- Remove Google Calendar event ID from Booking table
ALTER TABLE "Booking" DROP COLUMN IF EXISTS "calEventId";
