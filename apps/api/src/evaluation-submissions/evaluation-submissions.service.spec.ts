import { Test, TestingModule } from '@nestjs/testing';
import { EvaluationSubmissionsService } from './evaluation-submissions.service';
import { PrismaService } from '../database/prisma.service';
import { BadRequestException, ConflictException } from '@nestjs/common';

describe('EvaluationSubmissionsService', () => {
  let service: EvaluationSubmissionsService;

  const mockPrismaService = {
    evaluationAssignment: {
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    evaluationSubmission: {
      create: jest.fn(),
      findUnique: jest.fn(),
      update: jest.fn(),
    },
    evaluationAnswer: {
      upsert: jest.fn(),
      findMany: jest.fn(),
    },
    criterion: {
      findMany: jest.fn(),
    },
    $transaction: jest.fn(async <T>(ops: Promise<T>[] | Promise<T>) => {
      if (Array.isArray(ops)) {
        return Promise.all(ops);
      }
      return ops;
    }),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        EvaluationSubmissionsService,
        { provide: PrismaService, useValue: mockPrismaService },
      ],
    }).compile();

    service = module.get<EvaluationSubmissionsService>(
      EvaluationSubmissionsService,
    );
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a submission for a valid pending assignment', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'pending',
        cycle: { status: 'open' },
      });
      mockPrismaService.evaluationSubmission.create.mockResolvedValue({
        id: 's1',
        assignmentId: 'a1',
      });

      const result = await service.create('a1', {});
      expect(result).toEqual({ id: 's1', assignmentId: 'a1' });
    });

    it('should block creation for completed assignment', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'completed',
        cycle: { status: 'open' },
      });

      await expect(service.create('a1', {})).rejects.toThrow(ConflictException);
    });

    it('should block creation when cycle is not open or closing_soon', async () => {
      mockPrismaService.evaluationAssignment.findUnique.mockResolvedValue({
        id: 'a1',
        status: 'pending',
        cycle: { status: 'draft' },
      });

      await expect(service.create('a1', {})).rejects.toThrow(ConflictException);
    });
  });

  describe('upsertAnswers', () => {
    const validSubmission = {
      id: 's1',
      submittedAt: null,
      assignment: { status: 'pending', cycle: { status: 'open' } },
    };

    it('should upsert valid answers', async () => {
      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue(
        validSubmission,
      );
      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          active: true,
          dimension: { active: true },
          options: [{ id: 'o1', scoreValue: 5 }],
        },
      ]);
      mockPrismaService.evaluationAnswer.findMany.mockResolvedValue([
        { id: 'ans1' },
      ]);

      const result = await service.upsertAnswers('s1', {
        answers: [{ criterionId: 'c1', criterionOptionId: 'o1' }],
      });

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(result).toEqual([{ id: 'ans1' }]);
    });

    it('should reject duplicate criterion in payload', async () => {
      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue(
        validSubmission,
      );

      await expect(
        service.upsertAnswers('s1', {
          answers: [
            { criterionId: 'c1', criterionOptionId: 'o1' },
            { criterionId: 'c1', criterionOptionId: 'o2' },
          ],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject inactive criterion', async () => {
      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue(
        validSubmission,
      );
      mockPrismaService.criterion.findMany.mockResolvedValue([
        { id: 'c1', active: false, dimension: { active: true }, options: [] },
      ]);

      await expect(
        service.upsertAnswers('s1', {
          answers: [{ criterionId: 'c1', criterionOptionId: null }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should reject criterion option from another criterion', async () => {
      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue(
        validSubmission,
      );
      mockPrismaService.criterion.findMany.mockResolvedValue([
        {
          id: 'c1',
          active: true,
          dimension: { active: true },
          options: [{ id: 'o1', scoreValue: 5 }],
        },
      ]);

      await expect(
        service.upsertAnswers('s1', {
          answers: [{ criterionId: 'c1', criterionOptionId: 'o_different' }],
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('should prevent updates after submit', async () => {
      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue({
        ...validSubmission,
        submittedAt: new Date(),
      });

      await expect(
        service.upsertAnswers('s1', {
          answers: [{ criterionId: 'c1', criterionOptionId: 'o1' }],
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('submit', () => {
    it('should submit successfully and update assignment to completed', async () => {
      const date = new Date();
      jest.useFakeTimers().setSystemTime(date);

      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue({
        id: 's1',
        submittedAt: null,
        assignmentId: 'a1',
        assignment: { status: 'pending', cycle: { status: 'open' } },
        answers: [{ id: 'ans1' }],
      });
      mockPrismaService.evaluationSubmission.update.mockResolvedValue({
        id: 's1',
        submittedAt: date,
      });

      await service.submit('s1');

      expect(mockPrismaService.$transaction).toHaveBeenCalled();
      expect(
        mockPrismaService.evaluationSubmission.update,
      ).toHaveBeenCalledWith({
        where: { id: 's1' },
        data: { submittedAt: date },
      });
      expect(
        mockPrismaService.evaluationAssignment.update,
      ).toHaveBeenCalledWith({
        where: { id: 'a1' },
        data: { status: 'completed' },
      });

      jest.useRealTimers();
    });

    it('should prevent submit if no answers', async () => {
      mockPrismaService.evaluationSubmission.findUnique.mockResolvedValue({
        id: 's1',
        submittedAt: null,
        assignment: { status: 'pending', cycle: { status: 'open' } },
        answers: [],
      });

      await expect(service.submit('s1')).rejects.toThrow(BadRequestException);
    });
  });
});
