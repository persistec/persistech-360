import { bootstrapAdmin } from './seed-admin';
import { AppRole } from '@prisma/client';
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import type { PrismaClient } from '@prisma/client';

describe('Admin Bootstrap Seed', () => {
  let prismaMock: {
    user: {
      upsert: jest.Mock;
    };
  };
  let consoleSpy: jest.SpyInstance;

  beforeEach(() => {
    prismaMock = {
      user: {
        upsert: jest.fn(),
      },
    };
    consoleSpy = jest.spyOn(console, 'log').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('does not create admin when variables are missing', async () => {
    await bootstrapAdmin(prismaMock, {});
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('does not create admin when only email exists', async () => {
    await bootstrapAdmin(prismaMock, {
      INITIAL_ADMIN_EMAIL: 'test@example.com',
    });
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('does not create admin when only name exists', async () => {
    await bootstrapAdmin(prismaMock, {
      INITIAL_ADMIN_NAME: 'Test User',
    });
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('does not create admin when variables are empty after trim', async () => {
    await bootstrapAdmin(prismaMock, {
      INITIAL_ADMIN_EMAIL: '   ',
      INITIAL_ADMIN_NAME: '   ',
    });
    expect(prismaMock.user.upsert).not.toHaveBeenCalled();
  });

  it('creates admin with normalized data when both variables exist', async () => {
    await bootstrapAdmin(prismaMock, {
      INITIAL_ADMIN_EMAIL: '  Test@Example.COM  ',
      INITIAL_ADMIN_NAME: '  Test User  ',
    });

    expect(prismaMock.user.upsert).toHaveBeenCalledTimes(1);
    expect(prismaMock.user.upsert).toHaveBeenCalledWith({
      where: { workspaceEmail: 'test@example.com' },
      update: {
        appRole: AppRole.ADMIN,
        name: 'Test User',
      },
      create: {
        workspaceEmail: 'test@example.com',
        name: 'Test User',
        appRole: AppRole.ADMIN,
      },
    });
  });

  it('does not print the actual email to console', async () => {
    await bootstrapAdmin(prismaMock, {
      INITIAL_ADMIN_EMAIL: 'secret@example.com',
      INITIAL_ADMIN_NAME: 'Admin',
    });

    const calls = consoleSpy.mock.calls as unknown as string[][];
    const logs = calls.map((call) => call.join(' ')).join(' ');
    expect(logs).not.toContain('secret@example.com');
    expect(logs).toContain(
      'Bootstrapping initial admin from environment variables.',
    );
  });
});
