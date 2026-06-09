import { BadRequestException, ConflictException } from '@nestjs/common';
import { RelationshipType } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { EvaluationAssignmentsService } from './evaluation-assignments.service';

type MockPrisma = {
  cycle: { findUnique: jest.Mock };
  user: { findUnique: jest.Mock };
  evaluationAssignment: {
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    findMany: jest.Mock;
  };
};

describe('EvaluationAssignmentsService', () => {
  let prisma: MockPrisma;
  let service: EvaluationAssignmentsService;

  beforeEach(() => {
    prisma = {
      cycle: { findUnique: jest.fn() },
      user: { findUnique: jest.fn() },
      evaluationAssignment: {
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        findMany: jest.fn(),
      },
    };
    service = new EvaluationAssignmentsService(
      prisma as unknown as PrismaService,
    );
  });

  describe('create', () => {
    it('throws BadRequestException when evaluator and evaluatee are the same user', async () => {
      await expect(
        service.create({
          cycleId: 'cycle-id',
          evaluatorId: 'user-1',
          evaluateeId: 'user-1',
          relationshipType: RelationshipType.manual_assignment,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when evaluator user does not exist', async () => {
      prisma.cycle.findUnique.mockResolvedValue({ id: 'cycle-id' });
      prisma.user.findUnique.mockImplementation(
        (args: { where: { id: string } }) => {
          if (args.where.id === 'evaluator-id') return null; // Evaluator doesn't exist
          return { id: 'evaluatee-id', status: 'ACTIVE' };
        },
      );

      await expect(
        service.create({
          cycleId: 'cycle-id',
          evaluatorId: 'evaluator-id',
          evaluateeId: 'evaluatee-id',
          relationshipType: RelationshipType.manual_assignment,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when evaluatee user is inactive', async () => {
      prisma.cycle.findUnique.mockResolvedValue({ id: 'cycle-id' });
      prisma.user.findUnique.mockImplementation(
        (args: { where: { id: string } }) => {
          if (args.where.id === 'evaluator-id') {
            return { id: 'evaluator-id', status: 'ACTIVE' };
          }
          return { id: 'evaluatee-id', status: 'INACTIVE' }; // Inactive
        },
      );

      await expect(
        service.create({
          cycleId: 'cycle-id',
          evaluatorId: 'evaluator-id',
          evaluateeId: 'evaluatee-id',
          relationshipType: RelationshipType.manual_assignment,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when evaluator attempts to evaluate direct manager', async () => {
      prisma.cycle.findUnique.mockResolvedValue({ id: 'cycle-id' });
      prisma.user.findUnique.mockImplementation(
        (args: { where: { id: string } }) => {
          if (args.where.id === 'evaluator-id') {
            return {
              id: 'evaluator-id',
              status: 'ACTIVE',
              managerId: 'evaluatee-id',
            }; // evaluatee is manager
          }
          return { id: 'evaluatee-id', status: 'ACTIVE', managerId: null };
        },
      );

      await expect(
        service.create({
          cycleId: 'cycle-id',
          evaluatorId: 'evaluator-id',
          evaluateeId: 'evaluatee-id',
          relationshipType: RelationshipType.manual_assignment,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when evaluator attempts to evaluate a superior in hierarchy rank', async () => {
      prisma.cycle.findUnique.mockResolvedValue({ id: 'cycle-id' });
      prisma.user.findUnique.mockImplementation(
        (args: { where: { id: string } }) => {
          if (args.where.id === 'evaluator-id') {
            return {
              id: 'evaluator-id',
              status: 'ACTIVE',
              hierarchyLevel: { rank: 2 },
            };
          }
          return {
            id: 'evaluatee-id',
            status: 'ACTIVE',
            hierarchyLevel: { rank: 5 },
          }; // evaluatee has higher rank (5 > 2)
        },
      );

      await expect(
        service.create({
          cycleId: 'cycle-id',
          evaluatorId: 'evaluator-id',
          evaluateeId: 'evaluatee-id',
          relationshipType: RelationshipType.manual_assignment,
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws ConflictException when assignment already exists for the cycle', async () => {
      prisma.cycle.findUnique.mockResolvedValue({ id: 'cycle-id' });
      prisma.user.findUnique.mockImplementation(
        (args: { where: { id: string } }) => {
          if (args.where.id === 'evaluator-id') {
            return {
              id: 'evaluator-id',
              status: 'ACTIVE',
              hierarchyLevel: { rank: 3 },
            };
          }
          return {
            id: 'evaluatee-id',
            status: 'ACTIVE',
            hierarchyLevel: { rank: 3 },
          };
        },
      );
      prisma.evaluationAssignment.findFirst.mockResolvedValue({
        id: 'existing-assignment-id',
      });

      await expect(
        service.create({
          cycleId: 'cycle-id',
          evaluatorId: 'evaluator-id',
          evaluateeId: 'evaluatee-id',
          relationshipType: RelationshipType.manual_assignment,
        }),
      ).rejects.toThrow(ConflictException);
    });
  });
});
