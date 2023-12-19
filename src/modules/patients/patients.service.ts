import {
  Injectable,
  NotFoundException,
  Logger,
  InternalServerErrorException,
} from '@nestjs/common';
import { PAC } from '@prisma/client';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class PatientsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly logger: Logger,
  ) {}

  async checkBeneficiaryCode(id: string): Promise<PAC | null> {
    return this.findPatient({ PAC_MCNV: id });
  }

  async checkBeneficiaryCPF(cpf: string): Promise<PAC | null> {
    return this.findPatient({ PAC_NUMCPF: cpf });
  }

  private async findPatient(condition: object): Promise<PAC | null> {
    try {
      const patient = await this.prisma.pAC.findFirst({ where: condition });
      if (!patient) {
        this.logger.warn(
          `Paciente não encontrado com condição: ${JSON.stringify(condition)}`,
        );
        throw new NotFoundException('Paciente não encontrado');
      }
      return patient;
    } catch (error) {
      this.logger.error(
        `Erro ao buscar paciente: ${error.message}`,
        error.stack,
      );
      throw new InternalServerErrorException('Erro ao realizar a busca');
    }
  }
}
