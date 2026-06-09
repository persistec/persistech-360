import { PartialType } from '@nestjs/swagger';
import { CreateHierarchyLevelDto } from './create-hierarchy-level.dto';

export class UpdateHierarchyLevelDto extends PartialType(
  CreateHierarchyLevelDto,
) {}
