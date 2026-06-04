import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

const publicUserSelect = {
  id: true,
  workspaceEmail: true,
  name: true,
  departmentId: true,
  roleId: true,
  hierarchyLevelId: true,
  managerId: true,
  status: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.UserSelect;

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.user.findMany({
      orderBy: { name: 'asc' },
      select: publicUserSelect,
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: publicUserSelect,
    });

    if (!user) {
      throw new NotFoundException('User not found.');
    }

    return user;
  }

  async create(dto: CreateUserDto) {
    await this.ensureUniqueWorkspaceEmail(dto.workspaceEmail);
    await this.ensureUniqueGoogleSub(dto.googleSub);
    await this.ensureRelationsExist(dto);

    try {
      return await this.prisma.user.create({
        data: {
          workspaceEmail: dto.workspaceEmail,
          name: dto.name,
          googleSub: dto.googleSub ?? null,
          departmentId: dto.departmentId ?? null,
          roleId: dto.roleId ?? null,
          hierarchyLevelId: dto.hierarchyLevelId ?? null,
          managerId: dto.managerId ?? null,
          status: dto.status,
        },
        select: publicUserSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateUserDto) {
    await this.findOne(id);

    if (dto.workspaceEmail !== undefined) {
      await this.ensureUniqueWorkspaceEmail(dto.workspaceEmail, id);
    }

    if (dto.googleSub !== undefined) {
      await this.ensureUniqueGoogleSub(dto.googleSub, id);
    }

    if (dto.managerId !== undefined && dto.managerId === id) {
      throw new BadRequestException('User cannot be their own manager.');
    }

    await this.ensureRelationsExist(dto);

    try {
      return await this.prisma.user.update({
        where: { id },
        data: dto,
        select: publicUserSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    const subordinates = await this.prisma.user.count({
      where: { managerId: id },
    });

    if (subordinates > 0) {
      throw new ConflictException(
        'User cannot be deleted while assigned as manager of other users.',
      );
    }

    try {
      return await this.prisma.user.delete({
        where: { id },
        select: publicUserSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async ensureUniqueWorkspaceEmail(
    workspaceEmail: string,
    currentId?: string,
  ) {
    const existing = await this.prisma.user.findUnique({
      where: { workspaceEmail },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Workspace email already exists.');
    }
  }

  private async ensureUniqueGoogleSub(
    googleSub?: string | null,
    currentId?: string,
  ) {
    if (!googleSub) {
      return;
    }

    const existing = await this.prisma.user.findFirst({
      where: { googleSub },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException('Google subject already exists.');
    }
  }

  private async ensureRelationsExist(
    dto: Pick<
      CreateUserDto,
      'departmentId' | 'roleId' | 'hierarchyLevelId' | 'managerId'
    >,
  ) {
    if (dto.departmentId) {
      const department = await this.prisma.department.findUnique({
        where: { id: dto.departmentId },
      });

      if (!department) {
        throw new BadRequestException('Department does not exist.');
      }
    }

    if (dto.roleId) {
      const role = await this.prisma.role.findUnique({
        where: { id: dto.roleId },
      });

      if (!role) {
        throw new BadRequestException('Role does not exist.');
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

    if (dto.managerId) {
      const manager = await this.prisma.user.findUnique({
        where: { id: dto.managerId },
      });

      if (!manager) {
        throw new BadRequestException('Manager does not exist.');
      }
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('User unique constraint conflict.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('User not found.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid user relation.');
      }
    }

    throw error;
  }
}
