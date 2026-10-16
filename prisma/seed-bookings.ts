import * as dotenv from "dotenv";
dotenv.config({ path: ".env.local" });
import { PrismaClient, BookingType, BookingStatus, CageSlotStatus, Lane, WaiverStatus } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter });

const members = [
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

function slotTime(daysFromNow: number, hour: number, minutes = 0) {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(hour, minutes, 0, 0);
  return d;
}

async function main() {
  console.log("Seeding sample bookings...");

  // Create cage slots (Lane A and B pairs for each time block)
  const slots = await Promise.all([
    // Past slot pair — 3 days ago, 2:00–2:30 PM
    prisma.cageSlot.create({
      data: {
        lane: Lane.A,
        date: slotDate(-3),
        startTime: slotTime(-3, 14),
        endTime: slotTime(-3, 14, 30),
        status: CageSlotStatus.BOOKED,
      },
    }),
    prisma.cageSlot.create({
      data: {
        lane: Lane.B,
        date: slotDate(-3),
        startTime: slotTime(-3, 14),
        endTime: slotTime(-3, 14, 30),
        status: CageSlotStatus.BOOKED,
      },
    }),
    // Past slot pair — yesterday, 6:00–6:30 PM
    prisma.cageSlot.create({
      data: {
        lane: Lane.A,
        date: slotDate(-1),
        startTime: slotTime(-1, 18),
        endTime: slotTime(-1, 18, 30),
        status: CageSlotStatus.BOOKED,
      },
    }),
    prisma.cageSlot.create({
      data: {
        lane: Lane.B,
        date: slotDate(-1),
        startTime: slotTime(-1, 18),
        endTime: slotTime(-1, 18, 30),
        status: CageSlotStatus.BOOKED,
      },
    }),
    // Future slot pair — 2 days out, 3:00–3:30 PM
    prisma.cageSlot.create({
      data: {
        lane: Lane.A,
        date: slotDate(2),
        startTime: slotTime(2, 15),
        endTime: slotTime(2, 15, 30),
        status: CageSlotStatus.BOOKED,
      },
    }),
    prisma.cageSlot.create({
      data: {
        lane: Lane.B,
        date: slotDate(2),
        startTime: slotTime(2, 15),
        endTime: slotTime(2, 15, 30),
        status: CageSlotStatus.AVAILABLE,
      },
    }),
    // Future slot pair — 5 days out, 7:00–7:30 PM
    prisma.cageSlot.create({
      data: {
        lane: Lane.A,
        date: slotDate(5),
        startTime: slotTime(5, 19),
        endTime: slotTime(5, 19, 30),
        status: CageSlotStatus.AVAILABLE,
      },
    }),
    prisma.cageSlot.create({
      data: {
        lane: Lane.B,
        date: slotDate(5),
        startTime: slotTime(5, 19),
        endTime: slotTime(5, 19, 30),
        status: CageSlotStatus.AVAILABLE,
      },
    }),
  ]);

  // Upsert members
  const created = await Promise.all(
    members.map((m) =>
      prisma.member.upsert({
        where: { email: m.email },
        update: {},
        create: m,
      })
    )
  );

  // Create bookings across slots with varied statuses
  const bookingDefs: {
    member: (typeof created)[0];
    slotA: (typeof slots)[0];
    slotB?: (typeof slots)[0];
    type: BookingType;
    status: BookingStatus;
    total: number;
    waiver: WaiverStatus | null;
  }[] = [
    // Completed single-lane bookings on past slots
    { member: created[0], slotA: slots[0], type: BookingType.SINGLE_LANE, status: BookingStatus.COMPLETED, total: 3000, waiver: WaiverStatus.SIGNED },
    { member: created[1], slotA: slots[1], type: BookingType.SINGLE_LANE, status: BookingStatus.COMPLETED, total: 3000, waiver: WaiverStatus.SIGNED },
    // Completed both-lanes booking (team session)
    { member: created[2], slotA: slots[2], slotB: slots[3], type: BookingType.BOTH_LANES, status: BookingStatus.COMPLETED, total: 5000, waiver: WaiverStatus.SIGNED },
    // Confirmed future single-lane
    { member: created[3], slotA: slots[4], type: BookingType.SINGLE_LANE, status: BookingStatus.CONFIRMED, total: 3000, waiver: null },
    { member: created[4], slotA: slots[4], type: BookingType.SINGLE_LANE, status: BookingStatus.CONFIRMED, total: 3000, waiver: WaiverStatus.SIGNED },
    // Pending future booking
    { member: created[5], slotA: slots[6], type: BookingType.SINGLE_LANE, status: BookingStatus.PENDING, total: 3000, waiver: null },
    // Cancelled booking
    { member: created[6], slotA: slots[0], type: BookingType.SINGLE_LANE, status: BookingStatus.CANCELLED, total: 0, waiver: null },
    // Pending both-lanes
    { member: created[7], slotA: slots[6], slotB: slots[7], type: BookingType.BOTH_LANES, status: BookingStatus.PENDING, total: 5000, waiver: null },
  ];

  for (const def of bookingDefs) {
    const booking = await prisma.booking.create({
      data: {
        memberId: def.member.id,
        bookingType: def.type,
        slotIdA: def.slotA.id,
        slotIdB: def.slotB?.id ?? null,
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
          memberId: def.member.id,
          signerName: def.member.name,
          agreementTextSnapshot: "I agree to the terms and conditions of Rally's Indoor Training.",
          status: def.waiver,
          signedAt: def.waiver === WaiverStatus.SIGNED ? new Date() : null,
        },
      });
    }
  }

  console.log(`Created ${bookingDefs.length} sample bookings across ${slots.length} slots`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
