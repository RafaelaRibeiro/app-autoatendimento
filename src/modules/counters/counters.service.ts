import { BadRequestException, Injectable } from '@nestjs/common';
import { HelpersService } from 'src/shared/helpers/helpers.service';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class CountersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpersService: HelpersService,
  ) {}

  async incrementServiceOrderCounter(): Promise<number> {
    return await this.prisma.$transaction(async (prisma) => {
      try {
        const cntOsm = await prisma.cNT.findFirst({
          where: {
            CNT_SERIE: Number(this.helpersService.generateSeries()),
            CNT_TIPO: 'OSM',
          },
        });

        const osNum = cntOsm?.CNT_NUM ? cntOsm.CNT_NUM : 0;
        const newCounterValue = osNum + 1;

        await prisma.cNT.update({
          where: {
            CNT_TIPO_CNT_SERIE: {
              CNT_SERIE: Number(this.helpersService.generateSeries()),
              CNT_TIPO: 'OSM',
            },
          },
          data: {
            CNT_NUM: newCounterValue,
          },
        });

        return newCounterValue;
      } catch (error) {
        console.error('Erro ao incrementar e buscar contador:', error);
        throw new BadRequestException('Erro ao processar a solicitação');
      }
    });
  }

  async incrementPatientCounter(): Promise<number> {
    return await this.prisma.$transaction(async (prisma) => {
      try {
        const cntPac = await prisma.cNT.findFirst({
          where: { CNT_TIPO: 'PAC' },
        });
        const cntPacNew = cntPac.CNT_NUM + 1;
        await prisma.cNT.update({
          where: {
            CNT_TIPO_CNT_SERIE: { CNT_SERIE: 0, CNT_TIPO: 'PAC' },
          },
          data: {
            CNT_NUM: cntPacNew,
          },
        });

        return cntPacNew;
      } catch (error) {
        console.error('Erro ao incrementar e buscar contador:', error);
        throw new BadRequestException('Erro ao processar a solicitação');
      }
    });
  }
}
