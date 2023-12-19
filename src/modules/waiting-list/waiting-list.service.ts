import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { HelpersService } from 'src/shared/helpers/helpers.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { addBipToWaitingListDTO } from './waiting-list.dto';

@Injectable()
export class WaitingListService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpersService: HelpersService,
  ) {}

  private PROCESS = 'TOT';
  private USR_LOGIN = 'IUC';
  private LIST_STATUS = 'A';
  private REGISTER_PATIENT = 0;

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

  async addBipToWaitingList(data: addBipToWaitingListDTO) {
    try {
      const lastBipNumber = await this.getLastBipNumber(
        data.prefix,
        data.waitingList,
      );
      const newBipNumber = this.generateNewBipNumber(
        data.prefix,
        lastBipNumber,
      );
      const currentDateTime = this.helpersService.getAdjustedCurrentDateTime();

      console.log(data);
      console.log(currentDateTime);
      console.log(newBipNumber);
      const list = await this.prisma.fLE.create({
        data: {
          FLE_DTHR_CHEGADA: currentDateTime,
          FLE_DTHR_CHEGADA_INICIAL: currentDateTime,

          FLE_PSV_COD: data.waitingList,
          FLE_STR_COD: data.receptionDepartment,
          FLE_PAC_REG: this.REGISTER_PATIENT,
          FLE_ORDEM: 1, //AJUSTAR
          FLE_STATUS: this.LIST_STATUS,
          FLE_USR_LOGIN: this.USR_LOGIN,
          FLE_OBS: `SENHA #${newBipNumber} (Atendimento Normal)`,
          FLE_BIP: newBipNumber,
          FLE_PSV_RESP: data.waitingList,
          FLE_DTHR_REG: currentDateTime,
          FLE_PROCED: this.PROCESS,
          fle_preferencial: 'N',
        },

        select: {
          FLE_DTHR_CHEGADA: true,
          FLE_BIP: true,
        },
      });

      console.log(list);

      return { message: 'Senha incluída com sucesso' };
    } catch (error) {
      console.error('Erro ao salvar novo paciente:', error);
      throw new HttpException(
        'Erro ao salvar novo paciente',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  async getLastBipNumber(prefix: string, waitingList: number) {
    try {
      const today = new Date();

      today.setHours(0, 0, 0, 0);

      const tomorrow = new Date(today);
      tomorrow.setDate(today.getDate() + 1);

      const lastBipNumber = await this.prisma.fLE.count({
        where: {
          FLE_BIP: { startsWith: prefix },
          FLE_PROCED: this.PROCESS,
          FLE_PSV_COD: waitingList,
          FLE_DTHR_CHEGADA: {
            gte: today,
            lte: tomorrow,
          },
        },
      });

      console.log(lastBipNumber);

      return lastBipNumber;
    } catch (error) {
      throw new HttpException(
        'Erro ao buscar último número bip',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  generateNewBipNumber(prefix, lastBipNumber) {
    const newBipNumber = lastBipNumber + 1;
    const paddedBipNumber = String(newBipNumber).padStart(3, '0');
    return `${prefix}${paddedBipNumber}`;
  }
}
