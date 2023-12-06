import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HelpersService } from 'src/shared/helpers/helpers.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class WaitingListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpersService: HelpersService,
  ) {}

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

  async addNewPatient(
    waitingList: number,
    receptionDepartment: string,
    prefix: string,
  ) {
    try {
      const lastBipNumber = await this.getLastBipNumber(prefix);
      const newBipNumber = this.generateNewBipNumber(prefix, lastBipNumber);
      const currentDateTime = this.helpersService.getAdjustedCurrentDateTime();
      await this.prisma.fLE.create({
        data: {
          FLE_DTHR_CHEGADA: currentDateTime,
          FLE_DTHR_CHEGADA_INICIAL: currentDateTime,

          FLE_PSV_COD: waitingList,
          FLE_STR_COD: receptionDepartment,
          FLE_PAC_REG: 0,
          FLE_ORDEM: 1, //AJUSTAR
          FLE_STATUS: 'A',
          FLE_USR_LOGIN: 'IUC',
          FLE_OBS: `SENHA #${newBipNumber} (Atendimento Normal)`,
          FLE_BIP: newBipNumber,
          FLE_PSV_RESP: waitingList,
          FLE_DTHR_REG: currentDateTime,
          FLE_PROCED: 'TOT',
          fle_preferencial: 'N',
        },
      });
    } catch (error) {
      throw new HttpException(
        'Erro ao salvar novo paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLastBipNumber(prefix: string) {
    try {
      const today = new Date(); // Obtém a data atual

      today.setHours(0, 0, 0, 0); // Define a hora para 00:00:00.000

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const lastBipNumber = this.prisma.fLE.count({
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

      return lastBipNumber;
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar último número bip',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  generateNewBipNumber(prefix, lastBipNumber) {
    return `${prefix}0${lastBipNumber + 1}`;
  }
}
