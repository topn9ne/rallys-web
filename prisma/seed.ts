import { PrismaClient, PricingTier } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Rally's Indoor Training...");

  // Operating hours: 6 AM – 10 PM, 7 days a week
  for (let day = 0; day <= 6; day++) {
    await prisma.operatingHours.upsert({
      where: { id: `hours-${day}` },
      update: {},
      create: {
        id: `hours-${day}`,
        dayOfWeek: day,
        openTime: "06:00",
        closeTime: "22:00",
        isOpen: true,
      },
    });
  }
  console.log("Operating hours: 6 AM – 10 PM daily");

  // Pricing configs (append-only — seed initial prices)
  const pricingData = [
    { tier: PricingTier.FAMILY, amountCents: 5000, label: "Family $50/mo" },
    { tier: PricingTier.FAMILY_ANNUAL, amountCents: 50000, label: "Family annual $500/yr" },
    { tier: PricingTier.TEAM, amountCents: 7500, label: "Team $75/mo" },
    { tier: PricingTier.TEAM_ANNUAL, amountCents: 75000, label: "Team annual $750/yr" },
    { tier: PricingTier.DROPIN_SINGLE, amountCents: 2500, label: "Drop-in individual $25" },
    { tier: PricingTier.DROPIN_BOTH, amountCents: 5000, label: "Drop-in team $50" },
  ];

  for (const p of pricingData) {
    const existing = await prisma.pricingConfig.findFirst({
      where: { tier: p.tier },
    });
    if (!existing) {
      await prisma.pricingConfig.create({
        data: {
          tier: p.tier,
          amountCents: p.amountCents,
          taxRatePercent: 7.0,
          effectiveFrom: new Date(),
        },
      });
      console.log(`  ${p.label}`);
    }
  }

  // Waiver template
  await prisma.waiverTemplate.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      body: [
        "RALLY'S INDOOR TRAINING — WAIVER AND RELEASE OF LIABILITY",
        "",
        "I, the undersigned, acknowledge that participation in batting cage activities at Rally's Indoor Training involves inherent risks including but not limited to injury from pitched balls, bat contact, slipping, and equipment malfunction.",
        "",
        "I voluntarily assume all risks associated with my participation and hereby release Rally's Indoor Training LLC, its owners, operators, and affiliates from any and all liability for injury, damage, or loss arising from my use of the facility.",
        "",
        "I confirm that I am physically able to participate in batting cage activities and will follow all posted rules and safety guidelines.",
        "",
        "For participants under 18: I am the parent or legal guardian of the minor named below and I give my consent for their participation. I accept full responsibility for their safety and agree to this waiver on their behalf.",
        "",
        "By signing below, I acknowledge that I have read and understand this waiver and agree to its terms.",
      ].join("\n"),
    },
  });
  console.log("Waiver template seeded");

  // Site settings
  const settings = [
    { key: "facility_name", value: "Rally's Indoor Training" },
    { key: "facility_address", value: "203 S Woodland Ave, Bay 5, Hastings, NE 68901" },
    { key: "facility_phone", value: "" },
    { key: "timezone", value: "America/Chicago" },
    { key: "booking_advance_days", value: "30" },
    { key: "cancellation_deadline_hours", value: "2" },
    { key: "max_active_bookings", value: "1" },
    { key: "cage_rats_threshold_minutes", value: "600" },
    { key: "cage_rats_summer_start", value: "2027-05-26" },
    { key: "cage_rats_summer_end", value: "2027-09-01" },
  ];

  for (const s of settings) {
    await prisma.siteSetting.upsert({
      where: { key: s.key },
      update: {},
      create: { key: s.key, value: s.value },
    });
  }
  console.log("Site settings seeded");

  console.log("\nSeed complete. Admin account must be created via Supabase Auth.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
