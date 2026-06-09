import { ApiProperty } from '@nestjs/swagger';

export class ApplicableCriterionOptionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  criterionId: string;

  @ApiProperty()
  label: string;

  @ApiProperty({ required: false, nullable: true })
  scoreValue: number | null;

  @ApiProperty()
  sortOrder: number;
}

export class ApplicableDimensionDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty()
  name: string;

  @ApiProperty({ enum: ['corporate', 'departmental', 'leadership'] })
  type: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  weight: number;
}

export class ApplicableCriterionResponseDto {
  @ApiProperty({ format: 'uuid' })
  id: string;

  @ApiProperty({ format: 'uuid' })
  dimensionId: string;

  @ApiProperty()
  text: string;

  @ApiProperty({ required: false, nullable: true })
  description: string | null;

  @ApiProperty()
  weight: number;

  @ApiProperty({ type: ApplicableDimensionDto })
  dimension: ApplicableDimensionDto;

  @ApiProperty({ type: [ApplicableCriterionOptionDto] })
  options: ApplicableCriterionOptionDto[];
}
