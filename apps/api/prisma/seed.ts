import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database with Routes & School relationships...');

  // ── Schools ──────────────────────────────────────────────────────────────
  const augusco = await prisma.school.upsert({
    where: { name: 'AUGUSCO' },
    update: {},
    create: { name: 'AUGUSCO' },
  });

  const temasco = await prisma.school.upsert({
    where: { name: 'TEMASCO' },
    update: {},
    create: { name: 'TEMASCO' },
  });
  console.log('✅ Seeded Schools');

  // ── Houses ───────────────────────────────────────────────────────────────
  await Promise.all([
    prisma.house.upsert({ where: { name_schoolId: { name: 'Alpha House', schoolId: augusco.id } }, update: {}, create: { name: 'Alpha House', schoolId: augusco.id } }),
    prisma.house.upsert({ where: { name_schoolId: { name: 'Beta House', schoolId: augusco.id } }, update: {}, create: { name: 'Beta House', schoolId: augusco.id } }),
    prisma.house.upsert({ where: { name_schoolId: { name: 'Red House', schoolId: temasco.id } }, update: {}, create: { name: 'Red House', schoolId: temasco.id } }),
    prisma.house.upsert({ where: { name_schoolId: { name: 'Blue House', schoolId: temasco.id } }, update: {}, create: { name: 'Blue House', schoolId: temasco.id } }),
  ]);
  console.log('✅ Seeded Houses');

  // ── Programmes ───────────────────────────────────────────────────────────
  await Promise.all([
    prisma.programme.upsert({ where: { name_schoolId: { name: 'Science', schoolId: augusco.id } }, update: {}, create: { name: 'Science', schoolId: augusco.id } }),
    prisma.programme.upsert({ where: { name_schoolId: { name: 'Business', schoolId: augusco.id } }, update: {}, create: { name: 'Business', schoolId: augusco.id } }),
    prisma.programme.upsert({ where: { name_schoolId: { name: 'General Arts', schoolId: temasco.id } }, update: {}, create: { name: 'General Arts', schoolId: temasco.id } }),
    prisma.programme.upsert({ where: { name_schoolId: { name: 'Visual Arts', schoolId: temasco.id } }, update: {}, create: { name: 'Visual Arts', schoolId: temasco.id } }),
  ]);
  console.log('✅ Seeded Programmes');

  // ── Routes for AUGUSCO ───────────────────────────────────────────────────
  const augRoute1 = await prisma.route.upsert({
    where: { name_schoolId: { name: 'Accra Central ↔ AUGUSCO', schoolId: augusco.id } },
    update: { priceToSchool: 300, priceFromSchool: 280 },
    create: { name: 'Accra Central ↔ AUGUSCO', schoolId: augusco.id, priceToSchool: 300, priceFromSchool: 280 },
  });

  const augRoute2 = await prisma.route.upsert({
    where: { name_schoolId: { name: 'Tema ↔ AUGUSCO', schoolId: augusco.id } },
    update: { priceToSchool: 260, priceFromSchool: 240 },
    create: { name: 'Tema ↔ AUGUSCO', schoolId: augusco.id, priceToSchool: 260, priceFromSchool: 240 },
  });

  const augRoute3 = await prisma.route.upsert({
    where: { name_schoolId: { name: 'Kumasi ↔ AUGUSCO', schoolId: augusco.id } },
    update: { priceToSchool: 360, priceFromSchool: 320 },
    create: { name: 'Kumasi ↔ AUGUSCO', schoolId: augusco.id, priceToSchool: 360, priceFromSchool: 320 },
  });

  // ── Stops for AUGUSCO Routes ─────────────────────────────────────────────
  await Promise.all([
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Accra Mall', routeId: augRoute1.id } }, update: {}, create: { name: 'Accra Mall', routeId: augRoute1.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Kwame Nkrumah Interchange', routeId: augRoute1.id } }, update: {}, create: { name: 'Kwame Nkrumah Interchange', routeId: augRoute1.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Circle', routeId: augRoute1.id } }, update: {}, create: { name: 'Circle', routeId: augRoute1.id } }),

    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Tema Station', routeId: augRoute2.id } }, update: {}, create: { name: 'Tema Station', routeId: augRoute2.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Community 1', routeId: augRoute2.id } }, update: {}, create: { name: 'Community 1', routeId: augRoute2.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Community 18', routeId: augRoute2.id } }, update: {}, create: { name: 'Community 18', routeId: augRoute2.id } }),

    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Kejetia', routeId: augRoute3.id } }, update: {}, create: { name: 'Kejetia', routeId: augRoute3.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Atonsu', routeId: augRoute3.id } }, update: {}, create: { name: 'Atonsu', routeId: augRoute3.id } }),
  ]);

  // ── Routes for TEMASCO ───────────────────────────────────────────────────
  const temRoute1 = await prisma.route.upsert({
    where: { name_schoolId: { name: 'Accra Central ↔ TEMASCO', schoolId: temasco.id } },
    update: { priceToSchool: 240, priceFromSchool: 220 },
    create: { name: 'Accra Central ↔ TEMASCO', schoolId: temasco.id, priceToSchool: 240, priceFromSchool: 220 },
  });

  const temRoute2 = await prisma.route.upsert({
    where: { name_schoolId: { name: 'Tema ↔ TEMASCO', schoolId: temasco.id } },
    update: { priceToSchool: 180, priceFromSchool: 160 },
    create: { name: 'Tema ↔ TEMASCO', schoolId: temasco.id, priceToSchool: 180, priceFromSchool: 160 },
  });

  const temRoute3 = await prisma.route.upsert({
    where: { name_schoolId: { name: 'Kumasi ↔ TEMASCO', schoolId: temasco.id } },
    update: { priceToSchool: 390, priceFromSchool: 350 },
    create: { name: 'Kumasi ↔ TEMASCO', schoolId: temasco.id, priceToSchool: 390, priceFromSchool: 350 },
  });

  // ── Stops for TEMASCO Routes ─────────────────────────────────────────────
  await Promise.all([
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Accra Mall', routeId: temRoute1.id } }, update: {}, create: { name: 'Accra Mall', routeId: temRoute1.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Kaneshie', routeId: temRoute1.id } }, update: {}, create: { name: 'Kaneshie', routeId: temRoute1.id } }),

    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Tema Station', routeId: temRoute2.id } }, update: {}, create: { name: 'Tema Station', routeId: temRoute2.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Lashibi', routeId: temRoute2.id } }, update: {}, create: { name: 'Lashibi', routeId: temRoute2.id } }),

    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Kejetia', routeId: temRoute3.id } }, update: {}, create: { name: 'Kejetia', routeId: temRoute3.id } }),
    prisma.routeStop.upsert({ where: { name_routeId: { name: 'Suame', routeId: temRoute3.id } }, update: {}, create: { name: 'Suame', routeId: temRoute3.id } }),
  ]);
  console.log('✅ Seeded Routes & Stops');

  console.log('🎉 Seeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
