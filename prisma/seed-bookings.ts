import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient, RideType, SlotStatus, BookingType, BookingStatus, WaiverStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const customers = [
  { name: "Sarah Mitchell", email: "sarah.mitchell@example.com", phone: "308-555-0101" },
  { name: "James Kowalski", email: "james.kowalski@example.com", phone: "308-555-0102" },
  { name: "Priya Nair", email: "priya.nair@example.com", phone: "308-555-0103" },
  { name: "Derek Olsen", email: "derek.olsen@example.com", phone: "308-555-0104" },
  { name: "Courtney Banks", email: "courtney.banks@example.com", phone: "308-555-0105" },
  { name: "Marcus Tran", email: "marcus.tran@example.com", phone: "308-555-0106" },
  { name: "Allison Reed", email: "allison.reed@example.com", phone: "308-555-0107" },
  { name: "Tom Garza", email: "tom.garza@example.com", phone: "308-555-0108" },
];

function slotDate(daysFromNow: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(0, 0, 0, 0);
  return d;
}

function slotTime(daysFromNow: number, hour: number) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, 0, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding sample bookings...");

  // Ensure bikes exist
  const bike = await prisma.bike.upsert({
    where: { id: "bike-railside-flyer" },
    update: {},
    create: { id: "bike-railside-flyer", name: "Railside Flyer", passengerCap: 14 },
  });

  // Create a theme
  const theme = await prisma.theme.upsert({
    where: { id: "theme-oktoberfest" },
    update: {},
    create: { id: "theme-oktoberfest", name: "Oktoberfest" },
  });

  // Create ride slots
  const slots = await Promise.all([
    prisma.rideSlot.create({
      data: {
        bikeId: bike.id,
        rideType: RideType.THEME,
        themeId: theme.id,
        date: slotDate(-3),
        startTime: slotTime(-3, 14),
        endTime: slotTime(-3, 16),
        bufferEndTime: slotTime(-3, 16),
        seatsTotal: 14,
        seatsBooked: 6,
        status: SlotStatus.COMPLETED,
      },
    }),
    prisma.rideSlot.create({
      data: {
        bikeId: bike.id,
        rideType: RideType.GENERAL,
        date: slotDate(-1),
        startTime: slotTime(-1, 18),
        endTime: slotTime(-1, 20),
        bufferEndTime: slotTime(-1, 20),
        seatsTotal: 14,
        seatsBooked: 14,
        status: SlotStatus.COMPLETED,
      },
    }),
    prisma.rideSlot.create({
      data: {
        bikeId: bike.id,
        rideType: RideType.THEME,
        themeId: theme.id,
        date: slotDate(2),
        startTime: slotTime(2, 15),
        endTime: slotTime(2, 17),
        bufferEndTime: slotTime(2, 17),
        seatsTotal: 14,
        seatsBooked: 4,
        status: SlotStatus.FILLING,
      },
    }),
    prisma.rideSlot.create({
      data: {
        bikeId: bike.id,
        rideType: RideType.GENERAL,
        date: slotDate(5),
        startTime: slotTime(5, 19),
        endTime: slotTime(5, 21),
        bufferEndTime: slotTime(5, 21),
        seatsTotal: 14,
        seatsBooked: 0,
        status: SlotStatus.AVAILABLE,
      },
    }),
  ]);

  // Upsert customers
  const created = await Promise.all(
    customers.map((c) =>
      prisma.customer.upsert({
        where: { email: c.email },
        update: {},
        create: c,
      })
    )
  );

  // Create bookings across slots with varied statuses
  const bookingDefs = [
    { customer: created[0], slot: slots[0], type: BookingType.THEME_SEAT, seats: 2, status: BookingStatus.COMPLETED, total: 6000, waiver: WaiverStatus.SIGNED },
    { customer: created[1], slot: slots[0], type: BookingType.THEME_SEAT, seats: 4, status: BookingStatus.COMPLETED, total: 12000, waiver: WaiverStatus.SIGNED },
    { customer: created[2], slot: slots[1], type: BookingType.GENERAL_FULL, seats: 1, status: BookingStatus.COMPLETED, total: 40000, waiver: WaiverStatus.SIGNED },
    { customer: created[3], slot: slots[2], type: BookingType.THEME_SEAT, seats: 2, status: BookingStatus.CONFIRMED, total: 6000, waiver: null },
    { customer: created[4], slot: slots[2], type: BookingType.THEME_SEAT, seats: 2, status: BookingStatus.CONFIRMED, total: 6000, waiver: WaiverStatus.SIGNED },
    { customer: created[5], slot: slots[3], type: BookingType.GENERAL_FULL, seats: 1, status: BookingStatus.PENDING, total: 40000, waiver: null },
    { customer: created[6], slot: slots[0], type: BookingType.THEME_SEAT, seats: 2, status: BookingStatus.CANCELLED, total: 0, waiver: null },
    { customer: created[7], slot: slots[2], type: BookingType.THEME_SEAT, seats: 2, status: BookingStatus.PENDING, total: 6000, waiver: null },
  ];

  for (const def of bookingDefs) {
    const booking = await prisma.booking.create({
      data: {
        customerId: def.customer.id,
        slotId: def.slot.id,
        bookingType: def.type,
        seats: def.seats,
        pickupLocation: "Railside Depot",
        status: def.status,
        totalAmountCents: def.total,
        baseAmountCents: def.total,
        taxAmountCents: 0,
      },
    });

    if (def.waiver) {
      await prisma.waiver.create({
        data: {
          bookingId: booking.id,
          signerName: def.customer.name,
          agreementTextSnapshot: "I agree to the terms and conditions of Railside Rides.",
          status: def.waiver,
          signedAt: def.waiver === WaiverStatus.SIGNED ? new Date() : null,
        },
      });
    }
  }

  console.log(`✓ Created ${bookingDefs.length} sample bookings across ${slots.length} slots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
