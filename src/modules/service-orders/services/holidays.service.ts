import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class HolidaysService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll() {
    const year = new Date().getFullYear();

    const holydays = await this.prisma.$queryRaw`
     select CAL_DTHR1 , CAL_DTHR2  from CAL c where CAL_STR_COD = '999' AND YEAR (CAL_DTHR1) = ${year}
    `;

    return holydays;
  }
}
