import { Injectable } from '@nestjs/common';
import { ScoringService } from '../scoring/scoring.service';
import {
  AdminResultViewDto,
  EmployeeResultViewDto,
} from './dto/results-visibility.dto';

@Injectable()
export class ResultsVisibilityService {
  constructor(private readonly scoringService: ScoringService) {}

  async getAdminResultView(
    cycleId: string,
    evaluateeId: string,
  ): Promise<AdminResultViewDto> {
    const rawResults = await this.scoringService.getEvaluateeResults(
      cycleId,
      evaluateeId,
    );

    // Admin view returns the full scoring detailed projection, but excludes raw IDs
    // that are not part of the current ScoringService output.
    // It's a direct map of the scoring output.
    return {
      evaluateeId: rawResults.evaluateeId,
      score: rawResults.score,
      validSubmissionCount: rawResults.validSubmissionCount,
      minimumResponseThreshold: rawResults.minimumResponseThreshold,
      minimumResponseThresholdMet: rawResults.minimumResponseThresholdMet,
      scoredAnswerCount: rawResults.scoredAnswerCount,
      naAnswerCount: rawResults.naAnswerCount,
      dimensions: rawResults.dimensions.map((d) => ({
        dimensionId: d.dimensionId,
        score: d.score,
        criteria: d.criteria.map((c) => ({
          criterionId: c.criterionId,
          score: c.score,
          scoredAnswerCount: c.scoredAnswerCount,
          naAnswerCount: c.naAnswerCount,
        })),
      })),
      relationships: rawResults.relationships.map((r) => ({
        relationshipType: r.relationshipType,
        score: r.score,
      })),
    };
  }

  async getEmployeeResultView(
    cycleId: string,
    evaluateeId: string,
  ): Promise<EmployeeResultViewDto> {
    const rawResults = await this.scoringService.getEvaluateeResults(
      cycleId,
      evaluateeId,
    );

    if (!rawResults.minimumResponseThresholdMet) {
      return {
        status: 'insufficient_responses',
        score: null,
        validSubmissionCount: rawResults.validSubmissionCount,
        minimumResponseThreshold: rawResults.minimumResponseThreshold,
        minimumResponseThresholdMet: rawResults.minimumResponseThresholdMet,
        dimensions: [], // Empty array when threshold not met
      };
    }

    return {
      status: 'published',
      score: rawResults.score,
      validSubmissionCount: rawResults.validSubmissionCount,
      minimumResponseThreshold: rawResults.minimumResponseThreshold,
      minimumResponseThresholdMet: rawResults.minimumResponseThresholdMet,
      dimensions: rawResults.dimensions.map((d) => ({
        dimensionId: d.dimensionId,
        score: d.score,
        criteria: d.criteria.map((c) => ({
          criterionId: c.criterionId,
          score: c.score, // Anonymized criterion score
        })),
      })),
    };
  }
}
