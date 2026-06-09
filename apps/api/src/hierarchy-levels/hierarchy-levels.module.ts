import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HierarchyLevelsController } from './hierarchy-levels.controller';
import { HierarchyLevelsService } from './hierarchy-levels.service';

@Module({
  imports: [DatabaseModule],
  controllers: [HierarchyLevelsController],
  providers: [HierarchyLevelsService],
})
export class HierarchyLevelsModule {}
