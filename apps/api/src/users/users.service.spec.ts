import { BadRequestException, ConflictException } from '@nestjs/common';
import { UserStatus } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { UsersService } from './users.service';

type MockPrisma = {
  user: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    findFirst: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
  department: { findUnique: jest.Mock };
  role: { findUnique: jest.Mock };
  hierarchyLevel: { findUnique: jest.Mock };
};

describe('UsersService', () => {
  const user = {
    id: 'user-id',
    workspaceEmail: 'ana.silva@example.com',
    name: 'Ana Silva',
    departmentId: null,
    roleId: null,
    hierarchyLevelId: null,
    managerId: null,
    status: UserStatus.ACTIVE,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let prisma: MockPrisma;
  let service: UsersService;

  beforeEach(() => {
    prisma = {
      user: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      department: { findUnique: jest.fn() },
      role: { findUnique: jest.fn() },
      hierarchyLevel: { findUnique: jest.fn() },
    };
    service = new UsersService(prisma as unknown as PrismaService);
  });

  it('creates a user without exposing googleSub in the result', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue(null);
    prisma.user.create.mockResolvedValue(user);

    await expect(
      service.create({
        workspaceEmail: 'ana.silva@example.com',
        name: 'Ana Silva',
        googleSub: 'google-sub',
      }),
    ).resolves.toEqual(user);

    const createMock = prisma.user.create as jest.MockedFunction<
      (args: { select: Record<string, boolean> }) => unknown
    >;
    const createArgs = createMock.mock.calls[0]?.[0];

    expect(createArgs?.select).not.toHaveProperty('googleSub');
  });

  it('rejects duplicate workspace emails', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.create({
        workspaceEmail: 'ana.silva@example.com',
        name: 'Ana Silva',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects self manager updates', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.update('user-id', { managerId: 'user-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
