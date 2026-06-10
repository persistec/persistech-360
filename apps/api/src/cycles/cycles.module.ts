import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { CyclesController } from './cycles.controller';
import { CyclesService } from './cycles.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [CyclesController],
  providers: [CyclesService],
  exports: [CyclesService],
})
export class CyclesModule {}
