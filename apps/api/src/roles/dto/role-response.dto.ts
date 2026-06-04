import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class RoleResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  departmentId: string | null;

  @ApiPropertyOptional({ nullable: true })
  hierarchyLevelId: string | null;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
