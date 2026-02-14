import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { SalonsService } from "./salons.service";
import { CreateSalonDto, UpdateSalonDto } from "./salons.dto";
import { Public } from "../auth/public.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("salons")
@Controller("salons")
export class SalonsController {
  constructor(private salonsService: SalonsService) {}

  @Get()
  @Public()
  @ApiQuery({ name: "city", required: false })
  findAll(@Query("city") city?: string) {
    return this.salonsService.findAll(city);
  }

  @Get(":id")
  @Public()
  findOne(@Param("id") id: string) {
    return this.salonsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  create(@Body() dto: CreateSalonDto) {
    return this.salonsService.create(dto);
  }

  @Put(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  update(@Param("id") id: string, @Body() dto: UpdateSalonDto) {
    return this.salonsService.update(id, dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  remove(@Param("id") id: string) {
    return this.salonsService.remove(id);
  }
}
