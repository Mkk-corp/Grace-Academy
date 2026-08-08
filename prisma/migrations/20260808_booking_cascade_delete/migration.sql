-- Drop existing FK constraints (no-op if they don't exist with this name)
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_studentId_fkey";
ALTER TABLE "Booking" DROP CONSTRAINT IF EXISTS "Booking_assessorId_fkey";

-- Re-add with ON DELETE CASCADE so deleting a User removes all their Bookings
ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_studentId_fkey"
  FOREIGN KEY ("studentId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Booking"
  ADD CONSTRAINT "Booking_assessorId_fkey"
  FOREIGN KEY ("assessorId") REFERENCES "User"("id")
  ON DELETE CASCADE ON UPDATE CASCADE;
