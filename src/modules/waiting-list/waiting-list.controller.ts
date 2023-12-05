import { Controller, Get } from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';

@Controller('waiting-list')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Get()
  async findAll() {
    return this.waitingListService.findAll();
  }
}
