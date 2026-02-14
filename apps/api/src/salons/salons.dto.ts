import { IsString, IsOptional, IsEmail } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateSalonDto {
  @ApiProperty({ example: "Beauty Studio Praha" })
  @IsString()
  name!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: "Vodičkova 30" })
  @IsString()
  address!: string;

  @ApiProperty({ example: "Praha" })
  @IsString()
  city!: string;

  @ApiProperty({ example: "11000" })
  @IsString()
  zip!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsEmail()
  email?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  website?: string;
}

export class UpdateSalonDto extends PartialType(CreateSalonDto) {}
