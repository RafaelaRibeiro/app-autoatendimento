import { Controller } from '@nestjs/common';
import { PricingtableService } from './pricingtable.service';

@Controller('pricingtable')
export class PricingtableController {
  constructor(private readonly pricingtableService: PricingtableService) {}
}
