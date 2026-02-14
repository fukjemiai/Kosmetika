import { Module } from "@nestjs/common";
import { PrismaModule } from "./prisma/prisma.module";
import { AuthModule } from "./auth/auth.module";
import { SalonsModule } from "./salons/salons.module";
import { BeauticiansModule } from "./beauticians/beauticians.module";
import { ServicesModule } from "./services/services.module";
import { BookingsModule } from "./bookings/bookings.module";
import { InvoicesModule } from "./invoices/invoices.module";
import { AvailabilityModule } from "./availability/availability.module";

@Module({
  imports: [
    PrismaModule,
    AuthModule,
    SalonsModule,
    BeauticiansModule,
    ServicesModule,
    BookingsModule,
    InvoicesModule,
    AvailabilityModule,
  ],
})
export class AppModule {}
