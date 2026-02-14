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
import { BeauticiansService } from "./beauticians.service";
import { CreateBeauticianDto, UpdateBeauticianDto } from "./beauticians.dto";
import { Public } from "../auth/public.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("beauticians")
@Controller("beauticians")
export class BeauticiansController {
  constructor(private beauticiansService: BeauticiansService) {}

  @Get()
  @Public()
  @ApiQuery({ name: "salonId", required: false })
  findAll(@Query("salonId") salonId?: string) {
    return this.beauticiansService.findAll(salonId);
  }

  @Get(":id")
  @Public()
  findOne(@Param("id") id: string) {
    return this.beauticiansService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  create(@Body() dto: CreateBeauticianDto) {
    return this.beauticiansService.create(dto);
  }

  @Put(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin", "beautician")
  @ApiBearerAuth()
  update(@Param("id") id: string, @Body() dto: UpdateBeauticianDto) {
    return this.beauticiansService.update(id, dto);
  }

  @Post(":id/salons/:salonId")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  assignToSalon(@Param("id") id: string, @Param("salonId") salonId: string) {
    return this.beauticiansService.assignToSalon(id, salonId);
  }

  @Delete(":id/salons/:salonId")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiBearerAuth()
  removeFromSalon(@Param("id") id: string, @Param("salonId") salonId: string) {
    return this.beauticiansService.removeFromSalon(id, salonId);
  }

  @Delete(":id")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("admin")
  @ApiBearerAuth()
  remove(@Param("id") id: string) {
    return this.beauticiansService.remove(id);
  }
}
