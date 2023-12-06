import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class WaitingListService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(doctor: number) {
    const waitingList = await this.prisma.psv_totem.findMany({
      where: {
        psv_t_psv_cod: doctor,
      },
      select: {
        psv_t_prefixo: true,
        psv_t_titulo: true,
      },
    });

    return waitingList;
  }
}
