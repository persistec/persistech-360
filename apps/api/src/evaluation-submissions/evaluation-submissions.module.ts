import { Module } from '@nestjs/common';
import { EvaluationSubmissionsService } from './evaluation-submissions.service';
import { EvaluationSubmissionsController } from './evaluation-submissions.controller';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  controllers: [EvaluationSubmissionsController],
  providers: [EvaluationSubmissionsService],
})
export class EvaluationSubmissionsModule {}
