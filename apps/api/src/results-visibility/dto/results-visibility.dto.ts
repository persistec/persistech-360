import { ApiProperty } from '@nestjs/swagger';

// Admin View DTOs

export class AdminCriterionScoreDto {
  @ApiProperty({ format: 'uuid' })
  criterionId: string;

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;

  @ApiProperty()
  scoredAnswerCount: number;

  @ApiProperty()
  naAnswerCount: number;
}

export class AdminDimensionScoreDto {
  @ApiProperty({ format: 'uuid' })
  dimensionId: string;

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;

  @ApiProperty({ type: [AdminCriterionScoreDto] })
  criteria: AdminCriterionScoreDto[];
}

export class AdminRelationshipTypeScoreDto {
  @ApiProperty()
  relationshipType: string;

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;
}

export class AdminResultViewDto {
  @ApiProperty({ format: 'uuid' })
  evaluateeId: string;

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;

  @ApiProperty()
  validSubmissionCount: number;

  @ApiProperty()
  minimumResponseThreshold: number;

  @ApiProperty()
  minimumResponseThresholdMet: boolean;

  @ApiProperty()
  scoredAnswerCount: number;

  @ApiProperty()
  naAnswerCount: number;

  @ApiProperty({ type: [AdminDimensionScoreDto] })
  dimensions: AdminDimensionScoreDto[];

  @ApiProperty({ type: [AdminRelationshipTypeScoreDto] })
  relationships: AdminRelationshipTypeScoreDto[];
}

// Employee View DTOs

export class EmployeeCriterionScoreDto {
  @ApiProperty({ format: 'uuid' })
  criterionId: string;

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;
}

export class EmployeeDimensionScoreDto {
  @ApiProperty({ format: 'uuid' })
  dimensionId: string;

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;

  @ApiProperty({ type: [EmployeeCriterionScoreDto] })
  criteria: EmployeeCriterionScoreDto[];
}

export class EmployeeResultViewDto {
  @ApiProperty({ enum: ['published', 'insufficient_responses'] })
  status: 'published' | 'insufficient_responses';

  @ApiProperty({ type: Number, nullable: true })
  score: number | null;

  @ApiProperty()
  validSubmissionCount: number;

  @ApiProperty()
  minimumResponseThreshold: number;

  @ApiProperty()
  minimumResponseThresholdMet: boolean;

  @ApiProperty({ type: [EmployeeDimensionScoreDto] })
  dimensions: EmployeeDimensionScoreDto[];
}
