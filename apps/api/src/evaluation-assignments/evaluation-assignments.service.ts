import {
  BadRequestException,
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';

const publicAssignmentSelect = {
  id: true,
  cycleId: true,
  evaluatorId: true,
  evaluateeId: true,
  relationshipType: true,
  status: true,
  required: true,
  createdAt: true,
  updatedAt: true,
} satisfies Prisma.EvaluationAssignmentSelect;

@Injectable()
export class EvaluationAssignmentsService {
  constructor(private readonly prisma: PrismaService) {}

  findAll() {
    return this.prisma.evaluationAssignment.findMany({
      orderBy: { createdAt: 'desc' },
      select: publicAssignmentSelect,
    });
  }

  async findOne(id: string) {
    const assignment = await this.prisma.evaluationAssignment.findUnique({
      where: { id },
      select: publicAssignmentSelect,
    });

    if (!assignment) {
      throw new NotFoundException('Evaluation assignment not found.');
    }

    return assignment;
  }

  async create(dto: CreateAssignmentDto) {
    await this.validateAssignment(
      dto.cycleId,
      dto.evaluatorId,
      dto.evaluateeId,
    );

    try {
      return await this.prisma.evaluationAssignment.create({
        data: {
          cycleId: dto.cycleId,
          evaluatorId: dto.evaluatorId,
          evaluateeId: dto.evaluateeId,
          relationshipType: dto.relationshipType,
          status: dto.status ?? 'pending',
          required: dto.required ?? true,
        },
        select: publicAssignmentSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async update(id: string, dto: UpdateAssignmentDto) {
    const existing = await this.findOne(id);

    const cycleId = dto.cycleId !== undefined ? dto.cycleId : existing.cycleId;
    const evaluatorId =
      dto.evaluatorId !== undefined ? dto.evaluatorId : existing.evaluatorId;
    const evaluateeId =
      dto.evaluateeId !== undefined ? dto.evaluateeId : existing.evaluateeId;

    if (
      dto.cycleId !== undefined ||
      dto.evaluatorId !== undefined ||
      dto.evaluateeId !== undefined
    ) {
      await this.validateAssignment(cycleId, evaluatorId, evaluateeId, id);
    }

    try {
      return await this.prisma.evaluationAssignment.update({
        where: { id },
        data: {
          cycleId: dto.cycleId,
          evaluatorId: dto.evaluatorId,
          evaluateeId: dto.evaluateeId,
          relationshipType: dto.relationshipType,
          status: dto.status,
          required: dto.required,
        },
        select: publicAssignmentSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  async remove(id: string) {
    await this.findOne(id);

    try {
      return await this.prisma.evaluationAssignment.delete({
        where: { id },
        select: publicAssignmentSelect,
      });
    } catch (error) {
      this.handlePrismaError(error);
    }
  }

  private async validateAssignment(
    cycleId: string,
    evaluatorId: string,
    evaluateeId: string,
    currentId?: string,
  ) {
    if (evaluatorId === evaluateeId) {
      throw new BadRequestException(
        'Evaluator and evaluatee must be different users.',
      );
    }

    // 1. Check if cycle exists
    const cycle = await this.prisma.cycle.findUnique({
      where: { id: cycleId },
    });
    if (!cycle) {
      throw new BadRequestException('Cycle does not exist.');
    }

    // 2. Fetch evaluator and evaluatee
    const [evaluator, evaluatee] = await Promise.all([
      this.prisma.user.findUnique({
        where: { id: evaluatorId },
        include: { hierarchyLevel: true },
      }),
      this.prisma.user.findUnique({
        where: { id: evaluateeId },
        include: { hierarchyLevel: true },
      }),
    ]);

    if (!evaluator) {
      throw new BadRequestException('Evaluator user does not exist.');
    }
    if (!evaluatee) {
      throw new BadRequestException('Evaluatee user does not exist.');
    }

    // 3. Ensure both are active
    if (evaluator.status !== 'ACTIVE') {
      throw new BadRequestException('Evaluator must be an active user.');
    }
    if (evaluatee.status !== 'ACTIVE') {
      throw new BadRequestException('Evaluatee must be an active user.');
    }

    // 4. Ensure evaluator is not evaluating a superior hierárquico
    if (evaluator.managerId === evaluateeId) {
      throw new BadRequestException(
        'Subordinate cannot evaluate direct manager.',
      );
    }

    if (evaluator.hierarchyLevel && evaluatee.hierarchyLevel) {
      if (evaluatee.hierarchyLevel.rank > evaluator.hierarchyLevel.rank) {
        throw new BadRequestException(
          'Evaluator cannot evaluate a superior in hierarchy.',
        );
      }
    }

    // 5. Ensure uniqueness
    const existing = await this.prisma.evaluationAssignment.findFirst({
      where: {
        cycleId,
        evaluatorId,
        evaluateeId,
      },
    });

    if (existing && existing.id !== currentId) {
      throw new ConflictException(
        'An evaluation assignment already exists for this cycle, evaluator, and evaluatee.',
      );
    }
  }

  private handlePrismaError(error: unknown): never {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        throw new ConflictException(
          'Evaluation assignment unique constraint conflict.',
        );
      }
      if (error.code === 'P2025') {
        throw new NotFoundException('Evaluation assignment not found.');
      }
      if (error.code === 'P2003') {
        throw new BadRequestException(
          'Invalid evaluation assignment relation.',
        );
      }
      throw new InternalServerErrorException('Database operation failed.');
    }
    throw error;
  }
}
