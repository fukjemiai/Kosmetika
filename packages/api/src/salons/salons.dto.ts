import { IsString, IsOptional, IsObject, IsEmail } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';
import { Prisma } from '@prisma/client';

export class CreateSalonDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty() @IsString() address: string;
  @ApiProperty() @IsString() city: string;
  @ApiProperty() @IsString() zip: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty() @IsEmail() email: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsObject() openingHours: Prisma.InputJsonValue;
}

export class UpdateSalonDto extends PartialType(CreateSalonDto) {}
