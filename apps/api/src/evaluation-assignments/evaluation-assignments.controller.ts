import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import { AuthGuard, AppRoleGuard, RequireAppRole } from '../auth';
import { CreateAssignmentDto } from './dto/create-assignment.dto';
import { UpdateAssignmentDto } from './dto/update-assignment.dto';
import { AssignmentResponseDto } from './dto/assignment-response.dto';
import { EvaluationAssignmentsService } from './evaluation-assignments.service';
import { ApplicabilityEngineService } from '../applicability-engine/applicability-engine.service';
import { ApplicableCriterionResponseDto } from './dto/applicable-criteria.dto';

@ApiTags('Evaluation Assignments')
@Controller('evaluation-assignments')
export class EvaluationAssignmentsController {
  constructor(
    private readonly assignmentsService: EvaluationAssignmentsService,
    private readonly applicabilityEngineService: ApplicabilityEngineService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List all evaluation assignments' })
  @ApiOkResponse({ type: AssignmentResponseDto, isArray: true })
  findAll() {
    return this.assignmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get an evaluation assignment by id' })
  @ApiOkResponse({ type: AssignmentResponseDto })
  @ApiNotFoundResponse({ description: 'Evaluation assignment not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.assignmentsService.findOne(id);
  }

  @Get(':id/applicable-criteria')
  @ApiOperation({ summary: 'Get applicable criteria for an assignment' })
  @ApiOkResponse({ type: ApplicableCriterionResponseDto, isArray: true })
  @ApiNotFoundResponse({ description: 'Evaluation assignment not found' })
  getApplicableCriteria(@Param('id', ParseUUIDPipe) id: string) {
    return this.applicabilityEngineService.getApplicableCriteria(id);
  }

  @Post()
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Create a manual evaluation assignment' })
  @ApiCreatedResponse({ type: AssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid relation, self-evaluation, or evaluating superior',
  })
  @ApiConflictResponse({ description: 'Assignment already exists' })
  create(@Body() dto: CreateAssignmentDto) {
    return this.assignmentsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Update an evaluation assignment' })
  @ApiOkResponse({ type: AssignmentResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid relation, self-evaluation, or evaluating superior',
  })
  @ApiConflictResponse({ description: 'Assignment already exists' })
  @ApiNotFoundResponse({ description: 'Evaluation assignment not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateAssignmentDto,
  ) {
    return this.assignmentsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Delete an evaluation assignment' })
  @ApiOkResponse({ type: AssignmentResponseDto })
  @ApiNotFoundResponse({ description: 'Evaluation assignment not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.assignmentsService.remove(id);
  }
}
