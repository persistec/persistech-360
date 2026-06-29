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

  afterAll(async () => {
    await app.close();
  });

  it('/api/v1/health (GET) - Success', () => {
    return request(app.getHttpServer())
      .get('/api/v1/health')
      .expect(200)
      .expect((res) => {
        expect(res.body.status).toBe('UP');
        expect(res.body.database).toBe('UP');
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
        expect(res.body.status).toBe('DOWN');
        expect(res.body.database).toBe('DOWN');
        expect(res.body.error).toBe('Connection failed');
      });
  });
});
