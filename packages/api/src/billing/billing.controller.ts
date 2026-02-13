import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  Res,
  Header,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { Response } from 'express';
import { BillingService } from './billing.service';
import { InvoicePdfService } from './invoice-pdf.service';
import { CreateInvoiceDto, UpdateInvoiceDto, InvoiceFilterDto } from './billing.dto';

@ApiTags('Billing')
@ApiBearerAuth()
@Controller('api/billing')
export class BillingController {
  constructor(
    private billingService: BillingService,
    private invoicePdfService: InvoicePdfService,
  ) {}

  @Get('invoices')
  findAll(
    @Query('salonId') salonId?: string,
    @Query('beauticianId') beauticianId?: string,
    @Query('status') status?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.billingService.findAll({
      salonId,
      beauticianId,
      status,
      dateFrom,
      dateTo,
    });
  }

  @Get('invoices/:id')
  findOne(@Param('id') id: string) {
    return this.billingService.findOne(id);
  }

  @Post('invoices')
  create(@Body() dto: CreateInvoiceDto) {
    return this.billingService.create(dto);
  }

  @Post('invoices/from-booking/:bookingId')
  createFromBooking(@Param('bookingId') bookingId: string) {
    return this.billingService.createFromBooking(bookingId);
  }

  @Put('invoices/:id')
  update(@Param('id') id: string, @Body() dto: UpdateInvoiceDto) {
    return this.billingService.update(id, dto);
  }

  @Get('invoices/:id/pdf')
  async downloadPdf(@Param('id') id: string, @Res() res: Response) {
    const invoice = await this.billingService.findOne(id);
    const pdfBuffer = await this.invoicePdfService.generatePdf(invoice);

    res.set({
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename=faktura-${invoice.invoiceNumber}.pdf`,
      'Content-Length': pdfBuffer.length,
    });
    res.send(pdfBuffer);
  }

  @Get('summary')
  getSummary(
    @Query('salonId') salonId?: string,
    @Query('beauticianId') beauticianId?: string,
    @Query('dateFrom') dateFrom?: string,
    @Query('dateTo') dateTo?: string,
  ) {
    return this.billingService.getSummary({
      salonId,
      beauticianId,
      dateFrom,
      dateTo,
    });
  }
}
