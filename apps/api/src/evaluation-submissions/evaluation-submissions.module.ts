import { Module } from '@nestjs/common';
import { EvaluationSubmissionsService } from './evaluation-submissions.service';
import { EvaluationSubmissionsController } from './evaluation-submissions.controller';
import { DatabaseModule } from '../database/database.module';
import { ApplicabilityEngineModule } from '../applicability-engine/applicability-engine.module';

@Module({
  imports: [DatabaseModule, ApplicabilityEngineModule],
  controllers: [EvaluationSubmissionsController],
  providers: [EvaluationSubmissionsService],
})
export class EvaluationSubmissionsModule {}
