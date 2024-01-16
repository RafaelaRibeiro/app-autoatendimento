import { Injectable } from '@nestjs/common';
import { Logger } from 'nestjs-pino';
import { HelpersService } from 'src/shared/helpers/helpers.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { CreateServiceOrderItemsDTO } from '../service-orders.dto';
import { HolidaysService } from './holidays.service';
import { addBusinessDays } from 'date-fns';

@Injectable()
export class CreateItemsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpersService: HelpersService,
    private readonly logger: Logger,
    private readonly holidaysService: HolidaysService,
  ) {}
  private async getExecutingDepartment(smmTpcod: string, smmCod: string) {
    const department = await this.prisma.sMK.findFirst({
      where: { SMK_TIPO: smmTpcod, SMK_COD: smmCod },
      select: {
        SMK_STR: true,
        SMK_CTF: true,
        SMK_ELD: true,
        CTF: {
          select: {
            CTF_CTF_COD: true,
          },
        },
        STR: {
          select: {
            STR_STR_COD: true,
          },
        },
      },
    });

    return department;
  }

  private async priceTable(smmTab: string, smmTpcod: string, smmCod: string) {
    const priceTable = await this.prisma.pRE.findFirst({
      where: {
        PRE_TAB_COD: smmTab,
        PRE_SMK_TIPO: smmTpcod,
        PRE_SMK_COD: smmCod,
      },
      select: {
        PRE_VLR_P1: true,
      },
    });

    return priceTable ? Number(priceTable.PRE_VLR_P1) : 0;
  }

  async createServiceOrderItems(data: CreateServiceOrderItemsDTO) {
    let resultDate = this.helpersService.getAdjustedCurrentDateTime();
    const exams = await this.getExecutingDepartment(
      data.examType,
      data.examCode,
    );
    const holidays = (await this.holidaysService.findAll()) as any[];

    const smkEldDays: any = exams?.SMK_ELD || 0;

    for (let i = 0; i < smkEldDays; i++) {
      let nextBusinessDay = addBusinessDays(resultDate, 1);
      console.log(nextBusinessDay);
      // Verifica se o próximo dia útil calculado é feriado
      while (true) {
        const isHoliday = holidays.some(
          (h) =>
            nextBusinessDay >= h.CAL_DTHR1 && nextBusinessDay <= h.CAL_DTHR2,
        );

        if (!isHoliday) {
          break;
        }
        nextBusinessDay = addBusinessDays(nextBusinessDay, 1);
      }

      resultDate = nextBusinessDay;
    }

    const smmDtResult = resultDate;
  }
}
