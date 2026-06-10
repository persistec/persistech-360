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
import { EvaluationSubmissionsModule } from './evaluation-submissions/evaluation-submissions.module';
import { ApplicabilityEngineModule } from './applicability-engine/applicability-engine.module';
import { ScoringModule } from './scoring/scoring.module';
import { ResultsVisibilityModule } from './results-visibility/results-visibility.module';
import { AuthModule } from './auth/auth.module';

@Module({
  imports: [
    DatabaseModule,
    HealthModule,
    AuthModule,
    DepartmentsModule,
    HierarchyLevelsModule,
    RolesModule,
    UsersModule,
    CyclesModule,
    EvaluationAssignmentsModule,
    EvaluationSubmissionsModule,
    ApplicabilityEngineModule,
    ScoringModule,
    ResultsVisibilityModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
