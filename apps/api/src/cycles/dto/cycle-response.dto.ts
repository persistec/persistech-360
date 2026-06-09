import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { CycleStatus } from '@prisma/client';

export class CycleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  description: string | null;

  @ApiProperty()
  startAt: Date;

  @ApiProperty()
  endAt: Date;

  @ApiProperty({ enum: CycleStatus })
  status: CycleStatus;

  @ApiPropertyOptional({ nullable: true, type: String })
  retentionPolicyId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  createdById: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
