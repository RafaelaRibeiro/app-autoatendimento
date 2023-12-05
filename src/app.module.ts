import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { WaitingListModule } from './modules/waiting-list/waiting-list.module';

@Module({
  imports: [WaitingListModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
