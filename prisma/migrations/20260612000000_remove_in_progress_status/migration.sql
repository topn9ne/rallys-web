-- Move any IN_PROGRESS slots to COMPLETED
UPDATE "ride_slots" SET "status" = 'COMPLETED' WHERE "status" = 'IN_PROGRESS';

-- Remove the enum value
ALTER TYPE "SlotStatus" RENAME TO "SlotStatus_old";
CREATE TYPE "SlotStatus" AS ENUM ('AVAILABLE', 'FILLING', 'FULL', 'COMPLETED', 'CANCELLED', 'BLOCKED');
ALTER TABLE "ride_slots" ALTER COLUMN "status" DROP DEFAULT;
ALTER TABLE "ride_slots" ALTER COLUMN "status" TYPE "SlotStatus" USING ("status"::text::"SlotStatus");
ALTER TABLE "ride_slots" ALTER COLUMN "status" SET DEFAULT 'AVAILABLE';
DROP TYPE "SlotStatus_old";
