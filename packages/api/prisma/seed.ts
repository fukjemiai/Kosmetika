import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  // Create salons
  const salon1 = await prisma.salon.create({
    data: {
      name: 'Beauty Studio Praha',
      address: 'Vinohradska 42',
      city: 'Praha',
      zip: '12000',
      phone: '+420 777 111 222',
      email: 'info@beautystudio.cz',
      description: 'Moderni kosmeticky salon v centru Prahy',
      openingHours: {
        monday: { open: '09:00', close: '18:00' },
        tuesday: { open: '09:00', close: '18:00' },
        wednesday: { open: '09:00', close: '18:00' },
        thursday: { open: '09:00', close: '20:00' },
        friday: { open: '09:00', close: '18:00' },
        saturday: { open: '10:00', close: '14:00' },
      },
    },
  });

  const salon2 = await prisma.salon.create({
    data: {
      name: 'Glamour Nails Brno',
      address: 'Masarykova 15',
      city: 'Brno',
      zip: '60200',
      phone: '+420 777 333 444',
      email: 'info@glamournails.cz',
      description: 'Specializovany salon na nehty a rasy',
      openingHours: {
        monday: { open: '08:00', close: '17:00' },
        tuesday: { open: '08:00', close: '17:00' },
        wednesday: { open: '08:00', close: '17:00' },
        thursday: { open: '08:00', close: '17:00' },
        friday: { open: '08:00', close: '16:00' },
      },
    },
  });

  // Create beauticians
  const beautician1 = await prisma.beautician.create({
    data: {
      keycloakId: 'demo-beautician-1',
      firstName: 'Jana',
      lastName: 'Novakova',
      email: 'jana@beautystudio.cz',
      phone: '+420 777 555 666',
      bio: 'Kosmeticka s 10letou praxi',
    },
  });

  const beautician2 = await prisma.beautician.create({
    data: {
      keycloakId: 'demo-beautician-2',
      firstName: 'Petra',
      lastName: 'Svobodova',
      email: 'petra@beautystudio.cz',
      phone: '+420 777 777 888',
      bio: 'Specialistka na nehty a rasy',
      parentBeauticianId: beautician1.id,
    },
  });

  // Assign to salons
  await prisma.beauticianSalon.createMany({
    data: [
      { beauticianId: beautician1.id, salonId: salon1.id, role: 'owner' },
      { beauticianId: beautician1.id, salonId: salon2.id, role: 'owner' },
      { beauticianId: beautician2.id, salonId: salon1.id, role: 'employee' },
    ],
  });

  // Working hours
  for (let day = 0; day < 5; day++) {
    await prisma.workingHours.createMany({
      data: [
        {
          beauticianId: beautician1.id,
          salonId: salon1.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
        },
        {
          beauticianId: beautician2.id,
          salonId: salon1.id,
          dayOfWeek: day,
          startTime: '09:00',
          endTime: '17:00',
        },
      ],
    });
  }

  // Services
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: 'Ciseni pleti',
        description: 'Hloubkove ciseni pleti s diagnostikou',
        category: 'face',
        durationMinutes: 60,
        price: 120000, // 1200 CZK
        salonId: salon1.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Gelove nehty',
        description: 'Kompletni gelova modelaz nehtu',
        category: 'nails',
        durationMinutes: 90,
        price: 80000, // 800 CZK
        salonId: salon1.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Prodlouzeni ras',
        description: 'Klasicke prodlouzeni ras 1:1',
        category: 'lashes',
        durationMinutes: 120,
        price: 150000, // 1500 CZK
        salonId: salon1.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Relaxacni masaz',
        description: 'Celoterni relaxacni masaz 60 min',
        category: 'massage',
        durationMinutes: 60,
        price: 100000, // 1000 CZK
        salonId: salon1.id,
      },
    }),
    prisma.service.create({
      data: {
        name: 'Upr\u00e1va oboci',
        description: 'Barveni a tvarovani oboci',
        category: 'brows',
        durationMinutes: 30,
        price: 45000, // 450 CZK
        salonId: salon1.id,
      },
    }),
  ]);

  // Assign services to beauticians
  await prisma.beauticianService.createMany({
    data: [
      { beauticianId: beautician1.id, serviceId: services[0].id },
      { beauticianId: beautician1.id, serviceId: services[3].id },
      { beauticianId: beautician1.id, serviceId: services[4].id },
      { beauticianId: beautician2.id, serviceId: services[1].id },
      { beauticianId: beautician2.id, serviceId: services[2].id },
      { beauticianId: beautician2.id, serviceId: services[4].id },
    ],
  });

  // Demo customer
  await prisma.customer.create({
    data: {
      firstName: 'Marie',
      lastName: 'Kralova',
      email: 'marie@example.com',
      phone: '+420 777 999 000',
    },
  });

  console.log('Seed data created successfully');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
