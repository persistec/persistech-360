import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class UpdateSubmissionDto {
  @ApiProperty({
    required: false,
    nullable: true,
    type: String,
    description: 'Final comment for the evaluation',
  })
  @IsOptional()
  @IsString()
  finalComment?: string;
}
