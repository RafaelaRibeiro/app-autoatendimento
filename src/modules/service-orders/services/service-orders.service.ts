import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { PatientsService } from '../../patients/patients.service';
import { CreateServiceOrderDTO } from '../service-orders.dto';
import { CountersService } from '../../counters/counters.service';
import { HelpersService } from 'src/shared/helpers/helpers.service';

@Injectable()
export class ServiceOrdersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
    private readonly patientsService: PatientsService,
    private readonly counterService: CountersService,
    private readonly helpersService: HelpersService,
  ) {}

  async CreateServiceOrder(data: CreateServiceOrderDTO) {
    try {
      let patient = await this.patientsService.checkBeneficiaryCode(
        data.beneficiaryCode,
      );
      if (!patient) {
        patient = await this.patientsService.checkBeneficiaryCPF(data.cpf);
      }
      const serviceOrderNumber =
        await this.counterService.incrementServiceOrderCounter();

      const serviceOrder = await this.prisma.oSM.create({
        data: {
          OSM_SERIE: Number(this.helpersService.generateSeries()),
          OSM_PAC: patient.PAC_REG,
          OSM_NUM: serviceOrderNumber,
          OSM_DTHR: this.helpersService.getAdjustedCurrentDateTime(),
          OSM_CNV: data.insurance,
          OSM_MREQ: 999,
          OSM_PROC: 'A',
          OSM_STR: data.receptionDepartment,
          OSM_IND_URG: 'N',
          OSM_DT_RESULT: this.helpersService.getAdjustedCurrentDateTime(),
          OSM_ATEND: 'ASS',
          OSM_CID_COD: 'Z000',
          OSM_DT_SOLIC: this.helpersService.getAdjustedCurrentDateTime(),
          OSM_LEG_COD: 'WEB',
          OSM_USR_LOGIN_CAD: 'IUC',
          OSM_TIPO_ACIDENTE: 2,
          OSM_TISS_TIPO_SAIDA: '5',
          OSM_TISS_TIPO_ATENDE: '05',
          OSM_MREQ_IND_SLINE: 'S',
          FLE: {
            create: {
              FLE_DTHR_CHEGADA:
                this.helpersService.getAdjustedCurrentDateTime(),
              FLE_PSV_COD: data.waitingList || 294,
              FLE_STR_COD: data.receptionDepartment,
              FLE_PAC_REG: patient.PAC_REG,
              FLE_ORDEM: 1,
              FLE_STATUS: 'A',
              FLE_USR_LOGIN: 'IUC',
              FLE_OBS: 'AUTO ATENDIMENTO',
              FLE_PSV_RESP: data.waitingList || 294,
              FLE_DTHR_REG: this.helpersService.getAdjustedCurrentDateTime(),
              FLE_PROCED: 'TOT',
            },
          },
        },
      });

      return serviceOrder;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar paciente: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro ao criar a ordem de serviço',
      );
    }
  }
}
