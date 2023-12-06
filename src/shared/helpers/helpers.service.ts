import { Injectable } from '@nestjs/common';

@Injectable()
export class HelpersService {
  getAdjustedCurrentDateTime() {
    const now = new Date();
    now.setHours(now.getHours() - 3);
    return now;
  }
}
