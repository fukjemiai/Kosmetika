import { IsString, IsOptional, IsInt, Min } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateServiceDto {
  @ApiProperty({ example: "Manikúra" })
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ required: false, example: "Nehty" })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiProperty({ example: 45000, description: "Cena v haléřích (450 CZK = 45000)" })
  @IsInt()
  @Min(0)
  defaultPrice!: number;

  @ApiProperty({ example: 45, description: "Trvání v minutách" })
  @IsInt()
  @Min(5)
  defaultDuration!: number;
}

export class UpdateServiceDto extends PartialType(CreateServiceDto) {}

export class AssignServiceToSalonDto {
  @ApiProperty()
  @IsString()
  salonId!: string;

  @ApiProperty()
  @IsString()
  serviceId!: string;

  @ApiProperty({ required: false, description: "Přepsaná cena pro salon (v haléřích)" })
  @IsOptional()
  @IsInt()
  @Min(0)
  price?: number;

  @ApiProperty({ required: false, description: "Přepsané trvání pro salon (minuty)" })
  @IsOptional()
  @IsInt()
  @Min(5)
  duration?: number;
}
