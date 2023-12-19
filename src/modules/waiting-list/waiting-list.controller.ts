import {
  Body,
  Controller,
  Get,
  Param,
  ParseIntPipe,
  Post,
} from '@nestjs/common';
import { WaitingListService } from './waiting-list.service';
import { addBipToWaitingListDTO } from './waiting-list.dto';

@Controller('waiting-list')
export class WaitingListController {
  constructor(private readonly waitingListService: WaitingListService) {}

  @Get(':doctor')
  async findAll(@Param('doctor', ParseIntPipe) doctor: number) {
    return this.waitingListService.findAll(doctor);
  }

  @Post()
  async addBipToWaitingList(@Body() data: addBipToWaitingListDTO) {
    return this.waitingListService.addBipToWaitingList(data);
  }
}
