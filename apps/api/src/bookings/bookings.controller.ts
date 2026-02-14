import {
  Controller,
  Get,
  Post,
  Put,
  Param,
  Body,
  Query,
  UseGuards,
} from "@nestjs/common";
import { ApiTags, ApiBearerAuth, ApiQuery } from "@nestjs/swagger";
import { BookingsService } from "./bookings.service";
import { CreateBookingDto, UpdateBookingStatusDto } from "./bookings.dto";
import { Public } from "../auth/public.decorator";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";
import type { BookingStatus } from "@kosmetika/database";

@ApiTags("bookings")
@Controller("bookings")
export class BookingsController {
  constructor(private bookingsService: BookingsService) {}

  @Get()
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  @ApiQuery({ name: "salonId", required: false })
  @ApiQuery({ name: "beauticianId", required: false })
  @ApiQuery({ name: "customerId", required: false })
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  findAll(
    @Query("salonId") salonId?: string,
    @Query("beauticianId") beauticianId?: string,
    @Query("customerId") customerId?: string,
    @Query("status") status?: BookingStatus,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.bookingsService.findAll({ salonId, beauticianId, customerId, status, from, to });
  }

  @Get(":id")
  @UseGuards(AuthGuard)
  @ApiBearerAuth()
  findOne(@Param("id") id: string) {
    return this.bookingsService.findOne(id);
  }

  @Post()
  @Public() // Anonymní zákazníci mohou vytvářet rezervace
  create(@Body() dto: CreateBookingDto) {
    return this.bookingsService.create(dto);
  }

  @Put(":id/status")
  @UseGuards(AuthGuard, RolesGuard)
  @Roles("beautician", "salon_owner", "admin")
  @ApiBearerAuth()
  updateStatus(@Param("id") id: string, @Body() dto: UpdateBookingStatusDto) {
    return this.bookingsService.updateStatus(id, dto);
  }

  @Put(":id/cancel")
  @Public() // Zákazníci mohou rušit své rezervace
  cancel(@Param("id") id: string) {
    return this.bookingsService.cancel(id);
  }
}
