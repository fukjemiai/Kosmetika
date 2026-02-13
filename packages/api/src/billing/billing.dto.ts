import {
  IsString,
  IsOptional,
  IsInt,
  IsArray,
  ValidateNested,
  Min,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty } from '@nestjs/swagger';

export class CreateInvoiceItemDto {
  @ApiProperty() @IsString() description: string;
  @ApiProperty() @IsInt() @Min(1) quantity: number;
  @ApiProperty() @IsInt() @Min(0) unitPrice: number;
  @ApiProperty() @IsInt() taxRate: number;
}

export class CreateInvoiceDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() bookingId?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerId?: string;
  @ApiProperty() @IsString() beauticianId: string;
  @ApiProperty() @IsString() salonId: string;
  @ApiProperty() @IsString() customerName: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerEmail?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerAddress?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerIco?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerDic?: string;
  @ApiProperty({ type: [CreateInvoiceItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateInvoiceItemDto)
  items: CreateInvoiceItemDto[];
  @ApiProperty() @IsInt() taxRate: number;
  @ApiProperty() @IsString() dueDate: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bankAccount?: string;
  @ApiProperty() @IsString() paymentMethod: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class UpdateInvoiceDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class InvoiceFilterDto {
  salonId?: string;
  beauticianId?: string;
  status?: string;
  dateFrom?: string;
  dateTo?: string;
}
