import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { HierarchyLevelsController } from './hierarchy-levels.controller';
import { HierarchyLevelsService } from './hierarchy-levels.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [HierarchyLevelsController],
  providers: [HierarchyLevelsService],
})
export class HierarchyLevelsModule {}
