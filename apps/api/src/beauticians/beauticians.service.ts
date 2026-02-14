import { Injectable, NotFoundException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateBeauticianDto, UpdateBeauticianDto } from "./beauticians.dto";

@Injectable()
export class BeauticiansService {
  constructor(private prisma: PrismaService) {}

  async findAll(salonId?: string) {
    return this.prisma.beautician.findMany({
      where: {
        active: true,
        ...(salonId ? { salons: { some: { salonId } } } : {}),
      },
      include: {
        salons: { include: { salon: true } },
        subordinates: true,
        manager: true,
      },
      orderBy: { lastName: "asc" },
    });
  }

  async findOne(id: string) {
    const beautician = await this.prisma.beautician.findUnique({
      where: { id },
      include: {
        salons: { include: { salon: true } },
        subordinates: true,
        manager: true,
        workingHours: true,
      },
    });

    if (!beautician) throw new NotFoundException("Kosmetička nenalezena");
    return beautician;
  }

  async findByKeycloakId(keycloakId: string) {
    return this.prisma.beautician.findUnique({
      where: { keycloakId },
      include: {
        salons: { include: { salon: true } },
        subordinates: true,
      },
    });
  }

  async create(dto: CreateBeauticianDto) {
    const { salonIds, ...data } = dto;
    return this.prisma.beautician.create({
      data: {
        ...data,
        salons: salonIds
          ? {
              create: salonIds.map((salonId) => ({ salonId })),
            }
          : undefined,
      },
      include: { salons: { include: { salon: true } } },
    });
  }

  async update(id: string, dto: UpdateBeauticianDto) {
    await this.findOne(id);
    const { salonIds, ...data } = dto;
    return this.prisma.beautician.update({
      where: { id },
      data,
      include: { salons: { include: { salon: true } } },
    });
  }

  async assignToSalon(beauticianId: string, salonId: string, role: "OWNER" | "BEAUTICIAN" = "BEAUTICIAN") {
    return this.prisma.beauticianSalon.upsert({
      where: { beauticianId_salonId: { beauticianId, salonId } },
      update: { role },
      create: { beauticianId, salonId, role },
    });
  }

  async removeFromSalon(beauticianId: string, salonId: string) {
    return this.prisma.beauticianSalon.delete({
      where: { beauticianId_salonId: { beauticianId, salonId } },
    });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.beautician.update({ where: { id }, data: { active: false } });
  }
}
