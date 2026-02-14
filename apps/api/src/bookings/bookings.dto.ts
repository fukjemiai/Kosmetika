import { IsString, IsOptional, IsEmail, IsDateString, IsEnum } from "class-validator";
import { ApiProperty } from "@nestjs/swagger";
import { BookingStatus } from "@kosmetika/database";

export class CreateBookingDto {
  @ApiProperty()
  @IsString()
  salonId!: string;

  @ApiProperty()
  @IsString()
  beauticianId!: string;

  @ApiProperty()
  @IsString()
  salonServiceId!: string;

  @ApiProperty({ required: false, description: "ID registrovaného zákazníka" })
  @IsOptional()
  @IsString()
  customerId?: string;

  @ApiProperty({ required: false, description: "Jméno anonymního zákazníka" })
  @IsOptional()
  @IsString()
  guestName?: string;

  @ApiProperty({ required: false, description: "Email anonymního zákazníka" })
  @IsOptional()
  @IsEmail()
  guestEmail?: string;

  @ApiProperty({ required: false, description: "Telefon anonymního zákazníka" })
  @IsOptional()
  @IsString()
  guestPhone?: string;

  @ApiProperty({ example: "2026-03-15T10:00:00.000Z" })
  @IsDateString()
  startTime!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  note?: string;
}

export class UpdateBookingStatusDto {
  @ApiProperty({ enum: BookingStatus })
  @IsEnum(BookingStatus)
  status!: BookingStatus;
}
