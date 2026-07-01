import { ExecutionContext, ForbiddenException } from '@nestjs/common';
import { EvaluateeAccessGuard } from './evaluatee-access.guard';
import { AppRole } from '@prisma/client';

describe('EvaluateeAccessGuard', () => {
  let guard: EvaluateeAccessGuard;

  beforeEach(() => {
    guard = new EvaluateeAccessGuard();
  });

  it('should throw if user is missing', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ params: {} }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true if user is ADMIN', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: AppRole.ADMIN },
          params: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });

  it('should throw if evaluateeId param is missing for EMPLOYEE', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: AppRole.EMPLOYEE, id: 'user-id' },
          params: {},
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should throw if EMPLOYEE evaluateeId does not match user id', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: AppRole.EMPLOYEE, id: 'user-id' },
          params: { evaluateeId: 'other-id' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('should return true if EMPLOYEE evaluateeId matches user id', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          user: { role: AppRole.EMPLOYEE, id: 'user-id' },
          params: { evaluateeId: 'user-id' },
        }),
      }),
    } as unknown as ExecutionContext;

    expect(guard.canActivate(mockContext)).toBe(true);
  });
});
