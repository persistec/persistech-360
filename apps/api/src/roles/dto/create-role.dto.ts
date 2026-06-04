import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateRoleDto {
  @ApiProperty({ example: 'Senior Developer' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '2efc8fe7-0f62-4c65-97d7-d9e24b3938f4',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  departmentId?: string | null;

  @ApiPropertyOptional({
    example: '2efc8fe7-0f62-4c65-97d7-d9e24b3938f4',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  hierarchyLevelId?: string | null;
}
