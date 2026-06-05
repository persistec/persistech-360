import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { HierarchyLevelsService } from './hierarchy-levels.service';

type MockPrisma = {
  hierarchyLevel: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  user: { count: jest.Mock };
  role: { count: jest.Mock };
};

describe('HierarchyLevelsService', () => {
  const hierarchyLevel = {
    id: 'level-id',
    name: 'Manager',
    rank: 5,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let prisma: MockPrisma;
  let service: HierarchyLevelsService;

  beforeEach(() => {
    prisma = {
      hierarchyLevel: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      user: { count: jest.fn() },
      role: { count: jest.fn() },
    };
    service = new HierarchyLevelsService(prisma as unknown as PrismaService);
  });

  it('creates a hierarchy level when name and rank are unique', async () => {
    prisma.hierarchyLevel.findUnique.mockResolvedValue(null);
    prisma.hierarchyLevel.create.mockResolvedValue(hierarchyLevel);

    await expect(service.create({ name: 'Manager', rank: 5 })).resolves.toEqual(
      hierarchyLevel,
    );
  });

  it('rejects duplicate ranks', async () => {
    prisma.hierarchyLevel.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(hierarchyLevel);

    await expect(
      service.create({ name: 'Manager', rank: 5 }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('throws not found when a hierarchy level does not exist', async () => {
    prisma.hierarchyLevel.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('blocks delete when users are associated', async () => {
    prisma.hierarchyLevel.findUnique.mockResolvedValue(hierarchyLevel);
    prisma.user.count.mockResolvedValue(1);
    prisma.role.count.mockResolvedValue(0);

    await expect(service.remove('level-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });
});
