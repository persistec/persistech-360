import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import {
  ApplicabilityRule,
  Criterion,
  Dimension,
  EvaluationAssignment,
  HierarchyLevel,
  Role,
} from '@prisma/client';

@Injectable()
export class ApplicabilityEngineService {
  constructor(private readonly prisma: PrismaService) {}

  async getApplicableCriteria(assignmentId: string) {
    const assignment = await this.prisma.evaluationAssignment.findUnique({
      where: { id: assignmentId },
      include: {
        evaluator: {
          include: {
            hierarchyLevel: true,
            role: true,
          },
        },
        evaluatee: {
          include: {
            hierarchyLevel: true,
            role: true,
            _count: {
              select: { subordinates: { where: { status: 'ACTIVE' } } },
            },
          },
        },
      },
    });

    if (!assignment) {
      throw new NotFoundException(`Assignment ${assignmentId} not found`);
    }

    const { evaluator, evaluatee } = assignment;
    const isEvaluateeLeader = evaluatee._count.subordinates > 0;
    const isSameDepartment = Boolean(
      evaluator.departmentId &&
      evaluator.departmentId === evaluatee.departmentId,
    );

    const allCriteria = await this.prisma.criterion.findMany({
      where: {
        active: true,
        dimension: { active: true },
      },
      include: {
        dimension: {
          include: {
            applicabilityRules: true,
          },
        },
        applicabilityRules: true,
        options: {
          orderBy: { sortOrder: 'asc' },
        },
      },
    });

    return allCriteria.filter((criterion) => {
      return this.evaluateCriterion(
        criterion,
        assignment,
        evaluator,
        evaluatee,
        isEvaluateeLeader,
        isSameDepartment,
      );
    });
  }

  private evaluateCriterion(
    criterion: Criterion & {
      dimension: Dimension & { applicabilityRules: ApplicabilityRule[] };
      applicabilityRules: ApplicabilityRule[];
    },
    assignment: EvaluationAssignment,
    evaluator: {
      departmentId: string | null;
      hierarchyLevel: HierarchyLevel | null;
      role: Role | null;
    },
    evaluatee: {
      departmentId: string | null;
      hierarchyLevel: HierarchyLevel | null;
      role: Role | null;
    },
    isEvaluateeLeader: boolean,
    isSameDepartment: boolean | null,
  ): boolean {
    const { dimension } = criterion;

    let baseApplicable = false;

    if (dimension.type === 'leadership') {
      if (!isEvaluateeLeader) return false;
      baseApplicable = true;
    } else if (dimension.type === 'departmental') {
      baseApplicable = isSameDepartment || false;
    } else if (dimension.type === 'corporate') {
      baseApplicable = true;
    }

    const allRules = [
      ...criterion.applicabilityRules,
      ...(dimension.applicabilityRules || []),
    ];

    if (allRules.length === 0) {
      return baseApplicable;
    }

    return allRules.some((rule) =>
      this.matchesRule(
        rule,
        assignment,
        evaluator,
        evaluatee,
        isSameDepartment,
      ),
    );
  }

  private matchesRule(
    rule: ApplicabilityRule,
    assignment: EvaluationAssignment,
    evaluator: {
      departmentId: string | null;
      hierarchyLevel: HierarchyLevel | null;
      role: Role | null;
    },
    evaluatee: {
      departmentId: string | null;
      hierarchyLevel: HierarchyLevel | null;
      role: Role | null;
    },
    isSameDepartment: boolean | null,
  ): boolean {
    if (
      rule.relationshipType &&
      rule.relationshipType !== assignment.relationshipType
    ) {
      return false;
    }

    if (rule.sameDepartmentRequired && !isSameDepartment) {
      return false;
    }

    if (rule.crossDepartmentAllowed === false && !isSameDepartment) {
      return false;
    }

    // Rank logic: Higher rank number = higher in hierarchy.
    // evaluatee is above evaluator if evaluatee.rank > evaluator.rank
    if (
      rule.blockedIfEvaluateeAboveEvaluator &&
      evaluator.hierarchyLevel &&
      evaluatee.hierarchyLevel
    ) {
      if (evaluatee.hierarchyLevel.rank > evaluator.hierarchyLevel.rank) {
        return false;
      }
    }

    if (rule.minHierarchyRank != null && evaluator.hierarchyLevel) {
      if (evaluator.hierarchyLevel.rank < rule.minHierarchyRank) {
        return false;
      }
    }

    if (rule.maxHierarchyRank != null && evaluator.hierarchyLevel) {
      if (evaluator.hierarchyLevel.rank > rule.maxHierarchyRank) {
        return false;
      }
    }

    if (rule.requiredRoleFamily && evaluator.role) {
      if (
        !evaluator.role.name
          .toLowerCase()
          .includes(rule.requiredRoleFamily.toLowerCase())
      ) {
        return false;
      }
    }

    return true;
  }
}
