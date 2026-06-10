import { Module } from '@nestjs/common';
import { ResultsVisibilityController } from './results-visibility.controller';
import { ResultsVisibilityService } from './results-visibility.service';
import { ScoringModule } from '../scoring/scoring.module';

@Module({
  imports: [ScoringModule],
  controllers: [ResultsVisibilityController],
  providers: [ResultsVisibilityService],
})
export class ResultsVisibilityModule {}
