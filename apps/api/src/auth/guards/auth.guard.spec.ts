import { Test, TestingModule } from '@nestjs/testing';
import { AuthGuard } from './auth.guard';
import { PrismaService } from '../../database/prisma.service';
import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { UserStatus, User } from '@prisma/client';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        {
          provide: PrismaService,
          useValue: {
            user: {
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should throw if missing x-user-id header', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
        }),
      }),
    } as ExecutionContext;

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if user is unknown', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-user-id': 'uuid' },
        }),
      }),
    } as ExecutionContext;

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw if user is inactive', async () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { 'x-user-id': 'uuid' },
        }),
      }),
    } as ExecutionContext;

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 'uuid',
      status: UserStatus.SUSPENDED,
    } as unknown as User);

    await expect(guard.canActivate(mockContext)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should return true and attach user if active', async () => {
    const mockRequest = {
      headers: { 'x-user-id': 'uuid' },
      user: null,
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as ExecutionContext;

    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue({
      id: 'uuid',
      status: UserStatus.ACTIVE,
    } as unknown as User);

    const result = await guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(mockRequest.user).toBeDefined();
    expect((mockRequest.user as unknown as User).id).toBe('uuid');
  });
});
