import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Put,
  ParseUUIDPipe,
  UseGuards,
} from '@nestjs/common';
import { EvaluationSubmissionsService } from './evaluation-submissions.service';
import { UpdateSubmissionDto } from './dto/update-submission.dto';
import { UpsertAnswersDto } from './dto/upsert-answers.dto';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { SubmissionResponseDto } from './dto/submission-response.dto';
import { EvaluationAnswerResponseDto } from './dto/evaluation-answer-response.dto';
import { AuthGuard } from '../auth';

@ApiTags('Evaluation Submissions')
@Controller()
@UseGuards(AuthGuard)
export class EvaluationSubmissionsController {
  constructor(private readonly service: EvaluationSubmissionsService) {}

  @Get('evaluation-submissions')
  @ApiOperation({ summary: 'List all evaluation submissions' })
  @ApiResponse({ status: 200, type: [SubmissionResponseDto] })
  findAll() {
    return this.service.findAll();
  }

  @Get('evaluation-submissions/:id')
  @ApiOperation({ summary: 'Get evaluation submission by ID' })
  @ApiResponse({ status: 200, type: SubmissionResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.findOne(id);
  }

  @Get('evaluation-assignments/:id/submission')
  @ApiOperation({ summary: 'Get evaluation submission for a given assignment' })
  @ApiResponse({ status: 200, type: SubmissionResponseDto })
  @ApiResponse({ status: 404, description: 'Not Found' })
  findByAssignment(@Param('id', ParseUUIDPipe) assignmentId: string) {
    return this.service.findByAssignment(assignmentId);
  }

  @Post('evaluation-assignments/:id/submission')
  @ApiOperation({
    summary: 'Create evaluation submission for a given assignment',
  })
  @ApiResponse({ status: 201, type: SubmissionResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict' })
  create(@Param('id', ParseUUIDPipe) assignmentId: string) {
    return this.service.create(assignmentId);
  }

  @Patch('evaluation-submissions/:id')
  @ApiOperation({ summary: 'Update an evaluation submission draft' })
  @ApiResponse({ status: 200, type: SubmissionResponseDto })
  @ApiResponse({ status: 409, description: 'Conflict' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateSubmissionDto: UpdateSubmissionDto,
  ) {
    return this.service.update(id, updateSubmissionDto);
  }

  @Post('evaluation-submissions/:id/submit')
  @ApiOperation({ summary: 'Submit an evaluation submission' })
  @ApiResponse({ status: 200, type: SubmissionResponseDto })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  submit(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.submit(id);
  }

  @Get('evaluation-submissions/:id/answers')
  @ApiOperation({ summary: 'Get answers for an evaluation submission' })
  @ApiResponse({ status: 200, type: [EvaluationAnswerResponseDto] })
  getAnswers(@Param('id', ParseUUIDPipe) id: string) {
    return this.service.getAnswers(id);
  }

  @Put('evaluation-submissions/:id/answers')
  @ApiOperation({ summary: 'Upsert answers for an evaluation submission' })
  @ApiResponse({ status: 200, type: [EvaluationAnswerResponseDto] })
  @ApiResponse({ status: 400, description: 'Bad Request' })
  @ApiResponse({ status: 409, description: 'Conflict' })
  upsertAnswers(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() upsertAnswersDto: UpsertAnswersDto,
  ) {
    return this.service.upsertAnswers(id, upsertAnswersDto);
  }
}
