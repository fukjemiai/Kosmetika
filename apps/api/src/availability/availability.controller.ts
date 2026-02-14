import { Controller, Get, Put, Param, Query, Body, UseGuards } from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { AvailabilityService } from "./availability.service";
import { Public } from "../auth/public.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("availability")
@Controller("availability")
export class AvailabilityController {
  constructor(private availabilityService: AvailabilityService) {}

  @Get(":beauticianId/:salonId/slots")
  @Public()
  @ApiQuery({ name: "date", required: true, example: "2026-03-15" })
  @ApiQuery({ name: "duration", required: false, example: 60 })
  getAvailableSlots(
    @Param("beauticianId") beauticianId: string,
    @Param("salonId") salonId: string,
    @Query("date") date: string,
    @Query("duration") duration?: string,
  ) {
    return this.availabilityService.getAvailableSlots(
      beauticianId,
      salonId,
      date,
      duration ? parseInt(duration, 10) : 60,
    );
  }

  @Get(":beauticianId/:salonId/hours")
  @Public()
  getWorkingHours(
    @Param("beauticianId") beauticianId: string,
    @Param("salonId") salonId: string,
  ) {
    return this.availabilityService.getWorkingHours(beauticianId, salonId);
  }

  @Put(":beauticianId/:salonId/hours")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("beautician", "salon_owner", "admin")
  @ApiBearerAuth()
  setWorkingHours(
    @Param("beauticianId") beauticianId: string,
    @Param("salonId") salonId: string,
    @Body() hours: Array<{ dayOfWeek: number; startTime: string; endTime: string }>,
  ) {
    return this.availabilityService.setWorkingHours(beauticianId, salonId, hours);
  }
}
