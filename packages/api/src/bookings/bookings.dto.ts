import { IsString, IsOptional, IsEmail } from 'class-validator';
import { ApiProperty, PartialType, PickType } from '@nestjs/swagger';

export class CreateBookingDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() customerId?: string;
  @ApiProperty() @IsString() customerName: string;
  @ApiProperty() @IsEmail() customerEmail: string;
  @ApiProperty() @IsString() customerPhone: string;
  @ApiProperty() @IsString() beauticianId: string;
  @ApiProperty() @IsString() salonId: string;
  @ApiProperty() @IsString() serviceId: string;
  @ApiProperty() @IsString() startTime: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
}

export class UpdateBookingDto {
  @ApiProperty({ required: false }) @IsOptional() @IsString() status?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() notes?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() startTime?: string;
}
