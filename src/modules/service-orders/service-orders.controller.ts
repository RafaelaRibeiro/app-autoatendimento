import { Controller } from '@nestjs/common';
import { ServiceOrdersService } from './services/service-orders.service';

@Controller('service-orders')
export class ServiceOrdersController {
  constructor(private readonly serviceOrdersService: ServiceOrdersService) {}
}
