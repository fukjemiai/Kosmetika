import { IsString, IsOptional, IsInt, Min, Max } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateBeauticianDto {
  @ApiProperty() @IsString() firstName: string;
  @ApiProperty() @IsString() lastName: string;
  @ApiProperty() @IsString() email: string;
  @ApiProperty() @IsString() phone: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() bio?: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() parentBeauticianId?: string;
}

export class UpdateBeauticianDto extends PartialType(CreateBeauticianDto) {}

export class AssignSalonDto {
  @ApiProperty() @IsString() beauticianId: string;
  @ApiProperty() @IsString() salonId: string;
  @ApiProperty({ default: 'employee' }) @IsString() role: string;
}

export class SetWorkingHoursDto {
  @ApiProperty() @IsString() beauticianId: string;
  @ApiProperty() @IsString() salonId: string;
  @ApiProperty() @IsInt() @Min(0) @Max(6) dayOfWeek: number;
  @ApiProperty() @IsString() startTime: string;
  @ApiProperty() @IsString() endTime: string;
}
