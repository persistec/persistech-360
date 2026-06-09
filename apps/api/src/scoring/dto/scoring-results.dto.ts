import { ApiProperty } from '@nestjs/swagger';

export class CriterionScoreDto {
  @ApiProperty({ format: 'uuid' })
  criterionId: string;

  @ApiProperty()
  score: number | null;

  @ApiProperty()
  scoredAnswerCount: number;

  @ApiProperty()
  naAnswerCount: number;
}

export class DimensionScoreDto {
  @ApiProperty({ format: 'uuid' })
  dimensionId: string;

  @ApiProperty()
  score: number | null;

  @ApiProperty({ type: [CriterionScoreDto] })
  criteria: CriterionScoreDto[];
}

export class RelationshipTypeScoreDto {
  @ApiProperty()
  relationshipType: string;

  @ApiProperty()
  score: number | null;
}

export class EvaluateeResultsDto {
  @ApiProperty({ format: 'uuid' })
  evaluateeId: string;

  @ApiProperty()
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

  @ApiProperty({ type: [DimensionScoreDto] })
  dimensions: DimensionScoreDto[];

  @ApiProperty({ type: [RelationshipTypeScoreDto] })
  relationships: RelationshipTypeScoreDto[];
}

export class CycleResultsSummaryDto {
  @ApiProperty({ format: 'uuid' })
  cycleId: string;

  @ApiProperty()
  overallScore: number | null;

  @ApiProperty({ type: [EvaluateeResultsDto] })
  evaluatees: EvaluateeResultsDto[];
}
