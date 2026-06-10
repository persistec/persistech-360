import { Module } from '@nestjs/common';
import { ResultsVisibilityController } from './results-visibility.controller';
import { ResultsVisibilityService } from './results-visibility.service';
import { ScoringModule } from '../scoring/scoring.module';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [ScoringModule, AuthModule, DatabaseModule],
  controllers: [ResultsVisibilityController],
  providers: [ResultsVisibilityService],
})
export class ResultsVisibilityModule {}
