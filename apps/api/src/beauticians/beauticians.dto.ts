import { IsString, IsOptional, IsEmail, IsArray } from "class-validator";
import { ApiProperty, PartialType } from "@nestjs/swagger";

export class CreateBeauticianDto {
  @ApiProperty({ example: "Jana" })
  @IsString()
  firstName!: string;

  @ApiProperty({ example: "Nováková" })
  @IsString()
  lastName!: string;

  @ApiProperty({ example: "jana@salon.cz" })
  @IsEmail()
  email!: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  phone?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  keycloakId?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  managerId?: string;

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specializations?: string[];

  @ApiProperty({ required: false, type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  salonIds?: string[];
}

export class UpdateBeauticianDto extends PartialType(CreateBeauticianDto) {}
