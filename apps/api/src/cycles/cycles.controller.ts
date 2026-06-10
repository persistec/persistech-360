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
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiHeader,
} from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import { AuthGuard, AppRoleGuard, RequireAppRole } from '../auth';
import { CreateCycleDto } from './dto/create-cycle.dto';
import { UpdateCycleDto } from './dto/update-cycle.dto';
import { CycleResponseDto } from './dto/cycle-response.dto';
import { CyclesService } from './cycles.service';

@ApiTags('Cycles')
@Controller('cycles')
export class CyclesController {
  constructor(private readonly cyclesService: CyclesService) {}

  @Get()
  @ApiOperation({ summary: 'List all cycles' })
  @ApiOkResponse({ type: CycleResponseDto, isArray: true })
  findAll() {
    return this.cyclesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a cycle by id' })
  @ApiOkResponse({ type: CycleResponseDto })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.cyclesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Create a cycle' })
  @ApiCreatedResponse({ type: CycleResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid relation or invalid date range',
  })
  create(@Body() dto: CreateCycleDto) {
    return this.cyclesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Update a cycle' })
  @ApiOkResponse({ type: CycleResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid relation or invalid date range',
  })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateCycleDto) {
    return this.cyclesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Delete a cycle' })
  @ApiOkResponse({ type: CycleResponseDto })
  @ApiBadRequestResponse({
    description: 'Cycle still has assignments or is not in draft',
  })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.cyclesService.remove(id);
  }

  @Post(':id/open')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Open a cycle' })
  @ApiOkResponse({ type: CycleResponseDto })
  @ApiBadRequestResponse({
    description: 'Cycle not in draft/scheduled status, or has no assignments',
  })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  open(@Param('id', ParseUUIDPipe) id: string) {
    return this.cyclesService.openCycle(id);
  }

  @Post(':id/close')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Close a cycle' })
  @ApiOkResponse({ type: CycleResponseDto })
  @ApiBadRequestResponse({
    description: 'Cycle not in open/closing_soon status',
  })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  close(@Param('id', ParseUUIDPipe) id: string) {
    return this.cyclesService.closeCycle(id);
  }

  @Post(':id/generate-assignments')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({
    summary: 'Generate automatic evaluation assignments for a cycle',
  })
  @ApiOkResponse({
    schema: {
      type: 'object',
      properties: {
        generatedCount: { type: 'number', example: 12 },
      },
    },
  })
  @ApiBadRequestResponse({ description: 'Cycle is closed or inactive' })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  generateAssignments(@Param('id', ParseUUIDPipe) id: string) {
    return this.cyclesService.generateAssignments(id);
  }

  @Get(':id/assignments')
  @ApiOperation({ summary: 'Get all assignments for a specific cycle' })
  @ApiOkResponse({
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          cycleId: { type: 'string' },
          evaluatorId: { type: 'string' },
          evaluateeId: { type: 'string' },
          relationshipType: { type: 'string' },
          status: { type: 'string' },
          required: { type: 'boolean' },
          createdAt: { type: 'string', format: 'date-time' },
          updatedAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  })
  @ApiNotFoundResponse({ description: 'Cycle not found' })
  findAssignments(@Param('id', ParseUUIDPipe) id: string) {
    return this.cyclesService.findAssignments(id);
  }
}
