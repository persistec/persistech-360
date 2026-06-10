import { EvaluateeAccessGuard } from './evaluatee-access.guard';
import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { AppRole } from '@prisma/client';

describe('EvaluateeAccessGuard', () => {
  let guard: EvaluateeAccessGuard;

  beforeEach(() => {
    guard = new EvaluateeAccessGuard();
  });

  it('should throw if user is not authenticated', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: null }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true if user is ADMIN', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ user: { appRole: AppRole.ADMIN } }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw if evaluateeId param is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { appRole: AppRole.EMPLOYEE },
          params: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw if employee tries to access another evaluatee', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1', appRole: AppRole.EMPLOYEE },
          params: { evaluateeId: 'user-2' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true if employee accesses their own evaluatee endpoint', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { id: 'user-1', appRole: AppRole.EMPLOYEE },
          params: { evaluateeId: 'user-1' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
