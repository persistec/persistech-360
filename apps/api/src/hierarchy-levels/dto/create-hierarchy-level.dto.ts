import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateHierarchyLevelDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5 })
  @Type(() => Number)
  @IsInt()
  @IsPositive()
  rank: number;
}
