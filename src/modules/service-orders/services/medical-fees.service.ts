import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/shared/prisma/prisma.service';
import { MedicalFeesServiceDTO } from '../service-orders.dto';

@Injectable()
export class MedicalFeesService {
  constructor(private readonly prisma: PrismaService) {}
  async medicalFees(data: MedicalFeesServiceDTO) {
    const honSeqResult: any = await this.prisma
      .$queryRaw`WITH RankedResults AS (
    SELECT
        hon.hon_seq,
        HON.HON_DTHR_INI,
        hon_emp_cod,
        ROW_NUMBER() OVER (ORDER BY HON.HON_DTHR_INI DESC) AS RowNum


        FROM hon
        WHERE  ( hon.hon_smk_cod is null OR hon.hon_smk_cod = ${data.examCode} )  AND  ( hon.hon_psv_tipo_solic = 'M' OR hon.hon_psv_tipo_solic = '0' ) and ( hon.hon_med =${data.doctorCode} OR hon.hon_med = 0 )  AND ( hon.hon_ctf = ${smmStr.SMK_CTF} OR hon.hon_ctf = ${smmStr.CTF.CTF_CTF_COD} OR hon.hon_ctf = '9999' ) AND ( hon.hon_str = ${smmStr.SMK_STR} OR hon.hon_str = ${smmStr.STR.STR_STR_COD} OR hon.hon_str = '999' )  AND ( hon.hon_str_solic = ${strSolic.STR_COD} OR hon.hon_str_solic = ${strSolic.STR_STR_COD} OR hon.hon_str_solic = '999' ) AND ( hon.hon_psv_vinc = ${psvCod.PSV_VINC} OR hon.hon_psv_vinc = '0' ) AND ( hon.hon_cnv_cod = '999' OR hon.hon_cnv_cod = ${data.osmCnv} ) AND ( hon.hon_cnv_emp_cod = 0 OR hon.hon_cnv_emp_cod in ( SELECT b.cnv_emp_cod FROM cnv b  WHERE  ( hon.hon_smk_cod is null OR hon.hon_smk_cod = ${data.smmCod} )  AND  ( hon.hon_psv_tipo_solic = 'M' OR hon.hon_psv_tipo_solic = '0' )  AND  b.cnv_cod = ${data.osmCnv} ) ) AND ( hon.hon_tpctf = 'S' ) AND ( hon.hon_dthr_ini <= ${now} ) AND
        ( hon.hon_status = 'S' OR hon.hon_status is null ) AND
        ( hon.hon_ctf_categ = 'E' OR hon.hon_ctf_categ is null OR hon.hon_ctf_categ = '0' ) AND ( hon.hon_emp_cod = ${psvCod.PSV_EMP_COD} OR hon.hon_emp_cod is null OR hon.hon_emp_cod = 0 ) AND ( hon.hon_gmr_cod = ${psvCod.PSV_GMR_COD} OR hon.hon_gmr_cod is null OR hon.hon_gmr_cod = 0 OR ( EXISTS ( SELECT 1 FROM gmr_psv  WHERE  ( hon.hon_smk_cod is null OR hon.hon_smk_cod = ${data.smmCod} )  AND  ( hon.hon_psv_tipo_solic = 'M' OR hon.hon_psv_tipo_solic = '0' )  AND  gmr_psv.gmr_p_gmr_cod = hon.hon_gmr_cod AND gmr_psv.gmr_p_psv_cod =${data.smmMed} ) ) ) AND
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
      console.error('Nenhum resultado encontrado para honSeq');
      throw new Error('Nenhum resultado encontrado para honSeq');
    }
  }
}
