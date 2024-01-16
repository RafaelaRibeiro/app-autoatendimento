import { Module } from '@nestjs/common';
import { PricingtableService } from './pricingtable.service';
import { PricingtableController } from './pricingtable.controller';

@Module({
  controllers: [PricingtableController],
  providers: [PricingtableService],
})
export class PricingtableModule {}
