import { ApiProperty } from '@nestjs/swagger';

export class SubmissionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  assignmentId: string;

  @ApiProperty({ required: false, nullable: true, type: String })
  finalComment: string | null;

  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    format: 'date-time',
  })
  submittedAt: Date | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
