/* eslint-disable @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access, @typescript-eslint/no-unsafe-return */
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, VersioningType } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

jest.setTimeout(30000);

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
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

  it('/api/v1/auth/me (GET) - fails without session cookie', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });

  it('/api/v1/departments (GET) - fails with only x-user-id header', () => {
    return request(app.getHttpServer())
      .get('/api/v1/departments')
      .set('x-user-id', 'admin-uuid')
      .expect(401);
  });

  it('/api/v1/departments (GET) - fails without session', () => {
    return request(app.getHttpServer()).get('/api/v1/departments').expect(401);
  });
});
