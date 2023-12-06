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

  async includePatient(waitingList: number, receptionDepartment: string) {
    try {
      const now = new Date();
      now.setHours(now.getHours() - 3);
      await this.prisma.fLE.create({
        data: {
          FLE_DTHR_CHEGADA: now,
          FLE_PSV_COD: waitingList,
          FLE_STR_COD: receptionDepartment,
          FLE_PAC_REG: 0,
          FLE_ORDEM: 1,
          FLE_STATUS: 'A',
          FLE_USR_LOGIN: 'IUC',
          FLE_OBS: 'AUTO ATENDIMENTO',
          FLE_PSV_RESP: waitingList,
          FLE_DTHR_REG: now,
          FLE_PROCED: 'TOT',
        },
      });
    } catch (error) {}
  }

  async findLastBip(prefix: string) {
    const today = new Date(); // Obtém a data atual

    today.setHours(0, 0, 0, 0); // Define a hora para 00:00:00.000

    const tomorrow = new Date(today);
    tomorrow.setDate(today.getDate() + 1);

    const lastBip = this.prisma.fLE.count({
      where: {
        FLE_BIP: { startsWith: prefix },
        FLE_PROCED: 'TOT',
        FLE_PSV_COD: 295,
        FLE_DTHR_CHEGADA: {
          gte: today,
          lte: tomorrow,
        },
      },
    });

    return lastBip;
  }
}
