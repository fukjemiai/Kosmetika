import { IsString, IsOptional, IsEmail, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { InvoiceStatus } from "@kosmetika/database";

export class CreateInvoiceDto {
  @ApiProperty()
  @IsString()
  bookingId!: string;

  @ApiProperty({ example: "Marie Nováková" })
  @IsString()
  customerName!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  customerAddress?: string;

  @ApiProperty({ required: false, description: "IČO zákazníka" })
  @IsOptional()
  @IsString()
  customerIco?: string;

  @ApiProperty({ required: false, description: "DIČ zákazníka" })
  @IsOptional()
  @IsString()
  customerDic?: string;

  @ApiProperty({ example: "2026-04-15" })
  @IsDateString()
  dueDate!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateInvoiceStatusDto {
  @ApiProperty({ enum: InvoiceStatus })
  @IsEnum(InvoiceStatus)
  status!: InvoiceStatus;
}
