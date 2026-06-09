import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleStatus } from '@prisma/client';
import {
  IsDateString,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateCycleDto {
  @ApiProperty({ example: 'Ciclo de Avaliação Q2 2026' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: 'Avaliação de desempenho semestral',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  description?: string | null;

  @ApiProperty({ example: '2026-06-01T00:00:00.000Z' })
  @IsDateString()
  startAt: string;

  @ApiProperty({ example: '2026-06-30T23:59:59.999Z' })
  @IsDateString()
  endAt: string;

  @ApiPropertyOptional({ enum: CycleStatus, example: CycleStatus.draft })
  @IsOptional()
  @IsEnum(CycleStatus)
  status?: CycleStatus;

  @ApiPropertyOptional({
    example: 'c0b8535a-4bdf-4eb9-813c-0466df5f1d87',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  retentionPolicyId?: string | null;

  @ApiPropertyOptional({
    example: '7d4bfa6c-8cd9-49cf-9d41-c11df5b9a89d',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  createdById?: string | null;
}
