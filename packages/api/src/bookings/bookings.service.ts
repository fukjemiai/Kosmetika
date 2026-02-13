import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateBookingDto, UpdateBookingDto } from './bookings.dto';

@Injectable()
export class BookingsService {
  constructor(private prisma: PrismaService) {}

  findAll(filters: {
    beauticianId?: string;
    salonId?: string;
    status?: string;
    dateFrom?: string;
    dateTo?: string;
  }) {
    const where: any = {};
    if (filters.beauticianId) where.beauticianId = filters.beauticianId;
    if (filters.salonId) where.salonId = filters.salonId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.startTime = {};
      if (filters.dateFrom) where.startTime.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.startTime.lte = new Date(filters.dateTo);
    }

    return this.prisma.booking.findMany({
      where,
      include: {
        beautician: true,
        salon: true,
        service: true,
        customer: true,
      },
      orderBy: { startTime: 'asc' },
    });
  }

  async findOne(id: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id },
      include: {
        beautician: true,
        salon: true,
        service: true,
        customer: true,
        invoice: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');
    return booking;
  }

  async create(dto: CreateBookingDto) {
    // Get service to calculate end time and price
    const service = await this.prisma.service.findUnique({
      where: { id: dto.serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    // Check for custom price/duration for this beautician
    const beauticianService = await this.prisma.beauticianService.findUnique({
      where: {
        beauticianId_serviceId: {
          beauticianId: dto.beauticianId,
          serviceId: dto.serviceId,
        },
      },
    });

    const duration = beauticianService?.customDuration ?? service.durationMinutes;
    const price = beauticianService?.customPrice ?? service.price;

    const startTime = new Date(dto.startTime);
    const endTime = new Date(startTime.getTime() + duration * 60 * 1000);

    // Check availability
    const conflict = await this.prisma.booking.findFirst({
      where: {
        beauticianId: dto.beauticianId,
        status: { notIn: ['cancelled', 'no_show'] },
        OR: [
          { startTime: { lt: endTime }, endTime: { gt: startTime } },
        ],
      },
    });
    if (conflict) {
      throw new BadRequestException('Time slot is not available');
    }

    // Check working hours
    const dayOfWeek = (startTime.getDay() + 6) % 7; // Convert to 0=Monday
    const workingHours = await this.prisma.workingHours.findUnique({
      where: {
        beauticianId_salonId_dayOfWeek: {
          beauticianId: dto.beauticianId,
          salonId: dto.salonId,
          dayOfWeek,
        },
      },
    });

    if (workingHours) {
      const timeStr = `${String(startTime.getHours()).padStart(2, '0')}:${String(startTime.getMinutes()).padStart(2, '0')}`;
      const endTimeStr = `${String(endTime.getHours()).padStart(2, '0')}:${String(endTime.getMinutes()).padStart(2, '0')}`;
      if (timeStr < workingHours.startTime || endTimeStr > workingHours.endTime) {
        throw new BadRequestException('Outside of working hours');
      }
    }

    // Find or create customer
    let customerId = dto.customerId;
    if (!customerId && dto.customerEmail) {
      const customer = await this.prisma.customer.findFirst({
        where: { email: dto.customerEmail },
      });
      if (customer) customerId = customer.id;
    }

    return this.prisma.booking.create({
      data: {
        customerId,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerPhone: dto.customerPhone,
        beauticianId: dto.beauticianId,
        salonId: dto.salonId,
        serviceId: dto.serviceId,
        startTime,
        endTime,
        price,
        notes: dto.notes,
      },
      include: {
        beautician: true,
        salon: true,
        service: true,
      },
    });
  }

  async update(id: string, dto: UpdateBookingDto) {
    const booking = await this.findOne(id);

    const data: any = {};
    if (dto.status) data.status = dto.status;
    if (dto.notes !== undefined) data.notes = dto.notes;

    if (dto.startTime) {
      const service = await this.prisma.service.findUnique({
        where: { id: booking.serviceId },
      });
      const startTime = new Date(dto.startTime);
      const duration = service!.durationMinutes;
      data.startTime = startTime;
      data.endTime = new Date(startTime.getTime() + duration * 60 * 1000);
    }

    return this.prisma.booking.update({
      where: { id },
      data,
      include: {
        beautician: true,
        salon: true,
        service: true,
      },
    });
  }

  async getAvailableSlots(
    beauticianId: string,
    salonId: string,
    serviceId: string,
    date: string,
  ) {
    const service = await this.prisma.service.findUnique({
      where: { id: serviceId },
    });
    if (!service) throw new NotFoundException('Service not found');

    const beauticianService = await this.prisma.beauticianService.findUnique({
      where: {
        beauticianId_serviceId: { beauticianId, serviceId },
      },
    });
    const duration = beauticianService?.customDuration ?? service.durationMinutes;

    const targetDate = new Date(date);
    const dayOfWeek = (targetDate.getDay() + 6) % 7;

    const workingHours = await this.prisma.workingHours.findUnique({
      where: {
        beauticianId_salonId_dayOfWeek: { beauticianId, salonId, dayOfWeek },
      },
    });
    if (!workingHours) return [];

    // Get existing bookings for the day
    const dayStart = new Date(date + 'T00:00:00');
    const dayEnd = new Date(date + 'T23:59:59');
    const existingBookings = await this.prisma.booking.findMany({
      where: {
        beauticianId,
        status: { notIn: ['cancelled', 'no_show'] },
        startTime: { gte: dayStart, lte: dayEnd },
      },
      orderBy: { startTime: 'asc' },
    });

    // Generate slots
    const slots: { start: string; end: string }[] = [];
    const [startH, startM] = workingHours.startTime.split(':').map(Number);
    const [endH, endM] = workingHours.endTime.split(':').map(Number);

    let current = new Date(targetDate);
    current.setHours(startH, startM, 0, 0);

    const workEnd = new Date(targetDate);
    workEnd.setHours(endH, endM, 0, 0);

    while (current.getTime() + duration * 60 * 1000 <= workEnd.getTime()) {
      const slotEnd = new Date(current.getTime() + duration * 60 * 1000);
      const hasConflict = existingBookings.some(
        (b) => b.startTime < slotEnd && b.endTime > current,
      );

      if (!hasConflict) {
        slots.push({
          start: current.toISOString(),
          end: slotEnd.toISOString(),
        });
      }

      // Move to next 15-min slot
      current = new Date(current.getTime() + 15 * 60 * 1000);
    }

    return slots;
  }
}
