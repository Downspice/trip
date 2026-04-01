import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  await prisma.$executeRawUnsafe(`UPDATE "Booking" SET "tripType" = 'ONE_WAY_TO_SCHOOL' WHERE "tripType" = 'ROUND_TRIP'`);
  console.log("Updated bookings.");
}

main().catch(console.error).finally(() => prisma.$disconnect());
