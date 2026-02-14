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
import { InvoicesService } from "./invoices.service";
import { CreateInvoiceDto, UpdateInvoiceStatusDto } from "./invoices.dto";
import { AuthGuard } from "../auth/auth.guard";
import { RolesGuard } from "../auth/roles.guard";
import { Roles } from "../auth/roles.decorator";

@ApiTags("invoices")
@Controller("invoices")
@UseGuards(AuthGuard)
@ApiBearerAuth()
export class InvoicesController {
  constructor(private invoicesService: InvoicesService) {}

  @Get()
  @ApiQuery({ name: "status", required: false })
  @ApiQuery({ name: "from", required: false })
  @ApiQuery({ name: "to", required: false })
  findAll(
    @Query("status") status?: string,
    @Query("from") from?: string,
    @Query("to") to?: string,
  ) {
    return this.invoicesService.findAll({ status, from, to });
  }

  @Get("accounting")
  @UseGuards(RolesGuard)
  @Roles("salon_owner", "admin")
  @ApiQuery({ name: "from", required: true })
  @ApiQuery({ name: "to", required: true })
  getAccountingSummary(@Query("from") from: string, @Query("to") to: string) {
    return this.invoicesService.getAccountingSummary(from, to);
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.invoicesService.findOne(id);
  }

  @Post()
  @UseGuards(RolesGuard)
  @Roles("beautician", "salon_owner", "admin")
  create(@Body() dto: CreateInvoiceDto) {
    return this.invoicesService.create(dto);
  }

  @Put(":id/status")
  @UseGuards(RolesGuard)
  @Roles("salon_owner", "admin")
  updateStatus(@Param("id") id: string, @Body() dto: UpdateInvoiceStatusDto) {
    return this.invoicesService.updateStatus(id, dto);
  }
}
