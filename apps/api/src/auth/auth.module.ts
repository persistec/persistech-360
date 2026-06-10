import { Module, Global } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { AuthGuard } from './guards/auth.guard';
import { AppRoleGuard } from './guards/roles.guard';
import { EvaluateeAccessGuard } from './guards/evaluatee-access.guard';

@Global()
@Module({
  imports: [DatabaseModule],
  providers: [AuthGuard, AppRoleGuard, EvaluateeAccessGuard],
  exports: [AuthGuard, AppRoleGuard, EvaluateeAccessGuard],
})
export class AuthModule {}
