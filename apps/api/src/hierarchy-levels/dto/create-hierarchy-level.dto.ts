import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsNotEmpty, IsPositive, IsString } from 'class-validator';

export class CreateHierarchyLevelDto {
  @ApiProperty({ example: 'Manager' })
  @IsString()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ example: 5 })
  @IsInt()
  @IsPositive()
  rank: number;
}
