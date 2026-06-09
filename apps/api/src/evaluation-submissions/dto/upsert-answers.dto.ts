import { ApiProperty } from '@nestjs/swagger';
import {
  IsArray,
  IsNotEmpty,
  IsOptional,
  IsUUID,
  ValidateNested,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpsertEvaluationAnswerDto {
  @ApiProperty({
    format: 'uuid',
    description: 'ID of the criterion being answered',
  })
  @IsNotEmpty()
  @IsUUID()
  criterionId: string;

  @ApiProperty({
    type: String,
    format: 'uuid',
    required: false,
    nullable: true,
    description: 'ID of the selected option, or null if N/A',
  })
  @IsOptional()
  @IsUUID()
  criterionOptionId?: string | null;
}

export class UpsertAnswersDto {
  @ApiProperty({
    type: [UpsertEvaluationAnswerDto],
    description: 'List of answers to upsert',
  })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => UpsertEvaluationAnswerDto)
  answers: UpsertEvaluationAnswerDto[];
}
