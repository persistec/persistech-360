import { Controller, Get, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { PrismaService } from '../database/prisma.service';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(private readonly prisma: PrismaService) {}

  @Get()
  @ApiOperation({ summary: 'Check API and Database health' })
  @ApiResponse({ status: 200, description: 'API and database are healthy' })
  @ApiResponse({ status: 500, description: 'API or database is unhealthy' })
  async check() {
    try {
      await this.prisma.$queryRaw`SELECT 1`;
      return {
        status: 'UP',
        timestamp: new Date().toISOString(),
        database: 'UP',
      };
    } catch (error) {
      throw new HttpException(
        {
          status: 'DOWN',
          timestamp: new Date().toISOString(),
          database: 'DOWN',
          error: error instanceof Error ? error.message : String(error),
        },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }
}
