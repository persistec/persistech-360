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
import { CreateHierarchyLevelDto } from './dto/create-hierarchy-level.dto';
import { HierarchyLevelResponseDto } from './dto/hierarchy-level-response.dto';
import { UpdateHierarchyLevelDto } from './dto/update-hierarchy-level.dto';
import { HierarchyLevelsService } from './hierarchy-levels.service';

@ApiTags('Hierarchy Levels')
@Controller('hierarchy-levels')
export class HierarchyLevelsController {
  constructor(
    private readonly hierarchyLevelsService: HierarchyLevelsService,
  ) {}

  @Get()
  @ApiOperation({ summary: 'List hierarchy levels' })
  @ApiOkResponse({ type: HierarchyLevelResponseDto, isArray: true })
  findAll() {
    return this.hierarchyLevelsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a hierarchy level by id' })
  @ApiOkResponse({ type: HierarchyLevelResponseDto })
  @ApiNotFoundResponse({ description: 'Hierarchy level not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.hierarchyLevelsService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Create a hierarchy level' })
  @ApiCreatedResponse({ type: HierarchyLevelResponseDto })
  @ApiConflictResponse({ description: 'Name or rank already exists' })
  create(@Body() dto: CreateHierarchyLevelDto) {
    return this.hierarchyLevelsService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Update a hierarchy level' })
  @ApiOkResponse({ type: HierarchyLevelResponseDto })
  @ApiConflictResponse({ description: 'Name or rank already exists' })
  @ApiNotFoundResponse({ description: 'Hierarchy level not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateHierarchyLevelDto,
  ) {
    return this.hierarchyLevelsService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiHeader({ name: 'x-user-id', required: true })
  @ApiOperation({ summary: 'Delete a hierarchy level' })
  @ApiOkResponse({ type: HierarchyLevelResponseDto })
  @ApiBadRequestResponse({
    description: 'Hierarchy level still has relations',
  })
  @ApiNotFoundResponse({ description: 'Hierarchy level not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hierarchyLevelsService.remove(id);
  }
}
