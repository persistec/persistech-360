import {
  BadRequestException,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { DepartmentsService } from './departments.service';

type MockPrisma = {
  department: {
    findMany: jest.Mock;
    findUnique: jest.Mock;
    create: jest.Mock;
    update: jest.Mock;
    delete: jest.Mock;
    count: jest.Mock;
  };
  user: { count: jest.Mock };
  role: { count: jest.Mock };
};

describe('DepartmentsService', () => {
  const department = {
    id: 'department-id',
    name: 'Engineering',
    parentDepartmentId: null,
    archivedAt: null,
    archivedBy: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  let prisma: MockPrisma;
  let service: DepartmentsService;

  beforeEach(() => {
    prisma = {
      department: {
        findMany: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
        count: jest.fn(),
      },
      user: { count: jest.fn() },
      role: { count: jest.fn() },
    };
    service = new DepartmentsService(prisma as unknown as PrismaService);
  });

  it('creates a department when name is unique and parent is valid', async () => {
    prisma.department.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce({ id: 'parent-id' });
    prisma.department.create.mockResolvedValue(department);

    await expect(
      service.create({ name: 'Engineering', parentDepartmentId: 'parent-id' }),
    ).resolves.toEqual(department);
  });

  it('rejects duplicate department names', async () => {
    prisma.department.findUnique.mockResolvedValue(department);

    await expect(
      service.create({ name: 'Engineering' }),
    ).rejects.toBeInstanceOf(ConflictException);
  });

  it('rejects missing parent departments', async () => {
    prisma.department.findUnique
      .mockResolvedValueOnce(null)
      .mockResolvedValueOnce(null);

    await expect(
      service.create({ name: 'Engineering', parentDepartmentId: 'missing-id' }),
    ).rejects.toBeInstanceOf(BadRequestException);
  });

  it('throws not found when a department does not exist', async () => {
    prisma.department.findUnique.mockResolvedValue(null);

    await expect(service.findOne('missing-id')).rejects.toBeInstanceOf(
      NotFoundException,
    );
  });

  it('blocks delete when child departments exist', async () => {
    prisma.department.findUnique.mockResolvedValue(department);
    prisma.user.count.mockResolvedValue(0);
    prisma.role.count.mockResolvedValue(0);
    prisma.department.count.mockResolvedValue(1);

    await expect(
      service.remove('department-id', 'admin-id'),
    ).rejects.toBeInstanceOf(BadRequestException);
  });
});
