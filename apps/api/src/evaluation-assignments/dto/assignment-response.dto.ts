import { ApiProperty } from '@nestjs/swagger';
import { AssignmentStatus, RelationshipType } from '@prisma/client';

export class AssignmentResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  cycleId: string;

  @ApiProperty()
  evaluatorId: string;

  @ApiProperty()
  evaluateeId: string;

  @ApiProperty({ enum: RelationshipType })
  relationshipType: RelationshipType;

  @ApiProperty({ enum: AssignmentStatus })
  status: AssignmentStatus;

  @ApiProperty()
  required: boolean;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
