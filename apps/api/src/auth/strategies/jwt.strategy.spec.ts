/* eslint-disable @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-argument */
import { Test, TestingModule } from '@nestjs/testing';
import { JwtStrategy } from './jwt.strategy';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../../database/prisma.service';
import { UnauthorizedException, ForbiddenException } from '@nestjs/common';

describe('JwtStrategy', () => {
  let strategy: JwtStrategy;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        JwtStrategy,
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
              findUnique: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    strategy = module.get<JwtStrategy>(JwtStrategy);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  it('should throw UnauthorizedException if payload is incomplete', async () => {
    const payload = { id: 'uuid' } as any; // missing email/role
    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if user not found in DB', async () => {
    const payload = {
      id: 'uuid',
      email: 'test@test.com',
      role: 'ADMIN',
    } as any;
    jest.spyOn(prismaService.user, 'findUnique').mockResolvedValue(null);

    await expect(strategy.validate(payload)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw ForbiddenException if user is INACTIVE', async () => {
    const payload = {
      id: 'uuid',
      email: 'test@test.com',
      role: 'ADMIN',
    } as any;
    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue({ status: 'INACTIVE' } as any);

    await expect(strategy.validate(payload)).rejects.toThrow(
      ForbiddenException,
    );
  });

  it('should return payload if user is ACTIVE and valid', async () => {
    const payload = {
      id: 'uuid',
      email: 'old@test.com',
      role: 'EMPLOYEE',
    } as any;
    const dbUser = {
      id: 'uuid',
      workspaceEmail: 'new@test.com',
      appRole: 'ADMIN',
      status: 'ACTIVE',
    };
    jest
      .spyOn(prismaService.user, 'findUnique')
      .mockResolvedValue(dbUser as any);

    const result = await strategy.validate(payload);
    expect(result).toEqual({
      id: 'uuid',
      email: 'new@test.com', // Should pick updated values from DB
      role: 'ADMIN',
    });
  });
});
