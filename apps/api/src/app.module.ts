import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseModule } from './database/database.module';
import { DepartmentsModule } from './departments/departments.module';
import { HealthModule } from './health/health.module';
import { HierarchyLevelsModule } from './hierarchy-levels/hierarchy-levels.module';
import { RolesModule } from './roles/roles.module';
import { UsersModule } from './users/users.module';
import { CyclesModule } from './cycles/cycles.module';
import { EvaluationAssignmentsModule } from './evaluation-assignments/evaluation-assignments.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    DepartmentsModule,
    HierarchyLevelsModule,
    RolesModule,
    UsersModule,
    CyclesModule,
    EvaluationAssignmentsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
