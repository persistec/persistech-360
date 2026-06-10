import { Controller, Get, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ResultsVisibilityService } from './results-visibility.service';
import {
  AdminResultViewDto,
  EmployeeResultViewDto,
} from './dto/results-visibility.dto';

@ApiTags('Results Visibility')
@Controller('cycles/:cycleId/evaluatees/:evaluateeId/results')
export class ResultsVisibilityController {
  constructor(
    private readonly resultsVisibilityService: ResultsVisibilityService,
  ) {}

  @Get('admin')
  @ApiOperation({
    summary: 'Get admin result view',
    description:
      'Returns a detailed scoring projection. Note: Endpoint access control is deferred to issue #12.',
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
  @ApiOperation({
    summary: 'Get evaluated employee result view',
    description:
      'Returns an anonymized aggregate scoring projection or an insufficient responses status. Note: Endpoint access control is deferred to issue #12.',
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
