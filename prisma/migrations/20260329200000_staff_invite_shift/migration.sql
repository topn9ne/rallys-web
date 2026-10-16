-- Make passwordHash nullable (staff set their own via invite)
ALTER TABLE "staff" ALTER COLUMN "passwordHash" DROP NOT NULL;

-- StaffTokenType enum
CREATE TYPE "StaffTokenType" AS ENUM ('INVITE', 'RESET');

-- Staff tokens table (invite + password reset)
CREATE TABLE "staff_tokens" (
  "id"        TEXT         NOT NULL,
  "staffId"   TEXT         NOT NULL,
  "token"     TEXT         NOT NULL,
  "type"      "StaffTokenType" NOT NULL,
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "usedAt"    TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "staff_tokens_pkey"      PRIMARY KEY ("id"),
  CONSTRAINT "staff_tokens_token_key" UNIQUE ("token"),
  CONSTRAINT "staff_tokens_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE
);

-- Shift interests table
CREATE TABLE "shift_interests" (
  "id"        TEXT         NOT NULL,
  "staffId"   TEXT         NOT NULL,
  "slotId"    TEXT         NOT NULL,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "shift_interests_pkey"                PRIMARY KEY ("id"),
  CONSTRAINT "shift_interests_staffId_slotId_key"  UNIQUE ("staffId", "slotId"),
  CONSTRAINT "shift_interests_staffId_fkey" FOREIGN KEY ("staffId") REFERENCES "staff"("id") ON DELETE CASCADE,
  CONSTRAINT "shift_interests_slotId_fkey"  FOREIGN KEY ("slotId")  REFERENCES "ride_slots"("id") ON DELETE CASCADE
);
