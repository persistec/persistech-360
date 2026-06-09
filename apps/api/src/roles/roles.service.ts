import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateRoleDto } from './dto/create-role.dto';
import { UpdateRoleDto } from './dto/update-role.dto';

@Injectable()
export class RolesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.role.findMany({
      orderBy: { name: 'asc' },
    });
  }

  async findOne(id: string) {
    const role = await this.prisma.role.findUnique({ where: { id } });

    if (!role) {
      throw new NotFoundException('Role not found.');
    }

    return role;
  }

  async create(dto: CreateRoleDto) {
    await this.ensureRelationsExist(dto);

    try {
      return await this.prisma.role.create({
        data: {
          name: dto.name,
          departmentId: dto.departmentId ?? null,
          hierarchyLevelId: dto.hierarchyLevelId ?? null,
        },
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateRoleDto) {
    await this.findOne(id);
    await this.ensureRelationsExist(dto);

    try {
      return await this.prisma.role.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const users = await this.prisma.user.count({ where: { roleId: id } });

    if (users > 0) {
      throw new BadRequestException(
        'Role cannot be deleted while it has users.',
      );
    }

    try {
      return await this.prisma.role.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureRelationsExist(
    dto: Pick<CreateRoleDto, 'departmentId' | 'hierarchyLevelId'>,
  ) {
    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });

      if (!department) {
        throw new BadRequestException('Department does not exist.');
      }
    }

    if (dto.hierarchyLevelId) {
      const hierarchyLevel = await this.prisma.hierarchyLevel.findUnique({
        where: { id: dto.hierarchyLevelId },
      });

      if (!hierarchyLevel) {
        throw new BadRequestException('Hierarchy level does not exist.');
      }
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        throw new NotFoundException('Role not found.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid role relation.');
      }

      throw new InternalServerErrorException('Database operation failed.');
    }

    throw error;
  }
}
