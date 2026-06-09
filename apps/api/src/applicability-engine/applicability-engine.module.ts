import { Module } from '@nestjs/common';
import { ApplicabilityEngineService } from './applicability-engine.service';
import { DatabaseModule } from '../database/database.module';

@Module({
  imports: [DatabaseModule],
  providers: [ApplicabilityEngineService],
  exports: [ApplicabilityEngineService],
})
export class ApplicabilityEngineModule {}
