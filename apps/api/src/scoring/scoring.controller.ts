import { Controller, Get, Param, ParseUUIDPipe, UseGuards } from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiOkResponse,
  ApiNotFoundResponse,
} from '@nestjs/swagger';
import { ScoringService } from './scoring.service';
import {
  CycleResultsSummaryDto,
  EvaluateeResultsDto,
} from './dto/scoring-results.dto';
import { AuthGuard } from '../auth';

@ApiTags('Scoring and Results')
@Controller('cycles')
@UseGuards(AuthGuard)
export class ScoringController {
  constructor(private readonly scoringService: ScoringService) {}

  @Get(':id/results')
  @ApiOperation({
    summary: 'Get aggregate scoring results for an entire cycle',
  })
  @ApiOkResponse({ type: CycleResultsSummaryDto })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  getCycleResults(@Param('id', ParseUUIDPipe) id: string) {
    return this.scoringService.getCycleResults(id);
  }

  @Get(':cycleId/evaluatees/:evaluateeId/results')
  @ApiOperation({
    summary:
      'Get aggregate scoring results for a specific evaluatee in a cycle',
  })
  @ApiOkResponse({ type: EvaluateeResultsDto })
  getEvaluateeResults(
    @Param('cycleId', ParseUUIDPipe) cycleId: string,
    @Param('evaluateeId', ParseUUIDPipe) evaluateeId: string,
  ) {
    return this.scoringService.getEvaluateeResults(cycleId, evaluateeId);
  }
}
