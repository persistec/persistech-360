import { Test, TestingModule } from '@nestjs/testing';
import { ApplicabilityEngineService } from './applicability-engine.service';
import { PrismaService } from '../database/prisma.service';

describe('ApplicabilityEngineService', () => {
  let service: ApplicabilityEngineService;

  const mockPrismaService = {
    evaluationAssignment: {
      findUnique: jest.fn(),
    },
    criterion: {
      findMany: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ApplicabilityEngineService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<ApplicabilityEngineService>(
      ApplicabilityEngineService,
    );
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('getApplicableCriteria', () => {
    const mockEvaluator = {
      id: 'evaluator1',
      departmentId: 'dept1',
      hierarchyLevel: { rank: 3 }, // E.g., Senior
      role: { name: 'Senior Dev' },
    };

    const mockEvaluatee = {
      id: 'evaluatee1',
      departmentId: 'dept1',
      hierarchyLevel: { rank: 2 }, // E.g., Junior
      role: { name: 'Junior Dev' },
      _count: { subordinates: 0 },
    };

    const mockAssignment = {
      id: 'a1',
      evaluatorId: mockEvaluator.id,
      evaluateeId: mockEvaluatee.id,
      relationshipType: 'same_department_peer',
      evaluator: mockEvaluator,
      evaluatee: mockEvaluatee,
    };

    beforeEach(() => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue(
        mockAssignment,
      );
    });

    it('should return corporate criteria by default', async () => {
      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'corporate', applicabilityRules: [] },
          applicabilityRules: [],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('c1');
    });

    it('should return departmental criteria for same department', async () => {
      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'departmental', applicabilityRules: [] },
          applicabilityRules: [],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(1);
    });

    it('should block departmental criteria for cross department without rules', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        evaluator: { ...mockEvaluator, departmentId: 'dept2' },
      });

      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'departmental', applicabilityRules: [] },
          applicabilityRules: [],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(0);
    });

    it('should block leadership criteria if evaluatee has no subordinates', async () => {
      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'leadership', applicabilityRules: [] },
          applicabilityRules: [],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(0);
    });

    it('should return leadership criteria if evaluatee has subordinates', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        evaluatee: { ...mockEvaluatee, _count: { subordinates: 2 } },
      });

      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'leadership', applicabilityRules: [] },
          applicabilityRules: [],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(1);
    });

    it('should block if blockedIfEvaluateeAboveEvaluator is true and evaluatee is above evaluator', async () => {
      // rank 1 (evaluatee) > rank 5 (evaluator) => block. Wait, evaluatee.rank (1) < evaluator.rank (5) ? No, rank is > means higher in hierarchy according to seed.ts where 6 is director, 1 is intern.
      // If evaluatee is director (6) and evaluator is intern (1), evaluatee is above evaluator.
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        evaluator: { ...mockEvaluator, hierarchyLevel: { rank: 1 } },
        evaluatee: { ...mockEvaluatee, hierarchyLevel: { rank: 6 } },
      });

      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'corporate', applicabilityRules: [] },
          applicabilityRules: [{ blockedIfEvaluateeAboveEvaluator: true }],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(0);
    });

    it('should allow if blockedIfEvaluateeAboveEvaluator is true and evaluatee is NOT above evaluator', async () => {
      // evaluatee rank 1 (intern), evaluator rank 6 (director)
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        evaluator: { ...mockEvaluator, hierarchyLevel: { rank: 6 } },
        evaluatee: { ...mockEvaluatee, hierarchyLevel: { rank: 1 } },
      });

      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'corporate', applicabilityRules: [] },
          applicabilityRules: [{ blockedIfEvaluateeAboveEvaluator: true }],
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(1);
    });

    it('should apply min/max rank rules', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        evaluator: { ...mockEvaluator, hierarchyLevel: { rank: 4 } },
      });

      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'corporate', applicabilityRules: [] },
          applicabilityRules: [{ minHierarchyRank: 3, maxHierarchyRank: 5 }],
        },
        {
          id: 'c2',
          dimension: { type: 'corporate', applicabilityRules: [] },
          applicabilityRules: [{ minHierarchyRank: 5 }], // Should block (4 < 5)
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(1);
      expect(result[0].id).toBe('c1');
    });

    it('should fall back if hierarchy level is missing', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        ...mockAssignment,
        evaluator: { ...mockEvaluator, hierarchyLevel: null },
      });

      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          dimension: { type: 'corporate', applicabilityRules: [] },
          applicabilityRules: [{ blockedIfEvaluateeAboveEvaluator: true }], // Should skip blocking if missing
        },
      ]);

      const result = await service.getApplicableCriteria('a1');
      expect(result.length).toBe(1);
    });
  });
});
