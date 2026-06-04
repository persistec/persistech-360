import { BadRequestException, ConflictException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { RolesService } from './roles.service';

type MockPrisma = {
  role: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
  };
  department: { findUnique: jest.Mock };
  hierarchyLevel: { findUnique: jest.Mock };
  user: { count: jest.Mock };
};

describe('RolesService', () => {
  const role = {
    id: 'role-id',
    name: 'Developer',
    departmentId: null,
    hierarchyLevelId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let prisma: MockPrisma;
  let service: RolesService;

  beforeEach(() => {
    prisma = {
      role: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
      department: { findUnique: jest.fn() },
      hierarchyLevel: { findUnique: jest.fn() },
      user: { count: jest.fn() },
    };
    service = new RolesService(prisma as unknown as PrismaService);
  });

  it('creates a role when optional relations are valid', async () => {
    prisma.department.findUnique.mockResolvedValue({ id: 'department-id' });
    prisma.hierarchyLevel.findUnique.mockResolvedValue({ id: 'level-id' });
    prisma.role.create.mockResolvedValue(role);

    await expect(
      service.create({
        name: 'Developer',
        departmentId: 'department-id',
        hierarchyLevelId: 'level-id',
      }),
    ).resolves.toEqual(role);
  });

  it('rejects missing departments', async () => {
    prisma.department.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ name: 'Developer', departmentId: 'missing-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks delete when users are associated', async () => {
    prisma.role.findUnique.mockResolvedValue(role);
    prisma.user.count.mockResolvedValue(1);

    await expect(service.remove('role-id')).rejects.toBeInstanceOf(
      ConflictException,
    );
  });
});
