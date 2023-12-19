import { Controller } from '@nestjs/common';
import { CountersService } from './counters.service';

@Controller('counters')
export class CountersController {
  constructor(private readonly countersService: CountersService) {}
}
