import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { EvaluationAssignmentsController } from './evaluation-assignments.controller';
import { EvaluationAssignmentsService } from './evaluation-assignments.service';

@Module({
  imports: [DatabaseModule],
  controllers: [EvaluationAssignmentsController],
  providers: [EvaluationAssignmentsService],
  exports: [EvaluationAssignmentsService],
})
export class EvaluationAssignmentsModule {}
