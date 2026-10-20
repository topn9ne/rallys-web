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
        "RALLY'S INDOOR TRAINING — PARTICIPANT WAIVER AND RELEASE OF LIABILITY",
        "",
        "ASSUMPTION OF RISK. By signing this waiver, I acknowledge that using batting cage and training facilities at Rally's Indoor Training involves inherent risks including but not limited to: being struck by pitched or batted baseballs or softballs, injury from swinging bats, bat vibration, muscle or joint strain, slips and falls, equipment malfunction, and contact with netting, structures, or other participants. I voluntarily assume all such risks and full responsibility for any injury, loss, or damage that may result from my participation.",
        "",
        "RELEASE OF LIABILITY. I hereby release, waive, discharge, and covenant not to sue Rally's Indoor Training LLC, its owners, members, operators, agents, and their respective heirs, successors, and assigns from any and all claims, demands, damages, or causes of action arising from my use of the facility, including claims of negligence.",
        "",
        "INDEMNIFICATION. I agree to indemnify and hold harmless Rally's Indoor Training LLC from any claims, damages, attorney's fees, judgments, or costs arising from my use of the facility, the use by any minors listed below, or any breach of this waiver.",
        "",
        "FACILITY RULES AND SAFETY EQUIPMENT. I confirm that I will follow all posted safety rules and use provided safety equipment, including a batting helmet, at all times while in the cage area. I understand that failure to follow posted rules may result in revocation of facility access.",
        "",
        "SELF-SERVICE FACILITY. I understand that the facility is self-service and may be unstaffed during my session. I accept full responsibility for my safety and the safety of any minors under my supervision. I acknowledge that the facility is monitored by security cameras for safety purposes and consent to being recorded while on the premises.",
        "",
        "MEDICAL ACKNOWLEDGMENT. I represent that I (and any minors listed below) am physically capable of participating in batting cage activities and have no medical conditions that would make participation unsafe. I authorize emergency medical treatment in the event I am unable to provide consent, and I accept financial responsibility for any medical costs incurred.",
        "",
        "MINORS. For participants under 18 years of age: A parent or legal guardian must sign this waiver on behalf of the minor participant. The signing adult assumes all responsibility for the minor's safety, conduct, and compliance with facility rules. A coach's signature does not satisfy this requirement.",
        "",
        "GOVERNING LAW. This waiver shall be governed by and construed in accordance with the laws of the State of Nebraska.",
        "",
        "This waiver is binding upon me, my heirs, executors, administrators, and assigns. I have read and understand this waiver in its entirety and sign it voluntarily.",
        "",
        "Rally's Indoor Training LLC",
        "203 S Woodland Ave, Bay 5",
        "Hastings, NE 68901",
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
