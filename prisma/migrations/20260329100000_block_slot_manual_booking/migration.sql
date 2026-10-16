-- Add BLOCKED to SlotStatus enum
ALTER TABLE "ride_slots" ALTER COLUMN "status" DROP DEFAULT;
ALTER TYPE "SlotStatus" RENAME TO "SlotStatus_old";
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'FILLING', 'FULL', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'BLOCKED');
ALTER TABLE "ride_slots" ALTER COLUMN "status" TYPE "SlotStatus" USING "status"::text::"SlotStatus";
DROP TYPE "SlotStatus_old";
ALTER TABLE "ride_slots" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';

-- Add block fields to ride_slots
ALTER TABLE "ride_slots" ADD COLUMN "blockReason" TEXT;
ALTER TABLE "ride_slots" ADD COLUMN "blockedAt" TIMESTAMP(3);

-- Add manual booking fields to bookings
ALTER TABLE "bookings" ADD COLUMN "isManual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "bookings" ADD COLUMN "paymentReference" TEXT;
ALTER TABLE "bookings" ADD COLUMN "waiverSignedOffline" BOOLEAN NOT NULL DEFAULT false;
