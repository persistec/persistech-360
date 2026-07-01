import { AppRole } from '@prisma/client';
import { Request } from 'express';

export type CurrentUserPayload = {
  id: string;
  email: string;
  role: AppRole;
};

export type JwtPayload = CurrentUserPayload & {
  iat?: number;
  exp?: number;
};

export type AuthenticatedRequest = Request & {
  user?: CurrentUserPayload;
};

export type CookieRequest = Request & {
  cookies?: Record<string, string | undefined>;
};

export type GoogleProfile = {
  id: string;
  emails?: Array<{ value?: string }>;
};
