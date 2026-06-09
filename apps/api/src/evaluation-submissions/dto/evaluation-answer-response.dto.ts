import { ApiProperty } from '@nestjs/swagger';

export class EvaluationAnswerResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  submissionId: string;

  @ApiProperty({ format: 'uuid' })
  criterionId: string;

  @ApiProperty({
    format: 'uuid',
    required: false,
    nullable: true,
    type: String,
  })
  criterionOptionId: string | null;

  @ApiProperty({ required: false, nullable: true, type: Number })
  scoreValueSnapshot: number | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
