import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { MedicalFeesServiceDTO } from '../service-orders.dto';
import { HelpersService } from 'src/shared/helpers/helpers.service';

@Injectable()
export class MedicalFeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly helpersService: HelpersService,
    private readonly logger: Logger,
  ) {}

  private async getReceptionDepartment(receptionDepartment: string) {
    const department = await this.prisma.sTR.findUnique({
      where: { STR_COD: receptionDepartment },
      select: { STR_COD: true, STR_STR_COD: true },
    });

    return department;
  }

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

  private async getDoctor(doctorCode: number) {
    const doctor = await this.prisma.pSV.findUnique({
      where: { PSV_COD: doctorCode },
      select: {
        PSV_VINC: true,
        PSV_EMP_COD: true,
        PSV_GMR_COD: true,
      },
    });

    return doctor;
  }

  async medicalFees(data: MedicalFeesServiceDTO) {
    try {
      const doctor = await this.getDoctor(data.doctorCode);
      const receptionDepartment = await this.getReceptionDepartment(
        data.receptionDepartment,
      );
      const executingDepartment = await this.getExecutingDepartment(
        data.examType,
        data.examCode,
      );
      const honSeqResult: any = await this.prisma
        .$queryRaw`WITH RankedResults AS (
    SELECT
        hon.hon_seq,
        HON.HON_DTHR_INI,
        hon_emp_cod,
        ROW_NUMBER() OVER (ORDER BY HON.HON_DTHR_INI DESC) AS RowNum


        FROM hon
        WHERE  ( hon.hon_smk_cod is null OR hon.hon_smk_cod = ${data.examCode} )  AND  ( hon.hon_psv_tipo_solic = 'M' OR hon.hon_psv_tipo_solic = '0' ) and ( hon.hon_med =${data.doctorCode} OR hon.hon_med = 0 )  AND ( hon.hon_ctf = ${executingDepartment.SMK_CTF} OR hon.hon_ctf = ${executingDepartment.CTF.CTF_CTF_COD} OR hon.hon_ctf = '9999' ) AND ( hon.hon_str = ${executingDepartment.SMK_STR} OR hon.hon_str = ${executingDepartment.STR.STR_STR_COD} OR hon.hon_str = '999' )  AND ( hon.hon_str_solic = ${receptionDepartment.STR_COD} OR hon.hon_str_solic = ${receptionDepartment.STR_STR_COD} OR hon.hon_str_solic = '999' ) AND ( hon.hon_psv_vinc = ${doctor.PSV_VINC} OR hon.hon_psv_vinc = '0' ) AND ( hon.hon_cnv_cod = '999' OR hon.hon_cnv_cod = ${data.insurance} ) AND ( hon.hon_cnv_emp_cod = 0 OR hon.hon_cnv_emp_cod in ( SELECT b.cnv_emp_cod FROM cnv b  WHERE  ( hon.hon_smk_cod is null OR hon.hon_smk_cod = ${data.examCode} )  AND  ( hon.hon_psv_tipo_solic = 'M' OR hon.hon_psv_tipo_solic = '0' )  AND  b.cnv_cod = ${data.insurance} ) ) AND ( hon.hon_tpctf = 'S' ) AND ( hon.hon_dthr_ini <= ${this.helpersService.getAdjustedCurrentDateTime} ) AND
        ( hon.hon_status = 'S' OR hon.hon_status is null ) AND
        ( hon.hon_ctf_categ = 'E' OR hon.hon_ctf_categ is null OR hon.hon_ctf_categ = '0' ) AND ( hon.hon_emp_cod = ${doctor.PSV_EMP_COD} OR hon.hon_emp_cod is null OR hon.hon_emp_cod = 0 ) AND ( hon.hon_gmr_cod = ${doctor.PSV_GMR_COD} OR hon.hon_gmr_cod is null OR hon.hon_gmr_cod = 0 OR ( EXISTS ( SELECT 1 FROM gmr_psv  WHERE  ( hon.hon_smk_cod is null OR hon.hon_smk_cod = ${data.examCode} )  AND  ( hon.hon_psv_tipo_solic = 'M' OR hon.hon_psv_tipo_solic = '0' )  AND  gmr_psv.gmr_p_gmr_cod = hon.hon_gmr_cod AND gmr_psv.gmr_p_psv_cod =${data.doctorCode} ) ) ) AND
        ( hon.hon_ih_origem = 'A' OR hon.hon_ih_origem = 'A' ) AND 
        ( hon.hon_dia in ( '5','DU','QD','?' ) OR hon.hon_dia is NULL ) )

        SELECT hon_seq as honSeq
        FROM RankedResults
        WHERE RowNum = 1
    `;
      if (honSeqResult && honSeqResult.length > 0) {
        const honSeqValue = honSeqResult[0].honSeq;

        console.log('honSeqValue:', honSeqValue);
        return honSeqValue;
      } else {
        this.logger.warn('Nenhum resultado encontrado para honSeq');
        throw new NotFoundException('Nenhum resultado encontrado para honSeq');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao calcular taxas médicas: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException(
        'Erro interno ao calcular taxas médicas',
      );
    }
  }
}
