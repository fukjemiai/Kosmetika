import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateSalonDto, UpdateSalonDto } from './salons.dto';

@Injectable()
export class SalonsService {
  constructor(private prisma: PrismaService) {}

  findAll(active?: boolean) {
    return this.prisma.salon.findMany({
      where: active !== undefined ? { active } : undefined,
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const salon = await this.prisma.salon.findUnique({
      where: { id },
      include: {
        beauticians: {
          include: { beautician: true },
        },
        services: { where: { active: true } },
      },
    });
    if (!salon) throw new NotFoundException('Salon not found');
    return salon;
  }

  create(dto: CreateSalonDto) {
    return this.prisma.salon.create({ data: dto });
  }

  async update(id: string, dto: UpdateSalonDto) {
    await this.findOne(id);
    return this.prisma.salon.update({ where: { id }, data: dto });
  }

  async remove(id: string) {
    await this.findOne(id);
    return this.prisma.salon.update({
      where: { id },
      data: { active: false },
    });
  }
}
