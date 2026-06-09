import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateHierarchyLevelDto } from './dto/create-hierarchy-level.dto';
import { UpdateHierarchyLevelDto } from './dto/update-hierarchy-level.dto';

@Injectable()
export class HierarchyLevelsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.hierarchyLevel.findMany({
      orderBy: { rank: 'asc' },
    });
  }

  async findOne(id: string) {
    const hierarchyLevel = await this.prisma.hierarchyLevel.findUnique({
      where: { id },
    });

    if (!hierarchyLevel) {
      throw new NotFoundException('Hierarchy level not found.');
    }

    return hierarchyLevel;
  }

  async create(dto: CreateHierarchyLevelDto) {
    await this.ensureUniqueName(dto.name);
    await this.ensureUniqueRank(dto.rank);

    try {
      return await this.prisma.hierarchyLevel.create({ data: dto });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateHierarchyLevelDto) {
    await this.findOne(id);

    if (dto.name !== undefined) {
      await this.ensureUniqueName(dto.name, id);
    }

    if (dto.rank !== undefined) {
      await this.ensureUniqueRank(dto.rank, id);
    }

    try {
      return await this.prisma.hierarchyLevel.update({
        where: { id },
        data: dto,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const [users, roles] = await Promise.all([
      this.prisma.user.count({ where: { hierarchyLevelId: id } }),
      this.prisma.role.count({ where: { hierarchyLevelId: id } }),
    ]);

    if (users > 0 || roles > 0) {
      throw new BadRequestException(
        'Hierarchy level cannot be deleted while it has users or roles.',
      );
    }

    try {
      return await this.prisma.hierarchyLevel.delete({ where: { id } });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureUniqueName(name: string, currentId?: string) {
    const existing = await this.prisma.hierarchyLevel.findUnique({
      where: { name },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Hierarchy level name already exists.');
    }
  }

  private async ensureUniqueRank(rank: number, currentId?: string) {
    const existing = await this.prisma.hierarchyLevel.findUnique({
      where: { rank },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Hierarchy level rank already exists.');
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Hierarchy level unique constraint conflict.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Hierarchy level not found.');
      }

      throw new InternalServerErrorException('Database operation failed.');
    }

    throw error;
  }
}
