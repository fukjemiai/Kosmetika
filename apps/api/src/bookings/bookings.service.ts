import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBookingDto, UpdateBookingStatusDto } from "./bookings.dto";
import { BookingStatus } from "@kosmetika/database";

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    salonId?: string;
    beauticianId?: string;
    customerId?: string;
    status?: BookingStatus;
    from?: string;
    to?: string;
  }) {
    return this.prisma.booking.findMany({
      where: {
        ...(filters.salonId ? { salonId: filters.salonId } : {}),
        ...(filters.beauticianId ? { beauticianId: filters.beauticianId } : {}),
        ...(filters.customerId ? { customerId: filters.customerId } : {}),
        ...(filters.status ? { status: filters.status } : {}),
        ...(filters.from || filters.to
          ? {
              startTime: {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(filters.to) } : {}),
              },
            }
          : {}),
      },
      include: {
        salon: true,
        beautician: true,
        salonService: { include: { service: true } },
        customer: true,
        invoice: true,
      },
      orderBy: { startTime: "asc" },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        salon: true,
        beautician: true,
        salonService: { include: { service: true } },
        customer: true,
        invoice: true,
      },
    });

    if (!booking) throw new NotFoundException("Rezervace nenalezena");
    return booking;
  }

  async create(dto: CreateBookingDto) {
    // Ověření, že služba existuje v daném salonu
    const salonService = await this.prisma.salonService.findUnique({
      where: { id: dto.salonServiceId },
      include: { service: true },
    });

    if (!salonService) {
      throw new BadRequestException("Služba v tomto salonu neexistuje");
    }

    // Výpočet endTime na základě trvání služby
    const duration = salonService.duration ?? salonService.service.defaultDuration;
    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + duration * 60000);

    // Kontrola kolize s existujícími rezervacemi
    const conflict = await this.prisma.booking.findFirst({
      where: {
        beauticianId: dto.beauticianId,
        status: { notIn: ["CANCELLED", "NO_SHOW"] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });

    if (conflict) {
      throw new BadRequestException("Vybraný termín je již obsazený");
    }

    // Vytvoření nebo nalezení zákazníka pro anonymní objednávky
    let customerId = dto.customerId;
    if (!customerId && dto.guestEmail) {
      const existingCustomer = await this.prisma.customer.findFirst({
        where: { email: dto.guestEmail, keycloakId: null },
      });

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomer = await this.prisma.customer.create({
          data: {
            firstName: dto.guestName?.split(" ")[0] ?? "Host",
            lastName: dto.guestName?.split(" ").slice(1).join(" ") ?? "",
            email: dto.guestEmail,
            phone: dto.guestPhone,
          },
        });
        customerId = newCustomer.id;
      }
    }

    return this.prisma.booking.create({
      data: {
        salonId: dto.salonId,
        beauticianId: dto.beauticianId,
        salonServiceId: dto.salonServiceId,
        customerId,
        guestName: dto.guestName,
        guestEmail: dto.guestEmail,
        guestPhone: dto.guestPhone,
        startTime,
        endTime,
        note: dto.note,
      },
      include: {
        salon: true,
        beautician: true,
        salonService: { include: { service: true } },
        customer: true,
      },
    });
  }

  async updateStatus(id: string, dto: UpdateBookingStatusDto) {
    await this.findOne(id);
    return this.prisma.booking.update({
      where: { id },
      data: { status: dto.status },
      include: {
        salon: true,
        beautician: true,
        salonService: { include: { service: true } },
        customer: true,
      },
    });
  }

  async cancel(id: string) {
    const booking = await this.findOne(id);
    if (booking.status === "CANCELLED") {
      throw new BadRequestException("Rezervace je již zrušená");
    }
    return this.prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED" },
    });
  }
}
