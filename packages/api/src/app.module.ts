import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import {
  KeycloakConnectModule,
  AuthGuard,
  RoleGuard,
} from 'nest-keycloak-connect';
import { PrismaModule } from './prisma/prisma.module';
import { SalonsModule } from './salons/salons.module';
import { BeauticiansModule } from './beauticians/beauticians.module';
import { ServicesModule } from './services/services.module';
import { BookingsModule } from './bookings/bookings.module';
import { CustomersModule } from './customers/customers.module';
import { BillingModule } from './billing/billing.module';

@Module({
  imports: [
    KeycloakConnectModule.register({
      authServerUrl: process.env.KEYCLOAK_URL || 'http://localhost:8080',
      realm: process.env.KEYCLOAK_REALM || 'kosmetika',
      clientId: process.env.KEYCLOAK_CLIENT_ID || 'kosmetika-api',
      secret: process.env.KEYCLOAK_CLIENT_SECRET || '',
    }),
    PrismaModule,
    SalonsModule,
    BeauticiansModule,
    ServicesModule,
    BookingsModule,
    CustomersModule,
    BillingModule,
  ],
  providers: [
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RoleGuard },
  ],
})
export class AppModule {}
