import {
  Injectable,
  NestMiddleware,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { PrismaService } from 'src/shared/prisma/prisma.service';

@Injectable()
export class ApiKeyMiddleware implements NestMiddleware {
  constructor(private readonly prisma: PrismaService) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const apiKey = req.headers['api-key'];

    if (!apiKey) {
      throw new UnauthorizedException('API Key header is missing');
    }

    const validApiKey = await this.getValidApiKey();

    if (!validApiKey) {
      throw new NotFoundException('Valid API Key not found');
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Provided API Key is invalid');
    }

    next();
  }

  private async getValidApiKey(): Promise<string | null> {
    const apiKeyRecord = await this.prisma.gCC_TOKEN.findUnique({
      where: { GCC_T_GCC_COD: '5', GCC_T_STATUS: 'A' },
      select: { gcc_t_token: true },
    });

    return apiKeyRecord?.gcc_t_token || null;
  }
}
