import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiHeader,
} from '@nestjs/swagger';
import { ResultsVisibilityService } from './results-visibility.service';
import {
  AdminResultViewDto,
  EmployeeResultViewDto,
} from './dto/results-visibility.dto';
import {
  AuthGuard,
  AppRoleGuard,
  EvaluateeAccessGuard,
  RequireAppRole,
} from '../auth';
import { AppRole } from '@prisma/client';

@ApiTags('Results Visibility')
@Controller('cycles/:cycleId/evaluatees/:evaluateeId/results')
export class ResultsVisibilityController {
  constructor(
    private readonly resultsVisibilityService: ResultsVisibilityService,
  ) {}

  @Get('admin')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiOperation({
    summary: 'Get admin result view',
    description: 'Returns a detailed scoring projection. Requires ADMIN role.',
  })
  @ApiParam({ name: 'cycleId', format: 'uuid' })
  @ApiParam({ name: 'evaluateeId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Detailed admin view of results',
    type: AdminResultViewDto,
  })
  async getAdminResultView(
    @Param('cycleId') cycleId: string,
    @Param('evaluateeId') evaluateeId: string,
  ): Promise<AdminResultViewDto> {
    return this.resultsVisibilityService.getAdminResultView(
      cycleId,
      evaluateeId,
    );
  }

  @Get('employee')
  @UseGuards(AuthGuard, EvaluateeAccessGuard)
  @ApiOperation({
    summary: 'Get evaluated employee result view',
    description:
      'Returns an anonymized aggregate scoring projection or an insufficient responses status. Requires ADMIN role or the evaluated employee.',
  })
  @ApiParam({ name: 'cycleId', format: 'uuid' })
  @ApiParam({ name: 'evaluateeId', format: 'uuid' })
  @ApiResponse({
    status: 200,
    description: 'Anonymized employee view of results',
    type: EmployeeResultViewDto,
  })
  async getEmployeeResultView(
    @Param('cycleId') cycleId: string,
    @Param('evaluateeId') evaluateeId: string,
  ): Promise<EmployeeResultViewDto> {
    return this.resultsVisibilityService.getEmployeeResultView(
      cycleId,
      evaluateeId,
    );
  }
}
