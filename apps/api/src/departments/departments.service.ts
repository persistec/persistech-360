import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@Injectable()
export class DepartmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.department.findMany({
      where: { archivedAt: null },
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const department = await this.prisma.department.findUnique({
      where: { id },
    });

    if (!department || department.archivedAt) {
      throw new NotFoundException('Department not found.');
    }

    return department;
  }

  async create(dto: CreateDepartmentDto) {
    await this.ensureUniqueName(dto.name);
    await this.ensureParentExists(dto.parentDepartmentId);

    try {
      return await this.prisma.department.create({
        data: {
          name: dto.name,
          parentDepartmentId: dto.parentDepartmentId ?? null,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateDepartmentDto) {
    await this.findOne(id);

    if (dto.name !== undefined) {
      await this.ensureUniqueName(dto.name, id);
    }

    if (dto.parentDepartmentId !== undefined) {
      if (dto.parentDepartmentId === id) {
        throw new BadRequestException('Department cannot be its own parent.');
      }
      await this.ensureParentExists(dto.parentDepartmentId);
    }

    try {
      return await this.prisma.department.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string, currentUserId: string) {
    await this.findOne(id);

    const [users, roles, children] = await Promise.all([
      this.prisma.user.count({ where: { departmentId: id, archivedAt: null } }),
      this.prisma.role.count({ where: { departmentId: id, archivedAt: null } }),
      this.prisma.department.count({
        where: { parentDepartmentId: id, archivedAt: null },
      }),
    ]);

    if (users > 0 || roles > 0 || children > 0) {
      throw new BadRequestException(
        'Department cannot be deleted while it has active users, roles, or child departments.',
      );
    }

    try {
      return await this.prisma.department.update({
        where: { id },
        data: {
          archivedAt: new Date(),
          archivedBy: currentUserId,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureUniqueName(name: string, currentId?: string) {
    const existing = await this.prisma.department.findUnique({
      where: { name },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Department name already exists.');
    }
  }

  private async ensureParentExists(parentDepartmentId?: string | null) {
    if (!parentDepartmentId) {
      return;
    }

    const parent = await this.prisma.department.findUnique({
      where: { id: parentDepartmentId },
    });

    if (!parent) {
      throw new BadRequestException('Parent department does not exist.');
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Department unique constraint conflict.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Department not found.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid department relation.');
      }

      throw new InternalServerErrorException('Database operation failed.');
    }

    throw error;
  }
}
