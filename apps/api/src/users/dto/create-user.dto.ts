import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { UserStatus } from '@prisma/client';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ example: 'ana.silva@example.com' })
  @IsEmail()
  workspaceEmail: string;

  @ApiProperty({ example: 'Ana Silva' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({ example: 'google-oauth-subject', nullable: true })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  googleSub?: string | null;

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
  roleId?: string | null;

  @ApiPropertyOptional({
    example: '2efc8fe7-0f62-4c65-97d7-d9e24b3938f4',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  hierarchyLevelId?: string | null;

  @ApiPropertyOptional({
    example: '2efc8fe7-0f62-4c65-97d7-d9e24b3938f4',
    nullable: true,
  })
  @IsOptional()
  @IsUUID()
  managerId?: string | null;

  @ApiPropertyOptional({ enum: UserStatus, example: UserStatus.ACTIVE })
  @IsOptional()
  @IsEnum(UserStatus)
  status?: UserStatus;
}
