/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  ValidationPipe,
  VersioningType,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { AuthGuard, AppRoleGuard } from '../src/auth';
import { Prisma } from '@prisma/client';
import { App } from 'supertest/types';

describe('DepartmentsController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaMock: any;

  beforeEach(async () => {
    prismaMock = {
      department: {
        findMany: jest.fn().mockResolvedValue([]),
        findUnique: jest.fn().mockImplementation(({ where }) => {
          if (where.name === 'New Dept') return null; // allow creation
          return {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'Old Dept',
          };
        }),
        create: jest.fn().mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'New Dept',
        }),
        update: jest.fn().mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Updated Dept',
        }),
        delete: jest.fn().mockResolvedValue({
          id: '123e4567-e89b-12d3-a456-426614174000',
          name: 'Deleted Dept',
        }),
        count: jest.fn().mockResolvedValue(0),
      },
      user: {
        findUnique: jest
          .fn()
          .mockResolvedValue({ id: 'admin-id', appRole: 'ADMIN' }),
        count: jest.fn().mockResolvedValue(0),
      },
      role: {
        count: jest.fn().mockResolvedValue(0),
      },
    };

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue(prismaMock)
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context) => {
          const req = context.switchToHttp().getRequest();
          req.user = { id: 'admin-id', appRole: 'ADMIN' };
          return true;
        },
      })
      .overrideGuard(AppRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );
    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/departments (GET) responds list', () => {
    return request(app.getHttpServer())
      .get('/api/v1/departments')
      .expect(200)
      .expect([]);
  });

  it('/api/v1/departments (POST) creates valid department', () => {
    return request(app.getHttpServer())
      .post('/api/v1/departments')
      .set('x-user-id', 'admin-id')
      .send({ name: 'New Dept' })
      .expect(201)
      .expect((res) => {
        expect(res.body.name).toBe('New Dept');
      });
  });

  it('/api/v1/departments (POST) with invalid payload returns expected error', () => {
    return request(app.getHttpServer())
      .post('/api/v1/departments')
      .set('x-user-id', 'admin-id')
      .send({ unknown_field: 'Invalid' })
      .expect(400)
      .expect((res) => {
        expect(res.body.message).toEqual(
          expect.arrayContaining([expect.stringContaining('name')]),
        );
      });
  });

  it('/api/v1/departments/:id (PATCH) updates department', () => {
    return request(app.getHttpServer())
      .patch('/api/v1/departments/123e4567-e89b-12d3-a456-426614174000')
      .set('x-user-id', 'admin-id')
      .send({ name: 'Updated Dept' })
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Updated Dept');
      });
  });

  it('/api/v1/departments/:id (DELETE) deletes department', () => {
    return request(app.getHttpServer())
      .delete('/api/v1/departments/123e4567-e89b-12d3-a456-426614174000')
      .set('x-user-id', 'admin-id')
      .expect(200)
      .expect((res) => {
        expect(res.body.name).toBe('Deleted Dept');
      });
  });

  it('/api/v1/departments/:id (DELETE) returns controlled error on dependencies (Prisma error conversion)', () => {
    prismaMock.department.delete.mockRejectedValueOnce(
      new Prisma.PrismaClientKnownRequestError(
        'Foreign key constraint failed',
        {
          code: 'P2003',
          clientVersion: '1.0',
        },
      ),
    );

    return request(app.getHttpServer())
      .delete('/api/v1/departments/123e4567-e89b-12d3-a456-426614174000')
      .set('x-user-id', 'admin-id')
      .expect(400) // Expecting the application to map Prisma constraint errors to 400 Bad Request
      .expect((res) => {
        expect(res.body.message).toContain('relat');
      });
  });
});
