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
import { ServicesService } from "./services.service";
import { CreateServiceDto, UpdateServiceDto, AssignServiceToSalonDto } from "./services.dto";
import { Public } from "../auth/public.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("services")
@Controller("services")
export class ServicesController {
  constructor(private servicesService: ServicesService) {}

  @Get()
  @Public()
  @ApiQuery({ name: "category", required: false })
  findAll(@Query("category") category?: string) {
    return this.servicesService.findAll(category);
  }

  @Get("salon/:salonId")
  @Public()
  findBySalon(@Param("salonId") salonId: string) {
    return this.servicesService.findBySalon(salonId);
  }

  @Get(":id")
  @Public()
  findOne(@Param("id") id: string) {
    return this.servicesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  create(@Body() dto: CreateServiceDto) {
    return this.servicesService.create(dto);
  }

  @Put(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  update(@Param("id") id: string, @Body() dto: UpdateServiceDto) {
    return this.servicesService.update(id, dto);
  }

  @Post("assign")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  assignToSalon(@Body() dto: AssignServiceToSalonDto) {
    return this.servicesService.assignToSalon(dto);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  remove(@Param("id") id: string) {
    return this.servicesService.remove(id);
  }
}
