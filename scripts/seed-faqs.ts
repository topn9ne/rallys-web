import { config } from "dotenv";
import { resolve } from "path";
config({ path: resolve(process.cwd(), ".env.local") });

import { PrismaClient } from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({
  connectionString: process.env.DATABASE_URL!,
  ssl: { rejectUnauthorized: false },
});
const prisma = new PrismaClient({ adapter } as never);

const FAQS = [
  {
    question: "What is Railside Rides?",
    answer: "It's a giant party bike powered by you and your friends! Our fun drivers will be your tour guide on a 2-hour cruise through downtown Grand Island. You also get to bring your own drinks and enjoy the ride while we handle the route!",
  },
  {
    question: "What are the rates?",
    answer: "For a 2-hour private ride: Sunday–Thursday $349, Friday–Saturday $399. The price is the same whether you have 8–14 riders. Full payment is required to make a reservation — no partial deposits. You can get a full refund if you cancel at least 7 days in advance.",
  },
  {
    question: "What is a private group ride?",
    answer: "Our most popular option! A private group ride means you rent the bike just for your group. You need a minimum of 8 riders to effectively pedal the bike. Max of 14 riders.",
  },
  {
    question: "What if we have more than 14 riders?",
    answer: "If your group is larger than 14, reach out to us — we can help you coordinate back-to-back ride times so your whole crew gets on the rails. A lot of larger groups have done this and it works out great!",
  },
  {
    question: "What's the riding situation like?",
    answer: "Up to 10 people can pedal, and the rest get to ride in comfort. If you have extras, they can play bartender in the middle and keep the energy going!",
  },
  {
    question: "Do we have to drive it?",
    answer: "Nope — we have a sober, safe, and fun driver to guide this party machine for you!",
  },
  {
    question: "Is alcohol allowed on the bike?",
    answer: "Yes! You can bring your own beer or malt beverages. Only aluminum cans or plastic bottles allowed — no glass or hard liquor on the bike. Must be 21+ to ride.",
  },
  {
    question: "Where does it launch from?",
    answer: "All rides launch from 218 Depot Street in downtown Grand Island.",
  },
  {
    question: "Do you have a music system?",
    answer: "Yes! Music is one of the best parts of the ride. Bring your phone and connect via Bluetooth to our stereo system. Your playlist, your vibe.",
  },
  {
    question: "What if the weather is bad?",
    answer: "Unless there's a thunderstorm or serious weather, we ride! It's actually really fun in light rain — there's a roof so you'll stay pretty dry. If severe weather forces a cancellation, we'll work with you to reschedule at no charge.",
  },
  {
    question: "What is the cancellation policy?",
    answer: "Cancel more than 7 days out and you'll receive a full refund minus the booking fee. Cancel within 7 days and we'll issue a rain check to use later in the season. Cancellations within 48 hours of your ride are not eligible for a refund or transfer.",
  },
  {
    question: "How old do you have to be to ride?",
    answer: "You must be 21+ to ride.",
  },
  {
    question: "What payments do you accept?",
    answer: "We accept all major credit cards. Payment is due in full at the time of reservation. We can split across multiple cards — just email us ahead of time.",
  },
  {
    question: "How do I book?",
    answer: "Hit the BOOK NOW button to view available times and dates. You can also call or text 402-519-5225, or email us at hello@railsiderides.com. First come, first served!",
  },
  {
    question: "Is this thing dangerous?",
    answer: "With any outdoor activity on wheels there's some inherent risk, but safety records show very few accidents on pedal bars across the U.S. We have everyone sign a release waiver before the ride — you can sign in advance to save time on the day of your ride.",
  },
];

async function main() {
  console.log("Seeding FAQs...");

  // Clear existing FAQs first
  await prisma.faqItem.deleteMany({});

  for (let i = 0; i < FAQS.length; i++) {
    await prisma.faqItem.create({
      data: {
        question: FAQS[i].question,
        answer: FAQS[i].answer,
        sortOrder: i,
        active: true,
      },
    });
  }

  console.log(`✓ Seeded ${FAQS.length} FAQ items.`);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
