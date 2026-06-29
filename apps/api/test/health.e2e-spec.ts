import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';
import { PrismaService } from '../src/database/prisma.service';
import { App } from 'supertest/types';

describe('HealthController (e2e)', () => {
  let app: INestApplication<App>;
  let prismaService: PrismaService;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(PrismaService)
      .useValue({
        $queryRaw: jest.fn().mockResolvedValue([1]),
      })
      .compile();

    app = moduleFixture.createNestApplication();

    app.setGlobalPrefix('api');
    app.enableVersioning({
      type: VersioningType.URI,
      defaultVersion: '1',
    });

    await app.init();
    prismaService = moduleFixture.get<PrismaService>(PrismaService);
  });

  afterEach(async () => {
    await app.close();
  });

  it('/api/v1/health (GET) - Success', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        const body = res.body as { status: string; database: string };
        expect(body.status).toBe('UP');
        expect(body.database).toBe('UP');
      });
  });

  it('/api/v1/health (GET) - DB Down', () => {
    jest
      .spyOn(prismaService, '$queryRaw')
      .mockRejectedValueOnce(new Error('Connection failed'));
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(500)
      .expect((res) => {
        const body = res.body as {
          status: string;
          database: string;
          error: string;
        };
        expect(body.status).toBe('DOWN');
        expect(body.database).toBe('DOWN');
        expect(body.error).toBe('Connection failed');
      });
  });
});
