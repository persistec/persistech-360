import { Test, TestingModule } from '@nestjs/testing';
import {
  INestApplication,
  VersioningType,
  ValidationPipe,
  ExecutionContext,
} from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { AllExceptionsFilter } from '../src/common/filters/http-exception.filter';
import { PrismaService } from '../src/database/prisma.service';
import { AuthGuard, AppRoleGuard } from '../src/auth';
import { App } from 'supertest/types';

describe('Error Normalization (e2e)', () => {
  let app: INestApplication<App>;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        user: {
          findUnique: jest
            .fn()
            .mockResolvedValue({ id: 'admin-id', appRole: 'ADMIN' }),
        },
        department: {
          findUnique: jest.fn().mockResolvedValue(null),
        },
      })
      .overrideGuard(AuthGuard)
      .useValue({
        canActivate: (context: ExecutionContext) => {
          const req = context
            .switchToHttp()
            .getRequest<Record<string, unknown>>();
          req['user'] = { id: 'admin-id', appRole: 'ADMIN' };
          return true;
        },
      })
      .overrideGuard(AppRoleGuard)
      .useValue({ canActivate: () => true })
      .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }),
    );

    app.useGlobalFilters(new AllExceptionsFilter());

    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('GET /api/v1/nonexistent - Route not found returns normalized 404', () => {
    return request(app.getHttpServer())
      .get('/api/v1/nonexistent')
      .expect(404)
      .expect((res) => {
        const body = res.body as {
          statusCode: number;
          error: string;
          message: string;
          path: string;
          timestamp: string;
        };
        expect(body.statusCode).toBe(404);
        expect(body.error).toBe('Not Found');
        expect(body.message).toBe('Cannot GET /api/v1/nonexistent');
        expect(body.path).toBe('/api/v1/nonexistent');
        expect(body.timestamp).toBeDefined();
        expect(isNaN(Date.parse(body.timestamp))).toBe(false);
      });
  });

  it('POST /api/v1/departments - Validation error preserves useful messages and returns normalized 400', () => {
    return request(app.getHttpServer())
      .post('/api/v1/departments')
      .set('x-user-id', 'admin-id')
      .send({ invalidField: 'test' })
      .expect(400)
      .expect((res) => {
        const body = res.body as {
          statusCode: number;
          error: string;
          message: string;
          path: string;
          timestamp: string;
        };
        expect(body.statusCode).toBe(400);
        expect(body.error).toBe('Bad Request');
        expect(body.message).toContain('name must be a string');
        expect(body.path).toBe('/api/v1/departments');
        expect(body.timestamp).toBeDefined();
      });
  });
});
