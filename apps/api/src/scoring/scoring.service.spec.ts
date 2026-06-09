import { Test, TestingModule } from '@nestjs/testing';
import { ScoringService } from './scoring.service';
import { PrismaService } from '../database/prisma.service';

describe('ScoringService', () => {
  let service: ScoringService;

  const mockPrismaService = {
    cycle: {
      findUnique: jest.fn(),
    },
    evaluationAssignment: {
      findMany: jest.fn(),
    },
    weightRule: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScoringService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ScoringService>(ScoringService);
    jest.clearAllMocks();
  });

  describe('getEvaluateeResults', () => {
    const defaultEvaluateeId = 'eval-1';
    const defaultCycleId = 'cycle-1';

    it('should ignore assignments that are not completed or not submitted', async () => {
      mockPrismaService.evaluationAssignment.findMany.mockResolvedValue([]);
      mockPrismaService.weightRule.findMany.mockResolvedValue([]);

      const result = await service.getEvaluateeResults(
        defaultCycleId,
        defaultEvaluateeId,
      );

      expect(
        mockPrismaService.evaluationAssignment.findMany,
      ).toHaveBeenCalled();
      expect(result.score).toBeNull();
      expect(result.validSubmissionCount).toBe(0);
      expect(result.minimumResponseThresholdMet).toBe(false);
    });

    it('should calculate overall score properly using neutral weight fallback', async () => {
      mockPrismaService.weightRule.findMany.mockResolvedValue([]);

      // 1 assignment, 1 answer, score 4, criteria weight 2, dim weight 1.5
      mockPrismaService.evaluationAssignment.findMany.mockResolvedValue([
        {
          id: 'a1',
          relationshipType: 'same_department_peer',
          evaluator: { departmentId: 'dept1' },
          evaluatee: { departmentId: 'dept1' },
          submission: {
            answers: [
              {
                criterionId: 'c1',
                scoreValueSnapshot: 4,
                criterion: {
                  id: 'c1',
                  weight: 2,
                  dimensionId: 'd1',
                  dimension: { id: 'd1', weight: 1.5 },
                },
              },
            ],
          },
        },
      ]);

      const result = await service.getEvaluateeResults(
        defaultCycleId,
        defaultEvaluateeId,
      );

      // relationship weight fallback = 1.0
      // criteria avg = 4 / 1.0 = 4
      // dim avg = (4 * 2) / 2 = 4 (because weight sum inside dimension is criterion weight = 2)
      // overall avg = (4 * 1.5) / 1.5 = 4
      expect(result.score).toBe(4);
      expect(result.dimensions[0].score).toBe(4);
      expect(result.dimensions[0].criteria[0].score).toBe(4);
      expect(result.validSubmissionCount).toBe(1);
    });

    it('should calculate dimension and evaluatee scores honoring dimension and criteria weights', async () => {
      mockPrismaService.weightRule.findMany.mockResolvedValue([]);

      mockPrismaService.evaluationAssignment.findMany.mockResolvedValue([
        {
          id: 'a1',
          relationshipType: 'manager',
          evaluator: { departmentId: 'dept2' },
          evaluatee: { departmentId: 'dept1' },
          submission: {
            answers: [
              {
                criterionId: 'c1',
                scoreValueSnapshot: 5,
                criterion: {
                  id: 'c1',
                  weight: 2, // criteria weight
                  dimensionId: 'd1',
                  dimension: { id: 'd1', weight: 1 }, // dim weight
                },
              },
              {
                criterionId: 'c2',
                scoreValueSnapshot: 3,
                criterion: {
                  id: 'c2',
                  weight: 1, // criteria weight
                  dimensionId: 'd1',
                  dimension: { id: 'd1', weight: 1 },
                },
              },
              {
                criterionId: 'c3',
                scoreValueSnapshot: 4,
                criterion: {
                  id: 'c3',
                  weight: 1,
                  dimensionId: 'd2',
                  dimension: { id: 'd2', weight: 3 }, // heavier dimension
                },
              },
            ],
          },
        },
      ]);

      const result = await service.getEvaluateeResults(
        defaultCycleId,
        defaultEvaluateeId,
      );

      // D1 score: (5 * 2 + 3 * 1) / (2 + 1) = 13 / 3 = 4.333
      // D2 score: (4 * 1) / 1 = 4
      // Overall score: (4.333 * 1 + 4 * 3) / (1 + 3) = (4.333 + 12) / 4 = 16.333 / 4 = 4.0833

      const d1 = result.dimensions.find((d) => d.dimensionId === 'd1');
      const d2 = result.dimensions.find((d) => d.dimensionId === 'd2');

      expect(d1.score).toBeCloseTo(4.333, 3);
      expect(d2.score).toBe(4);
      expect(result.score).toBeCloseTo(4.083, 3);
    });

    it('should ignore all-null answers for valid submission count and averages', async () => {
      mockPrismaService.weightRule.findMany.mockResolvedValue([]);

      mockPrismaService.evaluationAssignment.findMany.mockResolvedValue([
        {
          id: 'a1',
          relationshipType: 'same_department_peer',
          evaluator: { departmentId: 'dept1' },
          evaluatee: { departmentId: 'dept1' },
          submission: {
            answers: [
              {
                criterionId: 'c1',
                scoreValueSnapshot: null,
                criterion: {
                  id: 'c1',
                  weight: 1,
                  dimensionId: 'd1',
                  dimension: { id: 'd1', weight: 1 },
                },
              },
            ],
          },
        },
      ]);

      const result = await service.getEvaluateeResults(
        defaultCycleId,
        defaultEvaluateeId,
      );

      expect(result.score).toBeNull();
      expect(result.validSubmissionCount).toBe(0);
      expect(result.naAnswerCount).toBe(1);
      expect(result.scoredAnswerCount).toBe(0);
    });

    it('should correctly apply same-department and cross-department relationship weights', async () => {
      mockPrismaService.weightRule.findMany.mockResolvedValue([
        {
          relationshipType: 'peer',
          sameDepartmentWeight: 2.0,
          crossDepartmentWeight: 0.5,
        },
      ]);

      mockPrismaService.evaluationAssignment.findMany.mockResolvedValue([
        {
          id: 'a1',
          relationshipType: 'peer',
          evaluator: { departmentId: 'dept1' },
          evaluatee: { departmentId: 'dept1' }, // same dept (weight 2.0)
          submission: {
            answers: [
              {
                criterionId: 'c1',
                scoreValueSnapshot: 4,
                criterion: {
                  id: 'c1',
                  weight: 1,
                  dimensionId: 'd1',
                  dimension: { id: 'd1', weight: 1 },
                },
              },
            ],
          },
        },
        {
          id: 'a2',
          relationshipType: 'peer',
          evaluator: { departmentId: 'dept2' },
          evaluatee: { departmentId: 'dept1' }, // cross dept (weight 0.5)
          submission: {
            answers: [
              {
                criterionId: 'c1',
                scoreValueSnapshot: 2,
                criterion: {
                  id: 'c1',
                  weight: 1,
                  dimensionId: 'd1',
                  dimension: { id: 'd1', weight: 1 },
                },
              },
            ],
          },
        },
      ]);

      const result = await service.getEvaluateeResults(
        defaultCycleId,
        defaultEvaluateeId,
      );

      // c1 score: (4 * 2.0 + 2 * 0.5) / (2.0 + 0.5) = (8 + 1) / 2.5 = 9 / 2.5 = 3.6
      const d1 = result.dimensions.find((d) => d.dimensionId === 'd1');
      expect(d1.criteria[0].score).toBeCloseTo(3.6);
      expect(result.score).toBeCloseTo(3.6);
    });

    it('should report threshold true for 3 or more valid scored submissions', async () => {
      mockPrismaService.weightRule.findMany.mockResolvedValue([]);

      const mockAssignment = {
        relationshipType: 'peer',
        evaluator: { departmentId: 'dept1' },
        evaluatee: { departmentId: 'dept1' },
        submission: {
          answers: [
            {
              criterionId: 'c1',
              scoreValueSnapshot: 5,
              criterion: {
                id: 'c1',
                weight: 1,
                dimensionId: 'd1',
                dimension: { id: 'd1', weight: 1 },
              },
            },
          ],
        },
      };

      mockPrismaService.evaluationAssignment.findMany.mockResolvedValue([
        { id: 'a1', ...mockAssignment },
        { id: 'a2', ...mockAssignment },
        { id: 'a3', ...mockAssignment },
      ]);

      const result = await service.getEvaluateeResults(
        defaultCycleId,
        defaultEvaluateeId,
      );

      expect(result.validSubmissionCount).toBe(3);
      expect(result.minimumResponseThresholdMet).toBe(true);
    });
  });

  describe('getCycleResults', () => {
    it('should return evaluatee results and cycle overall score', async () => {
      mockPrismaService.cycle.findUnique.mockResolvedValue({ id: 'cycle-1' });

      // First query to get distinct evaluatees
      mockPrismaService.evaluationAssignment.findMany.mockResolvedValueOnce([
        { evaluateeId: 'eval-1' },
        { evaluateeId: 'eval-2' },
      ]);

      // Sub-queries in getEvaluateeResults
      mockPrismaService.evaluationAssignment.findMany
        // call for eval-1
        .mockResolvedValueOnce([
          {
            id: 'a1',
            relationshipType: 'peer',
            evaluator: { departmentId: 'dept1' },
            evaluatee: { departmentId: 'dept1' },
            submission: {
              answers: [
                {
                  criterionId: 'c1',
                  scoreValueSnapshot: 4,
                  criterion: {
                    id: 'c1',
                    weight: 1,
                    dimensionId: 'd1',
                    dimension: { id: 'd1', weight: 1 },
                  },
                },
              ],
            },
          },
        ])
        // call for eval-2
        .mockResolvedValueOnce([
          {
            id: 'a2',
            relationshipType: 'peer',
            evaluator: { departmentId: 'dept1' },
            evaluatee: { departmentId: 'dept1' },
            submission: {
              answers: [
                {
                  criterionId: 'c1',
                  scoreValueSnapshot: 2,
                  criterion: {
                    id: 'c1',
                    weight: 1,
                    dimensionId: 'd1',
                    dimension: { id: 'd1', weight: 1 },
                  },
                },
              ],
            },
          },
        ]);

      mockPrismaService.weightRule.findMany.mockResolvedValue([]);

      const result = await service.getCycleResults('cycle-1');

      expect(result.evaluatees.length).toBe(2);
      expect(result.evaluatees[0].score).toBe(4);
      expect(result.evaluatees[1].score).toBe(2);
      expect(result.overallScore).toBe(3); // (4+2)/2 = 3
    });
  });
});
