import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { AssignmentStatus, RelationshipType } from '@prisma/client';
import {
  IsBoolean,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsUUID,
} from 'class-validator';

export class CreateAssignmentDto {
  @ApiProperty({ example: 'c0b8535a-4bdf-4eb9-813c-0466df5f1d87' })
  @IsUUID()
  @IsNotEmpty()
  cycleId: string;

  @ApiProperty({ example: '7d4bfa6c-8cd9-49cf-9d41-c11df5b9a89d' })
  @IsUUID()
  @IsNotEmpty()
  evaluatorId: string;

  @ApiProperty({ example: '2efc8fe7-0f62-4c65-97d7-d9e24b3938f4' })
  @IsUUID()
  @IsNotEmpty()
  evaluateeId: string;

  @ApiProperty({
    enum: RelationshipType,
    example: RelationshipType.same_department_peer,
  })
  @IsEnum(RelationshipType)
  relationshipType: RelationshipType;

  @ApiPropertyOptional({
    enum: AssignmentStatus,
    example: AssignmentStatus.pending,
  })
  @IsOptional()
  @IsEnum(AssignmentStatus)
  status?: AssignmentStatus;

  @ApiPropertyOptional({ example: true })
  @IsOptional()
  @IsBoolean()
  required?: boolean;
}
