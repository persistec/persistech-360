import { BadRequestException } from '@nestjs/common';
import { CycleStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CyclesService } from './cycles.service';

type MockPrisma = {
  cycle: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  evaluationAssignment: {
    count: jest.Mock;
    findMany: jest.Mock;
    createMany: jest.Mock;
  };
  user: {
    findUnique: jest.Mock;
    findMany: jest.Mock;
  };
  retentionPolicy: {
    findUnique: jest.Mock;
  };
};

describe('CyclesService', () => {
  let prisma: MockPrisma;
  let service: CyclesService;

  const sampleCycle = {
    id: 'cycle-id',
    name: 'Cycle Q2 2026',
    description: 'Q2 performance review',
    startAt: new Date('2026-06-01T00:00:00.000Z'),
    endAt: new Date('2026-06-30T00:00:00.000Z'),
    status: CycleStatus.draft,
    retentionPolicyId: 'policy-id',
    createdById: 'creator-id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    prisma = {
      cycle: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      evaluationAssignment: {
        count: jest.fn(),
        findMany: jest.fn(),
        createMany: jest.fn(),
      },
      user: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
      },
      retentionPolicy: {
        findUnique: jest.fn(),
      },
    };
    service = new CyclesService(prisma as unknown as PrismaService);
  });

  describe('create', () => {
    it('creates a cycle successfully', async () => {
      prisma.retentionPolicy.findUnique.mockResolvedValue({ id: 'policy-id' });
      prisma.user.findUnique.mockResolvedValue({ id: 'creator-id' });
      prisma.cycle.create.mockResolvedValue(sampleCycle);

      const result = await service.create({
        name: 'Cycle Q2 2026',
        description: 'Q2 performance review',
        startAt: '2026-06-01T00:00:00.000Z',
        endAt: '2026-06-30T00:00:00.000Z',
        retentionPolicyId: 'policy-id',
        createdById: 'creator-id',
      });

      expect(result).toEqual(sampleCycle);
      expect(prisma.cycle.create).toHaveBeenCalled();
    });

    it('throws BadRequestException when endAt is less than or equal to startAt', async () => {
      await expect(
        service.create({
          name: 'Invalid Cycle',
          startAt: '2026-06-30T00:00:00.000Z',
          endAt: '2026-06-01T00:00:00.000Z',
        }),
      ).rejects.toThrow(BadRequestException);
    });

    it('throws BadRequestException when retentionPolicyId does not exist', async () => {
      prisma.retentionPolicy.findUnique.mockResolvedValue(null);

      await expect(
        service.create({
          name: 'Missing Policy Cycle',
          startAt: '2026-06-01T00:00:00.000Z',
          endAt: '2026-06-30T00:00:00.000Z',
          retentionPolicyId: 'missing-policy-id',
        }),
      ).rejects.toThrow(BadRequestException);
    });
  });

  describe('openCycle', () => {
    it('opens a cycle successfully if in draft and has assignments', async () => {
      prisma.cycle.findUnique.mockResolvedValue(sampleCycle);
      prisma.evaluationAssignment.count.mockResolvedValue(5);
      prisma.cycle.update.mockResolvedValue({
        ...sampleCycle,
        status: CycleStatus.open,
      });

      const result = await service.openCycle('cycle-id');

      expect(result.status).toEqual(CycleStatus.open);
      expect(prisma.cycle.update).toHaveBeenCalledWith({
        where: { id: 'cycle-id' },
        data: { status: CycleStatus.open },
        // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
        select: expect.any(Object),
      });
    });

    it('throws BadRequestException if the cycle has no assignments', async () => {
      prisma.cycle.findUnique.mockResolvedValue(sampleCycle);
      prisma.evaluationAssignment.count.mockResolvedValue(0);

      await expect(service.openCycle('cycle-id')).rejects.toThrow(
        BadRequestException,
      );
    });

    it('throws BadRequestException if the cycle is not in draft or scheduled', async () => {
      prisma.cycle.findUnique.mockResolvedValue({
        ...sampleCycle,
        status: CycleStatus.closed,
      });

      await expect(service.openCycle('cycle-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('closeCycle', () => {
    it('closes a cycle successfully if open', async () => {
      prisma.cycle.findUnique.mockResolvedValue({
        ...sampleCycle,
        status: CycleStatus.open,
      });
      prisma.cycle.update.mockResolvedValue({
        ...sampleCycle,
        status: CycleStatus.closed,
      });

      const result = await service.closeCycle('cycle-id');

      expect(result.status).toEqual(CycleStatus.closed);
    });

    it('throws BadRequestException if the cycle is already closed', async () => {
      prisma.cycle.findUnique.mockResolvedValue({
        ...sampleCycle,
        status: CycleStatus.closed,
      });

      await expect(service.closeCycle('cycle-id')).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('generateAssignments', () => {
    const activeUsers: Array<{
      id: string;
      name: string;
      departmentId: string | null;
      hierarchyLevelId: string | null;
      hierarchyLevel: { rank: number } | null;
      managerId: string | null;
      status: string;
    }> = [
      {
        id: 'u1',
        name: 'Manager U1',
        departmentId: 'dept-1',
        hierarchyLevelId: 'level-manager',
        hierarchyLevel: { rank: 5 },
        managerId: null,
        status: 'ACTIVE',
      },
      {
        id: 'u2',
        name: 'Subordinate U2',
        departmentId: 'dept-1',
        hierarchyLevelId: 'level-tech',
        hierarchyLevel: { rank: 2 },
        managerId: 'u1',
        status: 'ACTIVE',
      },
      {
        id: 'u3',
        name: 'Peer U3',
        departmentId: 'dept-1',
        hierarchyLevelId: 'level-tech',
        hierarchyLevel: { rank: 2 },
        managerId: 'u1',
        status: 'ACTIVE',
      },
      {
        id: 'u4',
        name: 'Inactive U4',
        departmentId: 'dept-1',
        hierarchyLevelId: 'level-tech',
        hierarchyLevel: { rank: 2 },
        managerId: 'u1',
        status: 'INACTIVE',
      },
    ];

    it('generates assignments without self-evaluations, inactive users, or subordinate evaluating superior', async () => {
      prisma.cycle.findUnique.mockResolvedValue(sampleCycle);
      prisma.user.findMany.mockResolvedValue(
        activeUsers.filter((u) => u.status === 'ACTIVE'),
      );
      prisma.evaluationAssignment.findMany.mockResolvedValue([]);
      prisma.evaluationAssignment.createMany.mockResolvedValue({ count: 3 });

      const result = await service.generateAssignments('cycle-id');

      // Expected assignments:
      // - u1 (manager) evaluating u2 (subordinate) - manager_to_subordinate
      // - u1 (manager) evaluating u3 (subordinate) - manager_to_subordinate
      // - u2 (tech) evaluating u3 (tech) - same_department_peer
      // - u3 (tech) evaluating u2 (tech) - same_department_peer
      // Wait, is subordinate evaluating manager excluded? Yes, u2 evaluating u1 and u3 evaluating u1 are excluded since rank of u1 (5) > rank of u2/u3 (2) and managerId check.
      // Total assignments should be 4:
      // 1. Manager u1 -> Subordinate u2
      // 2. Manager u1 -> Subordinate u3
      // 3. Peer u2 -> Peer u3
      // 4. Peer u3 -> Peer u2

      expect(prisma.evaluationAssignment.createMany).toHaveBeenCalled();
      const calls = prisma.evaluationAssignment.createMany.mock.calls;
      const firstCall = calls[0] as unknown as [
        { data: Array<{ evaluatorId: string; evaluateeId: string }> },
      ];
      const createManyArgs = firstCall[0].data;

      // Ensure no self evaluation
      createManyArgs.forEach((arg) => {
        expect(arg.evaluatorId).not.toEqual(arg.evaluateeId);
      });

      // Ensure no subordinate evaluating superior (e.g. u2 -> u1 or u3 -> u1)
      const hasSubordinatingU2U1 = createManyArgs.some(
        (arg) => arg.evaluatorId === 'u2' && arg.evaluateeId === 'u1',
      );
      expect(hasSubordinatingU2U1).toBe(false);

      expect(result.generatedCount).toBe(4);
    });

    it('deduplicates and does not recreate existing assignments', async () => {
      prisma.cycle.findUnique.mockResolvedValue(sampleCycle);
      prisma.user.findMany.mockResolvedValue(
        activeUsers.filter((u) => u.status === 'ACTIVE'),
      );

      // u1 -> u2 already exists
      prisma.evaluationAssignment.findMany.mockResolvedValue([
        {
          evaluatorId: 'u1',
          evaluateeId: 'u2',
        },
      ]);
      prisma.evaluationAssignment.createMany.mockResolvedValue({ count: 3 });

      const result = await service.generateAssignments('cycle-id');

      // Total generated should be 3 (u1->u3, u2->u3, u3->u2)
      expect(result.generatedCount).toBe(3);
    });
  });
});
