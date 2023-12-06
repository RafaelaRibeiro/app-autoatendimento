import { Controller, Get, Param, ParseIntPipe } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';

@Controller('waiting-list')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Get(':doctor')
  async findAll(@Param('doctor', ParseIntPipe) doctor: number) {
    return this.waitingListService.findAll(doctor);
  }
}
