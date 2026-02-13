import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilterDto } from './billing.dto';

@Injectable()
export class BillingService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: InvoiceFilterDto) {
    const where: any = {};
    if (filters.salonId) where.salonId = filters.salonId;
    if (filters.beauticianId) where.beauticianId = filters.beauticianId;
    if (filters.status) where.status = filters.status;
    if (filters.dateFrom || filters.dateTo) {
      where.issuedAt = {};
      if (filters.dateFrom) where.issuedAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.issuedAt.lte = new Date(filters.dateTo);
    }

    return this.prisma.invoice.findMany({
      where,
      include: { items: true },
      orderBy: { issuedAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        booking: true,
        beautician: true,
        salon: true,
      },
    });
    if (!invoice) throw new NotFoundException('Invoice not found');
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    const invoiceNumber = await this.generateInvoiceNumber();

    // Calculate totals
    const items = dto.items.map((item) => ({
      ...item,
      total: item.quantity * item.unitPrice,
    }));
    const subtotal = items.reduce((sum, item) => sum + item.total, 0);
    const taxAmount = Math.round(subtotal * (dto.taxRate / 100));
    const total = subtotal + taxAmount;

    // Get salon for supplier info
    const salon = await this.prisma.salon.findUnique({
      where: { id: dto.salonId },
    });
    if (!salon) throw new NotFoundException('Salon not found');

    return this.prisma.invoice.create({
      data: {
        invoiceNumber,
        bookingId: dto.bookingId,
        customerId: dto.customerId,
        beauticianId: dto.beauticianId,
        salonId: dto.salonId,
        supplierName: salon.name,
        supplierAddress: `${salon.address}, ${salon.city} ${salon.zip}`,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerAddress: dto.customerAddress,
        customerIco: dto.customerIco,
        customerDic: dto.customerDic,
        subtotal,
        taxRate: dto.taxRate,
        taxAmount,
        total,
        dueDate: new Date(dto.dueDate),
        bankAccount: dto.bankAccount,
        variableSymbol: invoiceNumber.replace(/\D/g, ''),
        paymentMethod: dto.paymentMethod,
        notes: dto.notes,
        status: 'issued',
        items: {
          create: items,
        },
      },
      include: { items: true },
    });
  }

  async createFromBooking(bookingId: string) {
    const booking = await this.prisma.booking.findUnique({
      where: { id: bookingId },
      include: {
        service: true,
        salon: true,
        beautician: true,
      },
    });
    if (!booking) throw new NotFoundException('Booking not found');

    const dto: CreateInvoiceDto = {
      bookingId: booking.id,
      customerId: booking.customerId ?? undefined,
      beauticianId: booking.beauticianId,
      salonId: booking.salonId,
      customerName: booking.customerName,
      customerEmail: booking.customerEmail,
      items: [
        {
          description: booking.service.name,
          quantity: 1,
          unitPrice: booking.price,
          taxRate: 21,
        },
      ],
      taxRate: 21,
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        .toISOString()
        .split('T')[0],
      paymentMethod: 'cash',
    };

    return this.create(dto);
  }

  async update(id: string, dto: UpdateInvoiceDto) {
    await this.findOne(id);
    const data: any = {};
    if (dto.status) {
      data.status = dto.status;
      if (dto.status === 'paid') data.paidAt = new Date();
    }
    if (dto.notes !== undefined) data.notes = dto.notes;

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  async getSummary(filters: InvoiceFilterDto) {
    const where: any = {};
    if (filters.salonId) where.salonId = filters.salonId;
    if (filters.beauticianId) where.beauticianId = filters.beauticianId;
    if (filters.dateFrom || filters.dateTo) {
      where.issuedAt = {};
      if (filters.dateFrom) where.issuedAt.gte = new Date(filters.dateFrom);
      if (filters.dateTo) where.issuedAt.lte = new Date(filters.dateTo);
    }

    const invoices = await this.prisma.invoice.findMany({ where });

    return {
      totalRevenue: invoices.reduce((sum, inv) => sum + inv.total, 0),
      totalTax: invoices.reduce((sum, inv) => sum + inv.taxAmount, 0),
      totalSubtotal: invoices.reduce((sum, inv) => sum + inv.subtotal, 0),
      invoiceCount: invoices.length,
      paidCount: invoices.filter((i) => i.status === 'paid').length,
      unpaidCount: invoices.filter((i) => i.status !== 'paid' && i.status !== 'cancelled').length,
      byPaymentMethod: {
        cash: invoices.filter((i) => i.paymentMethod === 'cash').reduce((s, i) => s + i.total, 0),
        card: invoices.filter((i) => i.paymentMethod === 'card').reduce((s, i) => s + i.total, 0),
        bank_transfer: invoices.filter((i) => i.paymentMethod === 'bank_transfer').reduce((s, i) => s + i.total, 0),
      },
      periodFrom: filters.dateFrom || '',
      periodTo: filters.dateTo || '',
    };
  }

  private async generateInvoiceNumber(): Promise<string> {
    const year = new Date().getFullYear();
    const count = await this.prisma.invoice.count({
      where: {
        invoiceNumber: { startsWith: `FV${year}` },
      },
    });
    return `FV${year}${String(count + 1).padStart(5, '0')}`;
  }
}
