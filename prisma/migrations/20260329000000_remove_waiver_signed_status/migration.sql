-- Migrate all WAIVER_SIGNED bookings to CONFIRMED
UPDATE "bookings" SET "status" = 'CONFIRMED' WHERE "status" = 'WAIVER_SIGNED';

-- Drop default before type swap (Postgres requires this)
ALTER TABLE "bookings" ALTER COLUMN "status" DROP DEFAULT;

-- Recreate the enum without WAIVER_SIGNED
ALTER TYPE "BookingStatus" RENAME TO "BookingStatus_old";
CREATE TYPE "BookingStatus" AS ENUM ('PENDING', 'CONFIRMED', 'COMPLETED', 'CANCELLED', 'REFUNDED');
ALTER TABLE "bookings" ALTER COLUMN "status" TYPE "BookingStatus" USING "status"::text::"BookingStatus";
DROP TYPE "BookingStatus_old";

-- Restore default
ALTER TABLE "bookings" ALTER COLUMN "status" SET DEFAULT 'PENDING';
