import { PrismaClient, RideType, BikeStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import bcrypt from "bcryptjs";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

async function main() {
  console.log("Seeding database...");

  // Seed bikes
  const bike1 = await prisma.bike.upsert({
    where: { id: "bike-railside-flyer" },
    update: {},
    create: {
      id: "bike-railside-flyer",
      name: "Railside Flyer",
      status: BikeStatus.ACTIVE,
      passengerCap: 14,
    },
  });

  const bike2 = await prisma.bike.upsert({
    where: { id: "bike-grand-express" },
    update: {},
    create: {
      id: "bike-grand-express",
      name: "Grand Express",
      status: BikeStatus.ACTIVE,
      passengerCap: 14,
    },
  });

  console.log(`Bikes: ${bike1.name}, ${bike2.name}`);

  // Seed pricing configs
  const themePricing = await prisma.pricingConfig.create({
    data: {
      rideType: RideType.THEME,
      baseAmountCents: 3000, // $30/seat
      taxRatePercent: 0,
      effectiveFrom: new Date(),
    },
  });

  const generalPricing = await prisma.pricingConfig.create({
    data: {
      rideType: RideType.GENERAL,
      baseAmountCents: 40000, // $400/booking
      taxRatePercent: 0,
      effectiveFrom: new Date(),
    },
  });

  console.log(
    `Pricing: Theme $${themePricing.baseAmountCents / 100}/seat, General $${generalPricing.baseAmountCents / 100}/booking`
  );

  // Seed pickup locations
  await prisma.pickupLocation.createMany({
    skipDuplicates: true,
    data: [
      { id: "loc-depot", name: "Railside Depot", address: "123 Rail Ave, Grand Island, NE 68801" },
      { id: "loc-downtown", name: "Downtown Square", address: "200 W 3rd St, Grand Island, NE 68801" },
    ],
  });

  console.log("Pickup locations seeded");

  // Seed admin staff account
  const passwordHash = await bcrypt.hash("admin123!", 12);
  await prisma.staff.upsert({
    where: { email: "admin@railsiderides.com" },
    update: { passwordHash },
    create: {
      email: "admin@railsiderides.com",
      name: "Admin",
      passwordHash,
      role: "ADMIN",
      active: true,
    },
  });

  console.log("Admin account: admin@railsiderides.com / admin123!");
  console.log("✓ Seed complete");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
