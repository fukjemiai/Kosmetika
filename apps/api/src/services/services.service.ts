import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateServiceDto, UpdateServiceDto, AssignServiceToSalonDto } from "./services.dto";

@Injectable()
export class ServicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(category?: string) {
    return this.prisma.service.findMany({
      where: {
        active: true,
        ...(category ? { category } : {}),
      },
      orderBy: { name: "asc" },
    });
  }

  async findBySalon(salonId: string) {
    const salonServices = await this.prisma.salonService.findMany({
      where: { salonId, active: true },
      include: { service: true },
    });

    return salonServices.map((ss) => ({
      ...ss,
      effectivePrice: ss.price ?? ss.service.defaultPrice,
      effectiveDuration: ss.duration ?? ss.service.defaultDuration,
    }));
  }

  async findOne(id: string) {
    const service = await this.prisma.service.findUnique({ where: { id } });
    if (!service) throw new NotFoundException("Služba nenalezena");
    return service;
  }

  async create(dto: CreateServiceDto) {
    return this.prisma.service.create({ data: dto });
  }

  async update(id: string, dto: UpdateServiceDto) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: dto });
  }

  async assignToSalon(dto: AssignServiceToSalonDto) {
    return this.prisma.salonService.upsert({
      where: {
        salonId_serviceId: { salonId: dto.salonId, serviceId: dto.serviceId },
      },
      update: { price: dto.price, duration: dto.duration },
      create: dto,
    });
  }

  async removeFromSalon(salonId: string, serviceId: string) {
    return this.prisma.salonService.update({
      where: { salonId_serviceId: { salonId, serviceId } },
      data: { active: false },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.service.update({ where: { id }, data: { active: false } });
  }
}
