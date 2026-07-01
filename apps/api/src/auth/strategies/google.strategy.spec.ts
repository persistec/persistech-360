/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { GoogleStrategy } from './google.strategy';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('GoogleStrategy', () => {
  let strategy: GoogleStrategy;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GoogleStrategy,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue('mock-val'),
          },
        },
        {
          provide: PrismaService,
          useValue: {
            user: {
              findFirst: jest.fn(),
              update: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    strategy = module.get<GoogleStrategy>(GoogleStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should throw UnauthorizedException if email is missing', async () => {
    const profile = { id: '123', emails: [] } as any;
    const done = jest.fn();

    await strategy.validate('token', 'refresh', profile, done);
    expect(done).toHaveBeenCalledWith(expect.any(UnauthorizedException), false);
  });

  it('should throw ForbiddenException if user is not in database', async () => {
    const profile = {
      id: '123',
      emails: [{ value: 'test@example.com' }],
    } as any;
    const done = jest.fn();
    jest.spyOn(prismaService.user, 'findFirst').mockResolvedValue(null);

    await strategy.validate('token', 'refresh', profile, done);
    expect(done).toHaveBeenCalledWith(expect.any(ForbiddenException), false);
  });

  it('should throw ForbiddenException if user is INACTIVE', async () => {
    const profile = {
      id: '123',
      emails: [{ value: 'test@example.com' }],
    } as any;
    const done = jest.fn();
    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue({ status: 'INACTIVE' } as any);

    await strategy.validate('token', 'refresh', profile, done);
    expect(done).toHaveBeenCalledWith(expect.any(ForbiddenException), false);
  });

  it('should update googleSub if it is empty and user is ACTIVE (progressive linking)', async () => {
    const profile = {
      id: '123',
      emails: [{ value: 'test@example.com' }],
    } as any;
    const done = jest.fn();
    const mockUser = {
      id: 'uuid',
      workspaceEmail: 'test@example.com',
      appRole: 'ADMIN',
      status: 'ACTIVE',
      googleSub: null, // empty
    };

    const mockUpdatedUser = {
      ...mockUser,
      googleSub: '123',
    };

    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockUser as any);
    const updateSpy = jest
      .spyOn(prismaService.user, 'update')
      .mockResolvedValue(mockUpdatedUser as any);

    await strategy.validate('token', 'refresh', profile, done);

    expect(updateSpy).toHaveBeenCalledWith({
      where: { id: 'uuid' },
      data: { googleSub: '123' },
    });

    expect(done).toHaveBeenCalledWith(null, {
      id: 'uuid',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });

  it('should not update googleSub if it is already present', async () => {
    const profile = {
      id: '123',
      emails: [{ value: 'test@example.com' }],
    } as any;
    const done = jest.fn();
    const mockUser = {
      id: 'uuid',
      workspaceEmail: 'test@example.com',
      appRole: 'ADMIN',
      status: 'ACTIVE',
      googleSub: '123', // already present
    };

    jest
      .spyOn(prismaService.user, 'findFirst')
      .mockResolvedValue(mockUser as any);
    const updateSpy = jest.spyOn(prismaService.user, 'update');

    await strategy.validate('token', 'refresh', profile, done);

    expect(updateSpy).not.toHaveBeenCalled();

    expect(done).toHaveBeenCalledWith(null, {
      id: 'uuid',
      email: 'test@example.com',
      role: 'ADMIN',
    });
  });
});
