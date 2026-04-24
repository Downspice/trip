import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './prisma/prisma.module';
import { StudentsModule } from './students/students.module';
import { HousesModule } from './houses/houses.module';
import { SchoolsModule } from './schools/schools.module';
import { RoutesModule } from './routes/routes.module';
import { BookingsModule } from './bookings/bookings.module';
import { PaymentsModule } from './payments/payments.module';
import { FinancesModule } from './admin/finances.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    StudentsModule,
    HousesModule,
    SchoolsModule,
    RoutesModule,
    BookingsModule,
    PaymentsModule,
    FinancesModule,
    AuthModule,
  ],
})
export class AppModule {}

