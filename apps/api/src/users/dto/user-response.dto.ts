import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workspaceEmail: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true })
  departmentId: string | null;

  @ApiPropertyOptional({ nullable: true })
  roleId: string | null;

  @ApiPropertyOptional({ nullable: true })
  hierarchyLevelId: string | null;

  @ApiPropertyOptional({ nullable: true })
  managerId: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
