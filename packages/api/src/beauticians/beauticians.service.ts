import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import {
  CreateBeauticianDto,
  UpdateBeauticianDto,
  AssignSalonDto,
  SetWorkingHoursDto,
} from './beauticians.dto';

@Injectable()
export class BeauticiansService {
  constructor(private prisma: PrismaService) {}

  findAll(salonId?: string) {
    return this.prisma.beautician.findMany({
      where: {
        active: true,
        ...(salonId
          ? { salons: { some: { salonId } } }
          : {}),
      },
      include: {
        salons: { include: { salon: true } },
      },
      orderBy: { lastName: 'asc' },
    });
  }

  async findOne(id: string) {
    const beautician = await this.prisma.beautician.findUnique({
      where: { id },
      include: {
        salons: { include: { salon: true } },
        services: { include: { service: true } },
        team: true,
        workingHours: true,
      },
    });
    if (!beautician) throw new NotFoundException('Beautician not found');
    return beautician;
  }

  async findByKeycloakId(keycloakId: string) {
    const beautician = await this.prisma.beautician.findUnique({
      where: { keycloakId },
      include: {
        salons: { include: { salon: true } },
        team: true,
      },
    });
    if (!beautician) throw new NotFoundException('Beautician not found');
    return beautician;
  }

  create(dto: CreateBeauticianDto, keycloakId: string) {
    return this.prisma.beautician.create({
      data: { ...dto, keycloakId },
    });
  }

  async update(id: string, dto: UpdateBeauticianDto) {
    await this.findOne(id);
    return this.prisma.beautician.update({ where: { id }, data: dto });
  }

  async assignToSalon(dto: AssignSalonDto) {
    return this.prisma.beauticianSalon.upsert({
      where: {
        beauticianId_salonId: {
          beauticianId: dto.beauticianId,
          salonId: dto.salonId,
        },
      },
      create: dto,
      update: { role: dto.role },
    });
  }

  async removeFromSalon(beauticianId: string, salonId: string) {
    return this.prisma.beauticianSalon.delete({
      where: {
        beauticianId_salonId: { beauticianId, salonId },
      },
    });
  }

  async setWorkingHours(dto: SetWorkingHoursDto) {
    return this.prisma.workingHours.upsert({
      where: {
        beauticianId_salonId_dayOfWeek: {
          beauticianId: dto.beauticianId,
          salonId: dto.salonId,
          dayOfWeek: dto.dayOfWeek,
        },
      },
      create: dto,
      update: {
        startTime: dto.startTime,
        endTime: dto.endTime,
      },
    });
  }

  async getWorkingHours(beauticianId: string, salonId: string) {
    return this.prisma.workingHours.findMany({
      where: { beauticianId, salonId },
      orderBy: { dayOfWeek: 'asc' },
    });
  }

  async assignService(beauticianId: string, serviceId: string, customPrice?: number, customDuration?: number) {
    return this.prisma.beauticianService.upsert({
      where: {
        beauticianId_serviceId: { beauticianId, serviceId },
      },
      create: { beauticianId, serviceId, customPrice, customDuration },
      update: { customPrice, customDuration },
    });
  }

  async removeService(beauticianId: string, serviceId: string) {
    return this.prisma.beauticianService.delete({
      where: {
        beauticianId_serviceId: { beauticianId, serviceId },
      },
    });
  }
}
