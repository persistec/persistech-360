/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
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
    archivedAt: null,
    archivedBy: null,
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

  it('rejects duplicate Google subjects', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.user.findFirst.mockResolvedValue({ ...user, id: 'other-user-id' });

    await expect(
      service.create({
        workspaceEmail: 'ana.silva@example.com',
        name: 'Ana Silva',
        googleSub: 'google-sub',
      }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects missing departments', async () => {
    prisma.user.findUnique.mockResolvedValue(null);
    prisma.department.findUnique.mockResolvedValue(null);

    await expect(
      service.create({
        workspaceEmail: 'ana.silva@example.com',
        name: 'Ana Silva',
        departmentId: 'missing-id',
      }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when a user does not exist', async () => {
    prisma.user.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('rejects self manager updates', async () => {
    prisma.user.findUnique.mockResolvedValue(user);

    await expect(
      service.update('user-id', { managerId: 'user-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('blocks delete when the user manages other users', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.count.mockResolvedValue(1);

    await expect(service.remove('user-id', 'admin-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('archives a user and changes status to REMOVED instead of hard deleting', async () => {
    prisma.user.findUnique.mockResolvedValue(user);
    prisma.user.count.mockResolvedValue(0);
    prisma.user.update.mockResolvedValue({
      ...user,
      status: UserStatus.REMOVED,
      archivedAt: new Date(),
      archivedBy: 'admin-id',
    });

    await service.remove('user-id', 'admin-id');

    expect(prisma.user.update).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: 'user-id' },
        data: expect.objectContaining({
          status: UserStatus.REMOVED,
          archivedBy: 'admin-id',
          archivedAt: expect.any(Date),
        }),
      }),
    );

    expect(prisma.user.delete).not.toHaveBeenCalled();
  });

  it('findAll filters out archived users', async () => {
    prisma.user.findMany.mockResolvedValue([user]);
    await service.findAll();
    expect(prisma.user.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { archivedAt: null },
      }),
    );
  });

  it('throws not found when findOne is called on an archived user', async () => {
    prisma.user.findUnique.mockResolvedValue({
      ...user,
      archivedAt: new Date(),
    });
    await expect(service.findOne('user-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });
});
