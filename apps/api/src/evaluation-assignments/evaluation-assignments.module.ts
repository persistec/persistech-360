import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EvaluationAssignmentsController } from './evaluation-assignments.controller';
import { EvaluationAssignmentsService } from './evaluation-assignments.service';
import { ApplicabilityEngineModule } from '../applicability-engine/applicability-engine.module';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, ApplicabilityEngineModule, AuthModule],
  controllers: [EvaluationAssignmentsController],
  providers: [EvaluationAssignmentsService],
  exports: [EvaluationAssignmentsService],
})
export class EvaluationAssignmentsModule {}
