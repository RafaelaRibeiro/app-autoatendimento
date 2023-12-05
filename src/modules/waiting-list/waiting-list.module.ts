import { Module } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';
import { WaitingListController } from './waiting-list.controller';
import { PrismaModule } from 'src/shared/prisma/prisma.module';

@Module({
  controllers: [WaitingListController],
  providers: [WaitingListService],
  imports: [PrismaModule],
})
export class WaitingListModule {}
