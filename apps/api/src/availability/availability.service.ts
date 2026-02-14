import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";

export interface TimeSlot {
  startTime: string;
  endTime: string;
  available: boolean;
}

@Injectable()
export class AvailabilityService {
  constructor(private prisma: PrismaService) {}

  /**
   * Vrátí dostupné časové sloty pro danou kosmetičku v daném salonu na daný den.
   */
  async getAvailableSlots(
    beauticianId: string,
    salonId: string,
    date: string,
    serviceDuration: number = 60,
  ): Promise<TimeSlot[]> {
    const targetDate = new Date(date);
    const dayOfWeek = (targetDate.getDay() + 6) % 7; // 0 = pondělí

    // Pracovní doba
    const workingHours = await this.prisma.workingHours.findUnique({
      where: {
        beauticianId_salonId_dayOfWeek: { beauticianId, salonId, dayOfWeek },
      },
    });

    if (!workingHours) {
      return []; // V tento den nepracuje
    }

    // Existující rezervace na tento den
    const dayStart = new Date(targetDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(targetDate);
    dayEnd.setHours(23, 59, 59, 999);

    const bookings = await this.prisma.booking.findMany({
      where: {
        beauticianId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: "asc" },
    });

    // Generování slotů po 30 minutách
    const slots: TimeSlot[] = [];
    const [startHour, startMin] = workingHours.startTime.split(":").map(Number);
    const [endHour, endMin] = workingHours.endTime.split(":").map(Number);

    const workStart = new Date(targetDate);
    workStart.setHours(startHour, startMin, 0, 0);

    const workEnd = new Date(targetDate);
    workEnd.setHours(endHour, endMin, 0, 0);

    const slotInterval = 30; // minuty
    let current = new Date(workStart);

    while (current.getTime() + serviceDuration * 60000 <= workEnd.getTime()) {
      const slotStart = new Date(current);
      const slotEnd = new Date(current.getTime() + serviceDuration * 60000);

      // Kontrola kolize s existujícími rezervacemi
      const isConflicting = bookings.some(
        (b) => b.startTime < slotEnd && b.endTime > slotStart,
      );

      slots.push({
        startTime: slotStart.toISOString(),
        endTime: slotEnd.toISOString(),
        available: !isConflicting,
      });

      current = new Date(current.getTime() + slotInterval * 60000);
    }

    return slots;
  }

  /**
   * Vrátí pracovní dobu kosmetičky v salonu.
   */
  async getWorkingHours(beauticianId: string, salonId: string) {
    return this.prisma.workingHours.findMany({
      where: { beauticianId, salonId },
      orderBy: { dayOfWeek: "asc" },
    });
  }

  /**
   * Nastaví pracovní dobu kosmetičky v salonu.
   */
  async setWorkingHours(
    beauticianId: string,
    salonId: string,
    hours: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  ) {
    // Smazat stávající a vytvořit nové
    await this.prisma.workingHours.deleteMany({
      where: { beauticianId, salonId },
    });

    return this.prisma.workingHours.createMany({
      data: hours.map((h) => ({
        beauticianId,
        salonId,
        dayOfWeek: h.dayOfWeek,
        startTime: h.startTime,
        endTime: h.endTime,
      })),
    });
  }
}
