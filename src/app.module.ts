import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WaitingListModule } from './modules/waiting-list/waiting-list.module';
import { ApiKeyMiddleware } from './shared/middleware/api-key.middleware';
import { PrismaService } from './shared/prisma/prisma.service';
import { HelpersService } from './shared/helpers/helpers.service';
import { ServiceOrdersModule } from './modules/service-orders/service-orders.module';
import { PatientsModule } from './modules/patients/patients.module';
import { CountersModule } from './modules/counters/counters.module';
import { LoggerModule } from 'nestjs-pino';
import { PricingtableModule } from './modules/pricingtable/pricingtable.module';

@Module({
  imports: [
    WaitingListModule,
    ServiceOrdersModule,
    PatientsModule,
    CountersModule,
    LoggerModule.forRoot(),
    PricingtableModule,
  ],
  controllers: [AppController],
  providers: [AppService, PrismaService, HelpersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
