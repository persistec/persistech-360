/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { BadRequestException, NotFoundException } from '@nestjs/common';
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
    archivedAt: null,
    archivedBy: null,
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

  it('rejects missing hierarchy levels', async () => {
    prisma.hierarchyLevel.findUnique.mockResolvedValue(null);

    await expect(
      service.create({ name: 'Developer', hierarchyLevelId: 'missing-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when a role does not exist', async () => {
    prisma.role.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('blocks delete when users are associated', async () => {
    prisma.role.findUnique.mockResolvedValue(role);
    prisma.user.count.mockResolvedValue(1);

    await expect(service.remove('role-id', 'admin-id')).rejects.toBeInstanceOf(
      BadRequestException,
    );
  });

  it('archives a role instead of hard deleting it', async () => {
    prisma.role.findUnique.mockResolvedValue(role);
    prisma.user.count.mockResolvedValue(0);
    prisma.role.update.mockResolvedValue({
      ...role,
      archivedAt: new Date(),
      archivedBy: 'admin-id',
    });

    await service.remove('role-id', 'admin-id');

    expect(prisma.role.update).toHaveBeenCalledWith({
      where: { id: 'role-id' },
      data: expect.objectContaining({
        archivedBy: 'admin-id',
        archivedAt: expect.any(Date),
      }),
    });

    expect(prisma.role.delete).not.toHaveBeenCalled();
  });

  it('findAll filters out archived roles', async () => {
    prisma.role.findMany.mockResolvedValue([role]);
    await service.findAll();
    expect(prisma.role.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { archivedAt: null },
      }),
    );
  });
});
