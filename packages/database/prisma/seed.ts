import { PrismaClient, SalonRole } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding database...");

  // Služby
  const services = await Promise.all([
    prisma.service.create({
      data: {
        name: "Klasické líčení",
        description: "Denní líčení pro běžné příležitosti",
        category: "Líčení",
        defaultPrice: 80000, // 800 CZK
        defaultDuration: 60,
      },
    }),
    prisma.service.create({
      data: {
        name: "Svatební líčení",
        description: "Kompletní svatební líčení včetně zkoušky",
        category: "Líčení",
        defaultPrice: 250000,
        defaultDuration: 120,
      },
    }),
    prisma.service.create({
      data: {
        name: "Manikúra",
        description: "Klasická manikúra s lakováním",
        category: "Nehty",
        defaultPrice: 45000,
        defaultDuration: 45,
      },
    }),
    prisma.service.create({
      data: {
        name: "Gelové nehty",
        description: "Gelová modeláž nehtů",
        category: "Nehty",
        defaultPrice: 90000,
        defaultDuration: 90,
      },
    }),
    prisma.service.create({
      data: {
        name: "Ošetření pleti",
        description: "Hloubkové čištění a ošetření pleti",
        category: "Pleť",
        defaultPrice: 120000,
        defaultDuration: 75,
      },
    }),
    prisma.service.create({
      data: {
        name: "Depilace - celé nohy",
        description: "Depilace voskem celých nohou",
        category: "Depilace",
        defaultPrice: 60000,
        defaultDuration: 45,
      },
    }),
    prisma.service.create({
      data: {
        name: "Barvení řas a obočí",
        description: "Barvení a úprava řas a obočí",
        category: "Oči",
        defaultPrice: 35000,
        defaultDuration: 30,
      },
    }),
    prisma.service.create({
      data: {
        name: "Masáž obličeje",
        description: "Relaxační masáž obličeje s přírodní kosmetikou",
        category: "Pleť",
        defaultPrice: 70000,
        defaultDuration: 45,
      },
    }),
  ]);

  // Salony
  const salon1 = await prisma.salon.create({
    data: {
      name: "Beauty Studio Praha",
      description: "Moderní kosmetický salon v centru Prahy",
      address: "Vodičkova 30",
      city: "Praha",
      zip: "11000",
      phone: "+420 777 123 456",
      email: "info@beautystudio.cz",
    },
  });

  const salon2 = await prisma.salon.create({
    data: {
      name: "Krása Brno",
      description: "Salon krásy v srdci Brna",
      address: "Masarykova 15",
      city: "Brno",
      zip: "60200",
      phone: "+420 777 654 321",
      email: "info@krasabrno.cz",
    },
  });

  // Kosmetičky
  const beautician1 = await prisma.beautician.create({
    data: {
      firstName: "Jana",
      lastName: "Nováková",
      email: "jana@beautystudio.cz",
      phone: "+420 608 111 222",
      bio: "Zkušená kosmetička s 10 lety praxe",
      specializations: ["Líčení", "Pleť"],
    },
  });

  const beautician2 = await prisma.beautician.create({
    data: {
      firstName: "Petra",
      lastName: "Svobodová",
      email: "petra@beautystudio.cz",
      phone: "+420 608 333 444",
      bio: "Specialistka na nehty a depilaci",
      specializations: ["Nehty", "Depilace"],
      managerId: beautician1.id, // Jana je její manažerka
    },
  });

  const beautician3 = await prisma.beautician.create({
    data: {
      firstName: "Eva",
      lastName: "Dvořáková",
      email: "eva@krasabrno.cz",
      phone: "+420 608 555 666",
      bio: "Vizážistka a kosmetička",
      specializations: ["Líčení", "Oči"],
    },
  });

  // Přiřazení kosmetiček k salonům (jedna kosmetička může být ve více salonech)
  await Promise.all([
    prisma.beauticianSalon.create({
      data: { beauticianId: beautician1.id, salonId: salon1.id, role: SalonRole.OWNER },
    }),
    prisma.beauticianSalon.create({
      data: { beauticianId: beautician2.id, salonId: salon1.id, role: SalonRole.BEAUTICIAN },
    }),
    prisma.beauticianSalon.create({
      data: { beauticianId: beautician1.id, salonId: salon2.id, role: SalonRole.BEAUTICIAN },
    }),
    prisma.beauticianSalon.create({
      data: { beauticianId: beautician3.id, salonId: salon2.id, role: SalonRole.OWNER },
    }),
  ]);

  // Přiřazení služeb k salonům
  const salonServices = await Promise.all(
    services.map((service) =>
      prisma.salonService.create({
        data: { salonId: salon1.id, serviceId: service.id },
      })
    )
  );

  await Promise.all(
    services.slice(0, 5).map((service) =>
      prisma.salonService.create({
        data: { salonId: salon2.id, serviceId: service.id },
      })
    )
  );

  // Pracovní doba (Po-Pá 9:00-17:00)
  for (let day = 0; day < 5; day++) {
    await Promise.all([
      prisma.workingHours.create({
        data: {
          beauticianId: beautician1.id,
          salonId: salon1.id,
          dayOfWeek: day,
          startTime: "09:00",
          endTime: "17:00",
        },
      }),
      prisma.workingHours.create({
        data: {
          beauticianId: beautician2.id,
          salonId: salon1.id,
          dayOfWeek: day,
          startTime: "08:00",
          endTime: "16:00",
        },
      }),
      prisma.workingHours.create({
        data: {
          beauticianId: beautician3.id,
          salonId: salon2.id,
          dayOfWeek: day,
          startTime: "10:00",
          endTime: "18:00",
        },
      }),
    ]);
  }

  // Ukázkový zákazník
  await prisma.customer.create({
    data: {
      firstName: "Marie",
      lastName: "Testová",
      email: "marie@test.cz",
      phone: "+420 777 000 000",
    },
  });

  console.log("Seed completed successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
