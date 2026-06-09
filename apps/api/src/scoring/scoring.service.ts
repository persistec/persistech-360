import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  CycleResultsSummaryDto,
  EvaluateeResultsDto,
  DimensionScoreDto,
  CriterionScoreDto,
  RelationshipTypeScoreDto,
} from './dto/scoring-results.dto';

const MINIMUM_RESPONSE_THRESHOLD = 3;

@Injectable()
export class ScoringService {
  constructor(private readonly prisma: PrismaService) {}

  async getCycleResults(cycleId: string): Promise<CycleResultsSummaryDto> {
    const cycle = await this.prisma.cycle.findUnique({
      where: { id: cycleId },
    });

    if (!cycle) {
      throw new NotFoundException(`Cycle ${cycleId} not found`);
    }

    // Get all completed assignments with submitted evaluations for this cycle
    const assignments = await this.prisma.evaluationAssignment.findMany({
      where: {
        cycleId,
        status: 'completed',
        submission: {
          submittedAt: { not: null },
        },
      },
      select: {
        evaluateeId: true,
      },
      distinct: ['evaluateeId'],
    });

    const evaluateeIds = assignments.map((a) => a.evaluateeId);

    const evaluatees: EvaluateeResultsDto[] = [];
    let cycleScoreSum = 0;
    let cycleScoreCount = 0;

    for (const evaluateeId of evaluateeIds) {
      const results = await this.getEvaluateeResults(cycleId, evaluateeId);
      evaluatees.push(results);

      if (results.score !== null) {
        cycleScoreSum += results.score;
        cycleScoreCount += 1;
      }
    }

    const overallScore =
      cycleScoreCount > 0 ? cycleScoreSum / cycleScoreCount : null;

    return {
      cycleId,
      overallScore,
      evaluatees,
    };
  }

  async getEvaluateeResults(
    cycleId: string,
    evaluateeId: string,
  ): Promise<EvaluateeResultsDto> {
    // 1. Fetch completed assignments for this evaluatee in this cycle
    const assignments = await this.prisma.evaluationAssignment.findMany({
      where: {
        cycleId,
        evaluateeId,
        status: 'completed',
        submission: {
          submittedAt: { not: null },
        },
      },
      include: {
        evaluator: true,
        evaluatee: true,
        submission: {
          include: {
            answers: {
              include: {
                criterion: {
                  include: {
                    dimension: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    // 2. Fetch all weight rules
    const weightRules = await this.prisma.weightRule.findMany();

    let validSubmissionCount = 0;
    let totalScoredAnswerCount = 0;
    let totalNaAnswerCount = 0;

    // Grouping structures
    const criteriaData: Record<
      string,
      {
        sum: number;
        weightSum: number;
        scoredCount: number;
        naCount: number;
        criterion: {
          id: string;
          weight: number;
          dimensionId: string;
          dimension: { weight: number };
        };
      }
    > = {};

    const relData: Record<
      string,
      { sum: number; weightSum: number; scoredCount: number }
    > = {};

    for (const assignment of assignments) {
      let hasScoredAnswer = false;

      // Determine Relationship Weight
      const rule = weightRules.find(
        (r) => r.relationshipType === assignment.relationshipType,
      );
      let relWeight = 1.0;
      if (rule) {
        const isSameDept =
          assignment.evaluator.departmentId &&
          assignment.evaluator.departmentId ===
            assignment.evaluatee.departmentId;
        relWeight = isSameDept
          ? rule.sameDepartmentWeight
          : rule.crossDepartmentWeight;
      }

      if (!relData[assignment.relationshipType]) {
        relData[assignment.relationshipType] = {
          sum: 0,
          weightSum: 0,
          scoredCount: 0,
        };
      }

      if (assignment.submission?.answers) {
        for (const answer of assignment.submission.answers) {
          const criterionId = answer.criterionId;
          if (!criteriaData[criterionId]) {
            criteriaData[criterionId] = {
              sum: 0,
              weightSum: 0,
              scoredCount: 0,
              naCount: 0,
              criterion: answer.criterion,
            };
          }

          if (answer.scoreValueSnapshot === null) {
            criteriaData[criterionId].naCount += 1;
            totalNaAnswerCount += 1;
          } else {
            criteriaData[criterionId].sum +=
              answer.scoreValueSnapshot * relWeight;
            criteriaData[criterionId].weightSum += relWeight;
            criteriaData[criterionId].scoredCount += 1;
            hasScoredAnswer = true;
            totalScoredAnswerCount += 1;

            relData[assignment.relationshipType].sum +=
              answer.scoreValueSnapshot * relWeight;
            relData[assignment.relationshipType].weightSum += relWeight;
            relData[assignment.relationshipType].scoredCount += 1;
          }
        }
      }

      if (hasScoredAnswer) {
        validSubmissionCount += 1;
      }
    }

    const criteriaScores = Object.values(criteriaData).map((data) => {
      return {
        criterionId: data.criterion.id,
        dimensionId: data.criterion.dimensionId,
        score: data.weightSum > 0 ? data.sum / data.weightSum : null,
        scoredAnswerCount: data.scoredCount,
        naAnswerCount: data.naCount,
        weight: data.criterion.weight,
        dimensionWeight: data.criterion.dimension.weight,
      };
    });

    const dims: Record<
      string,
      { sum: number; weightSum: number; criteriaResults: CriterionScoreDto[] }
    > = {};

    for (const c of criteriaScores) {
      if (!dims[c.dimensionId]) {
        dims[c.dimensionId] = { sum: 0, weightSum: 0, criteriaResults: [] };
      }

      dims[c.dimensionId].criteriaResults.push({
        criterionId: c.criterionId,
        score: c.score,
        scoredAnswerCount: c.scoredAnswerCount,
        naAnswerCount: c.naAnswerCount,
      });

      if (c.score !== null) {
        dims[c.dimensionId].sum += c.score * c.weight;
        dims[c.dimensionId].weightSum += c.weight;
      }
    }

    const dimensionScores = Object.keys(dims).map((dimensionId) => {
      const data = dims[dimensionId];
      return {
        dimensionId,
        score: data.weightSum > 0 ? data.sum / data.weightSum : null,
        criteria: data.criteriaResults,
        dimensionWeight:
          criteriaScores.find((c) => c.dimensionId === dimensionId)
            ?.dimensionWeight || 1.0,
      };
    });

    let overallSum = 0;
    let overallWeightSum = 0;

    for (const d of dimensionScores) {
      if (d.score !== null) {
        overallSum += d.score * d.dimensionWeight;
        overallWeightSum += d.dimensionWeight;
      }
    }

    const overallScore =
      overallWeightSum > 0 ? overallSum / overallWeightSum : null;

    const dimensionsDto: DimensionScoreDto[] = dimensionScores.map((d) => ({
      dimensionId: d.dimensionId,
      score: d.score,
      criteria: d.criteria,
    }));

    const relationshipsDto: RelationshipTypeScoreDto[] = Object.keys(
      relData,
    ).map((rel) => {
      const data = relData[rel];
      return {
        relationshipType: rel,
        score: data.weightSum > 0 ? data.sum / data.weightSum : null,
      };
    });

    return {
      evaluateeId,
      score: overallScore,
      validSubmissionCount,
      minimumResponseThreshold: MINIMUM_RESPONSE_THRESHOLD,
      minimumResponseThresholdMet:
        validSubmissionCount >= MINIMUM_RESPONSE_THRESHOLD,
      scoredAnswerCount: totalScoredAnswerCount,
      naAnswerCount: totalNaAnswerCount,
      dimensions: dimensionsDto,
      relationships: relationshipsDto,
    };
  }
}
