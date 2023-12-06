import { Module } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';
import { WaitingListController } from './waiting-list.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';
import { HelpersModule } from 'src/shared/helpers/helpers.module';

@Module({
  controllers: [WaitingListController],
  providers: [WaitingListService],
  imports: [PrismaModule, HelpersModule],
})
export class WaitingListModule {}
