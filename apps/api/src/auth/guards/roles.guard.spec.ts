import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AppRoleGuard } from './roles.guard';
import { AppRole } from '@prisma/client';

describe('AppRoleGuard', () => {
  let guard: AppRoleGuard;
  let reflector: Reflector;

  beforeEach(() => {
    reflector = new Reflector();
    guard = new AppRoleGuard(reflector);
  });

  it('should return true if no roles are required', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue(undefined);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw if user is not present', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppRole.ADMIN]);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({}),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true if user has required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppRole.ADMIN]);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: AppRole.ADMIN },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw if user lacks required role', () => {
    jest.spyOn(reflector, 'getAllAndOverride').mockReturnValue([AppRole.ADMIN]);

    const mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: AppRole.EMPLOYEE },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });
});
