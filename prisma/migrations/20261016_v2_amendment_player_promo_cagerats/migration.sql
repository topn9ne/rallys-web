-- v2 Amendment: Player model, Promo codes, Cage Rats tracking, tier rename

-- ─── Enum Changes ─────────────────────────────────────────────────────────────

-- Rename MemberTier MEMBER → FAMILY
ALTER TYPE "MemberTier" RENAME VALUE 'MEMBER' TO 'FAMILY';

-- Add new PricingTier values
ALTER TYPE "PricingTier" RENAME VALUE 'MEMBER' TO 'FAMILY';
ALTER TYPE "PricingTier" ADD VALUE IF NOT EXISTS 'FAMILY_ANNUAL';
ALTER TYPE "PricingTier" ADD VALUE IF NOT EXISTS 'TEAM_ANNUAL';

-- New enum for promo code discount type
CREATE TYPE "DiscountType" AS ENUM ('PERCENT', 'FIXED');

-- ─── New Tables ───────────────────────────────────────────────────────────────

-- Player (kid profiles linked to member accounts)
CREATE TABLE "players" (
    "id" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "dateOfBirth" DATE,
    "positions" TEXT,
    "school" TEXT,
    "travelTeam" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "players_pkey" PRIMARY KEY ("id")
);

-- BookingPlayer (join table: which players were in a booking)
CREATE TABLE "booking_players" (
    "bookingId" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,

    CONSTRAINT "booking_players_pkey" PRIMARY KEY ("bookingId","playerId")
);

-- PromoCode (team drop-in promo codes)
CREATE TABLE "promo_codes" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "description" TEXT,
    "discountType" "DiscountType" NOT NULL,
    "discountAmount" INTEGER NOT NULL,
    "maxUses" INTEGER,
    "currentUses" INTEGER NOT NULL DEFAULT 0,
    "validFrom" TIMESTAMP(3),
    "validUntil" TIMESTAMP(3),
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "promo_codes_pkey" PRIMARY KEY ("id")
);

-- PlayerHours (running totals per player for Cage Rats)
CREATE TABLE "player_hours" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "totalMinutes" INTEGER NOT NULL DEFAULT 0,
    "lastSessionAt" TIMESTAMP(3),
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_hours_pkey" PRIMARY KEY ("id")
);

-- PlayerSummerStats (one row per player per summer)
CREATE TABLE "player_summer_stats" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "summerMinutes" INTEGER NOT NULL DEFAULT 0,
    "qualified" BOOLEAN NOT NULL DEFAULT false,
    "shirtAwarded" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "player_summer_stats_pkey" PRIMARY KEY ("id")
);

-- PlayerMilestones (append-only milestone log)
CREATE TABLE "player_milestones" (
    "id" TEXT NOT NULL,
    "playerId" TEXT NOT NULL,
    "milestoneKey" TEXT NOT NULL,
    "achievedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "player_milestones_pkey" PRIMARY KEY ("id")
);

-- ─── Booking table additions ──────────────────────────────────────────────────

ALTER TABLE "bookings" ADD COLUMN "discountAmountCents" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "bookings" ADD COLUMN "promoCodeId" TEXT;

-- ─── Unique constraints ───────────────────────────────────────────────────────

CREATE UNIQUE INDEX "promo_codes_code_key" ON "promo_codes"("code");
CREATE UNIQUE INDEX "player_hours_playerId_key" ON "player_hours"("playerId");
CREATE UNIQUE INDEX "player_summer_stats_playerId_year_key" ON "player_summer_stats"("playerId", "year");
CREATE UNIQUE INDEX "player_milestones_playerId_milestoneKey_key" ON "player_milestones"("playerId", "milestoneKey");

-- ─── Foreign keys ─────────────────────────────────────────────────────────────

ALTER TABLE "players" ADD CONSTRAINT "players_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "members"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking_players" ADD CONSTRAINT "booking_players_bookingId_fkey" FOREIGN KEY ("bookingId") REFERENCES "bookings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "booking_players" ADD CONSTRAINT "booking_players_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_promoCodeId_fkey" FOREIGN KEY ("promoCodeId") REFERENCES "promo_codes"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "player_hours" ADD CONSTRAINT "player_hours_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "player_summer_stats" ADD CONSTRAINT "player_summer_stats_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
ALTER TABLE "player_milestones" ADD CONSTRAINT "player_milestones_playerId_fkey" FOREIGN KEY ("playerId") REFERENCES "players"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
