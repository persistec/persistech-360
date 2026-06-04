import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
} from '@nestjs/common';
import {
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
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
  @ApiOperation({ summary: 'Create a hierarchy level' })
  @ApiCreatedResponse({ type: HierarchyLevelResponseDto })
  @ApiConflictResponse({ description: 'Name or rank already exists' })
  create(@Body() dto: CreateHierarchyLevelDto) {
    return this.hierarchyLevelsService.create(dto);
  }

  @Patch(':id')
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
  @ApiOperation({ summary: 'Delete a hierarchy level' })
  @ApiOkResponse({ type: HierarchyLevelResponseDto })
  @ApiConflictResponse({ description: 'Hierarchy level still has relations' })
  @ApiNotFoundResponse({ description: 'Hierarchy level not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.hierarchyLevelsService.remove(id);
  }
}
