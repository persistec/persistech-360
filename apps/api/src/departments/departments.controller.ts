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
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { DepartmentsService } from './departments.service';
import { CreateDepartmentDto } from './dto/create-department.dto';
import { DepartmentResponseDto } from './dto/department-response.dto';
import { UpdateDepartmentDto } from './dto/update-department.dto';

@ApiTags('Departments')
@Controller('departments')
export class DepartmentsController {
  constructor(private readonly departmentsService: DepartmentsService) {}

  @Get()
  @ApiOperation({ summary: 'List departments' })
  @ApiOkResponse({ type: DepartmentResponseDto, isArray: true })
  findAll() {
    return this.departmentsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a department by id' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @ApiNotFoundResponse({ description: 'Department not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a department' })
  @ApiCreatedResponse({ type: DepartmentResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid parent department' })
  @ApiConflictResponse({ description: 'Department name already exists' })
  create(@Body() dto: CreateDepartmentDto) {
    return this.departmentsService.create(dto);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Update a department' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @ApiBadRequestResponse({ description: 'Invalid parent department' })
  @ApiConflictResponse({ description: 'Department name already exists' })
  @ApiNotFoundResponse({ description: 'Department not found' })
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() dto: UpdateDepartmentDto,
  ) {
    return this.departmentsService.update(id, dto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a department' })
  @ApiOkResponse({ type: DepartmentResponseDto })
  @ApiBadRequestResponse({ description: 'Department still has relations' })
  @ApiNotFoundResponse({ description: 'Department not found' })
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.departmentsService.remove(id);
  }
}
