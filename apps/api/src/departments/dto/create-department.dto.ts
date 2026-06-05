import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsUUID } from 'class-validator';

export class CreateDepartmentDto {
  @ApiProperty({ example: 'Engineering' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiPropertyOptional({
    example: '2efc8fe7-0f62-4c65-97d7-d9e24b3938f4',
    nullable: true,
    type: String,
  })
  @IsOptional()
  @IsUUID()
  parentDepartmentId?: string | null;
}
