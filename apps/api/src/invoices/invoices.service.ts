import { Injectable, NotFoundException, BadRequestException } from "@nestjs/common";
import { PrismaService } from "../prisma/prisma.service";
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from "./invoices.dto";

@Injectable()
export class InvoicesService {
  constructor(private prisma: PrismaService) {}

  async findAll(filters: {
    status?: string;
    from?: string;
    to?: string;
  }) {
    return this.prisma.invoice.findMany({
      where: {
        ...(filters.status ? { status: filters.status as never } : {}),
        ...(filters.from || filters.to
          ? {
              issuedAt: {
                ...(filters.from ? { gte: new Date(filters.from) } : {}),
                ...(filters.to ? { lte: new Date(filters.to) } : {}),
              },
            }
          : {}),
      },
      include: {
        items: true,
        booking: {
          include: {
            salon: true,
            beautician: true,
            salonService: { include: { service: true } },
          },
        },
      },
      orderBy: { issuedAt: "desc" },
    });
  }

  async findOne(id: string) {
    const invoice = await this.prisma.invoice.findUnique({
      where: { id },
      include: {
        items: true,
        booking: {
          include: {
            salon: true,
            beautician: true,
            salonService: { include: { service: true } },
            customer: true,
          },
        },
      },
    });

    if (!invoice) throw new NotFoundException("Faktura nenalezena");
    return invoice;
  }

  async create(dto: CreateInvoiceDto) {
    // Načíst rezervaci
    const booking = await this.prisma.booking.findUnique({
      where: { id: dto.bookingId },
      include: {
        salonService: { include: { service: true } },
        invoice: true,
      },
    });

    if (!booking) throw new NotFoundException("Rezervace nenalezena");
    if (booking.invoice) throw new BadRequestException("Faktura pro tuto rezervaci již existuje");

    // Vypočítat cenu
    const price = booking.salonService.price ?? booking.salonService.service.defaultPrice;
    const taxRate = 21;
    const taxAmount = Math.round(price * taxRate / (100 + taxRate));
    const subtotal = price - taxAmount;

    // Generování čísla faktury
    const year = new Date().getFullYear();
    const lastInvoice = await this.prisma.invoice.findFirst({
      where: { number: { startsWith: `${year}-` } },
      orderBy: { number: "desc" },
    });

    let seq = 1;
    if (lastInvoice) {
      const lastSeq = parseInt(lastInvoice.number.split("-")[1], 10);
      seq = lastSeq + 1;
    }
    const invoiceNumber = `${year}-${String(seq).padStart(4, "0")}`;

    return this.prisma.invoice.create({
      data: {
        bookingId: dto.bookingId,
        number: invoiceNumber,
        customerName: dto.customerName,
        customerEmail: dto.customerEmail,
        customerAddress: dto.customerAddress,
        customerIco: dto.customerIco,
        customerDic: dto.customerDic,
        subtotal,
        taxRate,
        taxAmount,
        total: price,
        dueDate: new Date(dto.dueDate),
        note: dto.note,
        items: {
          create: [
            {
              description: booking.salonService.service.name,
              quantity: 1,
              unitPrice: price,
              taxRate,
              total: price,
            },
          ],
        },
      },
      include: { items: true },
    });
  }

  async updateStatus(id: string, dto: UpdateInvoiceStatusDto) {
    const invoice = await this.findOne(id);

    const data: Record<string, unknown> = { status: dto.status };

    if (dto.status === "PAID") {
      data.paidAt = new Date();
    } else if (dto.status === "CANCELLED") {
      data.cancelledAt = new Date();
    }

    return this.prisma.invoice.update({
      where: { id },
      data,
      include: { items: true },
    });
  }

  /**
   * Export faktur pro účetní - vrací souhrnná data za období
   */
  async getAccountingSummary(from: string, to: string) {
    const invoices = await this.prisma.invoice.findMany({
      where: {
        issuedAt: { gte: new Date(from), lte: new Date(to) },
        status: { in: ["ISSUED", "PAID"] },
      },
      include: {
        items: true,
        booking: {
          include: { salon: true },
        },
      },
      orderBy: { number: "asc" },
    });

    const totalRevenue = invoices.reduce((sum, inv) => sum + inv.total, 0);
    const totalTax = invoices.reduce((sum, inv) => sum + inv.taxAmount, 0);
    const totalSubtotal = invoices.reduce((sum, inv) => sum + inv.subtotal, 0);
    const paidCount = invoices.filter((inv) => inv.status === "PAID").length;
    const unpaidCount = invoices.filter((inv) => inv.status === "ISSUED").length;

    return {
      period: { from, to },
      summary: {
        totalInvoices: invoices.length,
        paidCount,
        unpaidCount,
        totalRevenue,
        totalTax,
        totalSubtotal,
      },
      invoices: invoices.map((inv) => ({
        number: inv.number,
        status: inv.status,
        customerName: inv.customerName,
        customerIco: inv.customerIco,
        customerDic: inv.customerDic,
        subtotal: inv.subtotal,
        taxRate: inv.taxRate,
        taxAmount: inv.taxAmount,
        total: inv.total,
        issuedAt: inv.issuedAt,
        dueDate: inv.dueDate,
        paidAt: inv.paidAt,
        salonName: inv.booking.salon.name,
        items: inv.items,
      })),
    };
  }
}
