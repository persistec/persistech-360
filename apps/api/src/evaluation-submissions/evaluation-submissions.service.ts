import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { UpsertAnswersDto } from './dto/upsert-answers.dto';
import { Prisma } from '@prisma/client';

import { ApplicabilityEngineService } from '../applicability-engine/applicability-engine.service';

@Injectable()
export class EvaluationSubmissionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly applicabilityEngine: ApplicabilityEngineService,
  ) {}

  async create(assignmentId: string) {
    const assignment = await this.prisma.evaluationAssignment.findUnique({
      where: { id: assignmentId },
      include: { cycle: true },
    });

    if (!assignment) {
      throw new NotFoundException(
        `Assignment with ID ${assignmentId} not found`,
      );
    }

    if (assignment.status !== 'pending') {
      throw new ConflictException(
        `Assignment must be in 'pending' status. Current status: ${assignment.status}`,
      );
    }

    if (
      assignment.cycle.status !== 'open' &&
      assignment.cycle.status !== 'closing_soon'
    ) {
      throw new ConflictException(
        `Cycle must be 'open' or 'closing_soon'. Current status: ${assignment.cycle.status}`,
      );
    }

    // Attempt to create. Will fail with unique constraint if it already exists.
    try {
      return await this.prisma.evaluationSubmission.create({
        data: {
          assignmentId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        throw new ConflictException(
          `Submission for assignment ${assignmentId} already exists`,
        );
      }
      throw error;
    }
  }

  async findAll() {
    return this.prisma.evaluationSubmission.findMany();
  }

  async findOne(id: string) {
    const submission = await this.prisma.evaluationSubmission.findUnique({
      where: { id },
    });
    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }
    return submission;
  }

  async findByAssignment(assignmentId: string) {
    const submission = await this.prisma.evaluationSubmission.findUnique({
      where: { assignmentId },
    });
    if (!submission) {
      throw new NotFoundException(
        `Submission for assignment ${assignmentId} not found`,
      );
    }
    return submission;
  }

  async update(id: string, updateSubmissionDto: UpdateSubmissionDto) {
    const submission = await this.findOne(id);
    if (submission.submittedAt) {
      throw new ConflictException(
        'Cannot update a submission that has already been submitted',
      );
    }

    return this.prisma.evaluationSubmission.update({
      where: { id },
      data: updateSubmissionDto,
    });
  }

  async upsertAnswers(submissionId: string, upsertDto: UpsertAnswersDto) {
    const submission = await this.prisma.evaluationSubmission.findUnique({
      where: { id: submissionId },
      include: { assignment: { include: { cycle: true } } },
    });

    if (!submission) {
      throw new NotFoundException(
        `Submission with ID ${submissionId} not found`,
      );
    }

    if (submission.submittedAt) {
      throw new ConflictException(
        'Cannot update answers for a submitted evaluation',
      );
    }

    if (submission.assignment.status !== 'pending') {
      throw new ConflictException(`Assignment is not pending`);
    }

    if (
      submission.assignment.cycle.status !== 'open' &&
      submission.assignment.cycle.status !== 'closing_soon'
    ) {
      throw new ConflictException(`Cycle is not open or closing_soon`);
    }

    // Check for duplicate criteria in payload
    const criterionIds = upsertDto.answers.map((a) => a.criterionId);
    if (new Set(criterionIds).size !== criterionIds.length) {
      throw new BadRequestException(
        'Payload contains duplicate criterionId entries',
      );
    }

    // Fetch criteria and options to validate from ApplicabilityEngine
    const applicableCriteria =
      await this.applicabilityEngine.getApplicableCriteria(
        submission.assignmentId,
      );

    const foundIds = applicableCriteria.map((c) => c.id);
    const missingIds = criterionIds.filter((id) => !foundIds.includes(id));

    if (missingIds.length > 0) {
      throw new BadRequestException(
        `Criteria not applicable or not found for this assignment: ${missingIds.join(', ')}`,
      );
    }

    for (const answerDto of upsertDto.answers) {
      const criterion = applicableCriteria.find(
        (c) => c.id === answerDto.criterionId,
      );

      if (answerDto.criterionOptionId) {
        const option = criterion!.options.find(
          (o) => o.id === answerDto.criterionOptionId,
        );
        if (!option) {
          throw new BadRequestException(
            `Option ${answerDto.criterionOptionId} does not belong to criterion ${criterion!.id}`,
          );
        }
      }
    }

    // Proceed with upserts inside a transaction for atomicity, or parallel promises
    const operations = upsertDto.answers.map((answerDto) => {
      const criterion = applicableCriteria.find(
        (c) => c.id === answerDto.criterionId,
      )!;
      let scoreValueSnapshot: number | null = null;

      if (answerDto.criterionOptionId) {
        const option = criterion.options.find(
          (o) => o.id === answerDto.criterionOptionId,
        )!;
        scoreValueSnapshot = option.scoreValue;
      }

      return this.prisma.evaluationAnswer.upsert({
        where: {
          submissionId_criterionId: {
            submissionId,
            criterionId: answerDto.criterionId,
          },
        },
        create: {
          submissionId,
          criterionId: answerDto.criterionId,
          criterionOptionId: answerDto.criterionOptionId,
          scoreValueSnapshot,
        },
        update: {
          criterionOptionId: answerDto.criterionOptionId,
          scoreValueSnapshot,
        },
      });
    });

    await this.prisma.$transaction(operations);

    return this.prisma.evaluationAnswer.findMany({
      where: { submissionId },
    });
  }

  async getAnswers(submissionId: string) {
    const submission = await this.findOne(submissionId);
    return this.prisma.evaluationAnswer.findMany({
      where: { submissionId: submission.id },
    });
  }

  async submit(id: string) {
    const submission = await this.prisma.evaluationSubmission.findUnique({
      where: { id },
      include: {
        answers: true,
        assignment: { include: { cycle: true } },
      },
    });

    if (!submission) {
      throw new NotFoundException(`Submission with ID ${id} not found`);
    }

    if (submission.submittedAt) {
      throw new ConflictException('Submission is already submitted');
    }

    if (submission.assignment.status !== 'pending') {
      throw new ConflictException(`Assignment is not pending`);
    }

    if (
      submission.assignment.cycle.status !== 'open' &&
      submission.assignment.cycle.status !== 'closing_soon'
    ) {
      throw new ConflictException(`Cycle is not open or closing_soon`);
    }

    if (submission.answers.length === 0) {
      throw new BadRequestException(
        'Cannot submit without at least one valid answer',
      );
    }

    // Transaction to update both submission and assignment
    await this.prisma.$transaction([
      this.prisma.evaluationSubmission.update({
        where: { id },
        data: { submittedAt: new Date() },
      }),
      this.prisma.evaluationAssignment.update({
        where: { id: submission.assignmentId },
        data: { status: 'completed' },
      }),
    ]);

    return this.findOne(id);
  }
}
