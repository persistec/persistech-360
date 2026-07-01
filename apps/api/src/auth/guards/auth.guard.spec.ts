import { AuthGuard } from './auth.guard';
import { UnauthorizedException } from '@nestjs/common';

describe('AuthGuard', () => {
  let guard: AuthGuard;

  beforeEach(() => {
    guard = new AuthGuard();
  });

  describe('handleRequest', () => {
    it('should throw if there is an error', () => {
      const error = new Error('Test error');
      expect(() => guard.handleRequest(error, null)).toThrow(error);
    });

    it('should throw UnauthorizedException if user is missing', () => {
      expect(() => guard.handleRequest(null, null)).toThrow(
        UnauthorizedException,
      );
    });

    it('should return the user if present', () => {
      const user = { id: 'uuid', role: 'ADMIN' };
      expect(guard.handleRequest(null, user)).toBe(user);
    });
  });
});
