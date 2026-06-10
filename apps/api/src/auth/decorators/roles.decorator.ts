import { SetMetadata } from '@nestjs/common';
import { AppRole } from '@prisma/client';

export const ROLES_KEY = 'roles';
export const RequireAppRole = (...roles: AppRole[]) =>
  SetMetadata(ROLES_KEY, roles);
