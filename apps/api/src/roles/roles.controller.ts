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
} from '@nestjs/swagger';
import { AppRole } from '@prisma/client';
import { AuthGuard, AppRoleGuard, RequireAppRole, CurrentUser } from '../auth';
import type { CurrentUserPayload } from '../auth';
import { CreateRoleDto } from './dto/create-role.dto';
import { RoleResponseDto } from './dto/role-response.dto';
import { UpdateRoleDto } from './dto/update-role.dto';
import { RolesService } from './roles.service';

@ApiTags('Roles')
@Controller('roles')
export class RolesController {
  constructor(private readonly rolesService: RolesService) {}

  @Get()
  @ApiOperation({ summary: 'List roles' })
  @ApiOkResponse({ type: RoleResponseDto, isArray: true })
  findAll() {
    return this.rolesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a role by id' })
  @ApiOkResponse({ type: RoleResponseDto })
  @ApiNotFoundResponse({ description: 'Role not found' })
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.rolesService.findOne(id);
  }

  @Post()
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiOperation({ summary: 'Create a role' })
  @ApiCreatedResponse({ type: RoleResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid department or hierarchy level',
  })
  create(@Body() dto: CreateRoleDto) {
    return this.rolesService.create(dto);
  }

  @Patch(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiOperation({ summary: 'Update a role' })
  @ApiOkResponse({ type: RoleResponseDto })
  @ApiBadRequestResponse({
    description: 'Invalid department or hierarchy level',
  })
  @ApiNotFoundResponse({ description: 'Role not found' })
  update(@Param('id', ParseUUIDPipe) id: string, @Body() dto: UpdateRoleDto) {
    return this.rolesService.update(id, dto);
  }

  @Delete(':id')
  @UseGuards(AuthGuard, AppRoleGuard)
  @RequireAppRole(AppRole.ADMIN)
  @ApiOperation({ summary: 'Archive a role' })
  @ApiOkResponse({ type: RoleResponseDto })
  @ApiBadRequestResponse({ description: 'Role still has active users' })
  @ApiNotFoundResponse({ description: 'Role not found' })
  remove(
    @Param('id', ParseUUIDPipe) id: string,
    @CurrentUser() user: CurrentUserPayload,
  ) {
    return this.rolesService.remove(id, user.id);
  }
}
