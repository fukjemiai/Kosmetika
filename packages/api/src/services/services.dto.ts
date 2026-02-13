import { IsString, IsOptional, IsInt, Min } from 'class-validator';
import { ApiProperty, PartialType } from '@nestjs/swagger';

export class CreateServiceDto {
  @ApiProperty() @IsString() name: string;
  @ApiProperty({ required: false }) @IsOptional() @IsString() description?: string;
  @ApiProperty() @IsString() category: string;
  @ApiProperty() @IsInt() @Min(5) durationMinutes: number;
  @ApiProperty() @IsInt() @Min(0) price: number;
  @ApiProperty() @IsString() salonId: string;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}
