import { MiddlewareConsumer, Module, NestModule } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WaitingListModule } from './modules/waiting-list/waiting-list.module';
import { ApiKeyMiddleware } from './shared/middleware/api-key.middleware';
import { PrismaService } from './shared/prisma/prisma.service';
import { HelpersService } from './shared/helpers/helpers.service';

@Module({
  imports: [WaitingListModule],
  controllers: [AppController],
  providers: [AppService, PrismaService, HelpersService],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(ApiKeyMiddleware).forRoutes('*');
  }
}
