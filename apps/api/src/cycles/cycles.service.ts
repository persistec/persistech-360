import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import {
  CycleStatus,
  RelationshipType,
  AssignmentStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';

const publicCycleSelect = {
  id: true,
  name: true,
  description: true,
  startAt: true,
  endAt: true,
  status: true,
  retentionPolicyId: true,
  createdById: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.CycleSelect;

@Injectable()
export class CyclesService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.cycle.findMany({
      orderBy: { createdAt: 'desc' },
      select: publicCycleSelect,
    });
  }

  async findOne(id: string) {
    const cycle = await this.prisma.cycle.findUnique({
      where: { id },
      select: publicCycleSelect,
    });

    if (!cycle) {
      throw new NotFoundException('Cycle not found.');
    }

    return cycle;
  }

  async create(dto: CreateCycleDto) {
    const start = new Date(dto.startAt);
    const end = new Date(dto.endAt);

    if (end <= start) {
      throw new BadRequestException(
        'endAt must be strictly greater than startAt.',
      );
    }

    if (dto.retentionPolicyId) {
      await this.ensureRetentionPolicyExists(dto.retentionPolicyId);
    }

    if (dto.createdById) {
      await this.ensureUserExists(dto.createdById);
    }

    try {
      return await this.prisma.cycle.create({
        data: {
          name: dto.name,
          description: dto.description ?? null,
          startAt: start,
          endAt: end,
          status: dto.status ?? CycleStatus.draft,
          retentionPolicyId: dto.retentionPolicyId ?? null,
          createdById: dto.createdById ?? null,
        },
        select: publicCycleSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateCycleDto) {
    const existing = await this.findOne(id);

    const startAtStr =
      dto.startAt !== undefined ? dto.startAt : existing.startAt.toISOString();
    const endAtStr =
      dto.endAt !== undefined ? dto.endAt : existing.endAt.toISOString();

    const start = new Date(startAtStr);
    const end = new Date(endAtStr);

    if (end <= start) {
      throw new BadRequestException(
        'endAt must be strictly greater than startAt.',
      );
    }

    if (dto.retentionPolicyId) {
      await this.ensureRetentionPolicyExists(dto.retentionPolicyId);
    }

    if (dto.createdById) {
      await this.ensureUserExists(dto.createdById);
    }

    try {
      return await this.prisma.cycle.update({
        where: { id },
        data: {
          name: dto.name,
          description: dto.description,
          startAt: dto.startAt !== undefined ? start : undefined,
          endAt: dto.endAt !== undefined ? end : undefined,
          status: dto.status,
          retentionPolicyId: dto.retentionPolicyId,
          createdById: dto.createdById,
        },
        select: publicCycleSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    const cycle = await this.findOne(id);

    const assignmentsCount = await this.prisma.evaluationAssignment.count({
      where: { cycleId: id },
    });

    if (cycle.status !== CycleStatus.draft && assignmentsCount > 0) {
      throw new BadRequestException(
        'Cannot delete cycle with assignments unless it is in draft status.',
      );
    }

    try {
      return await this.prisma.cycle.delete({
        where: { id },
        select: publicCycleSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async openCycle(id: string) {
    const cycle = await this.findOne(id);

    if (
      cycle.status !== CycleStatus.draft &&
      cycle.status !== CycleStatus.scheduled
    ) {
      throw new BadRequestException(
        `Cannot open cycle in ${cycle.status} status. Only draft or scheduled cycles can be opened.`,
      );
    }

    const assignmentsCount = await this.prisma.evaluationAssignment.count({
      where: { cycleId: id },
    });

    if (assignmentsCount === 0) {
      throw new BadRequestException('Cannot open a cycle without assignments.');
    }

    try {
      return await this.prisma.cycle.update({
        where: { id },
        data: { status: CycleStatus.open },
        select: publicCycleSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async closeCycle(id: string) {
    const cycle = await this.findOne(id);

    if (
      cycle.status !== CycleStatus.open &&
      cycle.status !== CycleStatus.closing_soon
    ) {
      throw new BadRequestException(
        `Cannot close cycle in ${cycle.status} status. Only open or closing_soon cycles can be closed.`,
      );
    }

    try {
      return await this.prisma.cycle.update({
        where: { id },
        data: { status: CycleStatus.closed },
        select: publicCycleSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async generateAssignments(id: string) {
    const cycle = await this.findOne(id);

    if (
      cycle.status === CycleStatus.closed ||
      cycle.status === CycleStatus.results_published ||
      cycle.status === CycleStatus.archived
    ) {
      throw new BadRequestException(
        'Cannot generate assignments for closed, published, or archived cycles.',
      );
    }

    // Fetch active users with their hierarchy level, department, and manager info
    const activeUsers = await this.prisma.user.findMany({
      where: { status: 'ACTIVE' },
      include: {
        hierarchyLevel: true,
      },
    });

    // Fetch existing assignments for this cycle to prevent duplicates
    const existingAssignments = await this.prisma.evaluationAssignment.findMany(
      {
        where: { cycleId: id },
        select: {
          evaluatorId: true,
          evaluateeId: true,
        },
      },
    );

    const existingPairs = new Set(
      existingAssignments.map((a) => `${a.evaluatorId}_${a.evaluateeId}`),
    );

    const generatedAssignments: Prisma.EvaluationAssignmentCreateManyInput[] =
      [];

    // Helper to check if evaluatee is superior to evaluator
    const isSuperior = (
      evaluator: (typeof activeUsers)[0],
      evaluatee: (typeof activeUsers)[0],
    ) => {
      // Direct manager check
      if (evaluator.managerId === evaluatee.id) {
        return true;
      }
      // Hierarchy level rank check
      if (evaluator.hierarchyLevel && evaluatee.hierarchyLevel) {
        if (evaluatee.hierarchyLevel.rank > evaluator.hierarchyLevel.rank) {
          return true;
        }
      }
      return false;
    };

    for (const u1 of activeUsers) {
      for (const u2 of activeUsers) {
        if (u1.id === u2.id) {
          continue; // Self evaluation check
        }

        // Subordinate evaluating superior check
        if (isSuperior(u1, u2)) {
          continue;
        }

        let relationshipType: RelationshipType | null = null;

        // 1. Manager to subordinate
        if (u2.managerId === u1.id) {
          relationshipType = RelationshipType.manager_to_subordinate;
        }
        // 2. Same department peer
        else if (
          u1.departmentId &&
          u1.departmentId === u2.departmentId &&
          u1.hierarchyLevelId &&
          u1.hierarchyLevelId === u2.hierarchyLevelId
        ) {
          relationshipType = RelationshipType.same_department_peer;
        }

        if (relationshipType) {
          const pairKey = `${u1.id}_${u2.id}`;
          if (!existingPairs.has(pairKey)) {
            generatedAssignments.push({
              cycleId: id,
              evaluatorId: u1.id,
              evaluateeId: u2.id,
              relationshipType,
              status: AssignmentStatus.pending,
              required: true,
            });
            // Add to in-memory set to prevent duplicate generation in the same run
            existingPairs.add(pairKey);
          }
        }
      }
    }

    if (generatedAssignments.length > 0) {
      await this.prisma.evaluationAssignment.createMany({
        data: generatedAssignments,
      });
    }

    return {
      generatedCount: generatedAssignments.length,
    };
  }

  async findAssignments(cycleId: string) {
    await this.findOne(cycleId);
    return this.prisma.evaluationAssignment.findMany({
      where: { cycleId },
      orderBy: { createdAt: 'desc' },
    });
  }

  private async ensureRetentionPolicyExists(id: string) {
    const policy = await this.prisma.retentionPolicy.findUnique({
      where: { id },
    });
    if (!policy) {
      throw new BadRequestException('Retention policy does not exist.');
    }
  }

  private async ensureUserExists(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
    });
    if (!user) {
      throw new BadRequestException('User does not exist.');
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException('Cycle unique constraint conflict.');
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Cycle not found.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException('Invalid cycle relation.');
      }
      throw new InternalServerErrorException('Database operation failed.');
    }
    throw error;
  }
}
