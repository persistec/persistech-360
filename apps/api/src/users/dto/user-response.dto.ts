import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';

export class UserResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  workspaceEmail: string;

  @ApiProperty()
  name: string;

  @ApiPropertyOptional({ nullable: true, type: String })
  departmentId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  roleId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  hierarchyLevelId: string | null;

  @ApiPropertyOptional({ nullable: true, type: String })
  managerId: string | null;

  @ApiProperty({ enum: UserStatus })
  status: UserStatus;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
