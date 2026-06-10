import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { AuthModule } from '../auth/auth.module';

@Module({
  imports: [DatabaseModule, AuthModule],
  controllers: [RolesController],
  providers: [RolesService],
})
export class RolesModule {}
