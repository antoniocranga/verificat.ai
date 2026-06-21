import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as jwt from 'jsonwebtoken';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { RedisService } from './../src/auth/redis.service';

describe('API Integration (e2e)', () => {
  let app: INestApplication<App>;
  let validToken: string;

  beforeAll(() => {
    process.env.THROTTLE_LIMIT = '5';
    process.env.THROTTLE_TTL = '5000';
    const secret = process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev';
    validToken = jwt.sign(
      { sub: 'test-user-id', email: 'test@verificat.xyz' },
      secret,
    );
  });

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();

    // Flush Redis database before each test to start with a clean rate limiter state
    const redisService = app.get(RedisService);
    await redisService.getClient().flushall();
  });

  it('/ (GET) - public endpoint', () => {
    return request(app.getHttpServer())
      .get('/')
      .expect(200)
      .expect('Hello World!');
  });

  it('should rate limit requests and return 429 when threshold exceeded', async () => {
    for (let i = 0; i < 5; i++) {
      await request(app.getHttpServer()).get('/').expect(200);
    }
    await request(app.getHttpServer()).get('/').expect(429);
  });

  it('/users/profile (GET) - protected endpoint without token returns 401', () => {
    return request(app.getHttpServer()).get('/users/profile').expect(401);
  });

  it('/users/profile (GET) - protected endpoint with token returns 200', () => {
    return request(app.getHttpServer())
      .get('/users/profile')
      .set('Authorization', `Bearer ${validToken}`)
      .expect(200)
      .expect((res) => {
        expect(res.body).toHaveProperty('id', 'test-user-id');
      });
  });

  it('/users/test-validation (POST) - fails validation with 400', () => {
    return request(app.getHttpServer())
      .post('/users/test-validation')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ email: 'invalid-email', name: '' })
      .expect(400)
      .expect((res) => {
        expect(res.body).toHaveProperty('error', 'Bad Request');
        expect(res.body).toHaveProperty('message');
      });
  });

  it('/users/test-validation (POST) - passes validation with 201', () => {
    return request(app.getHttpServer())
      .post('/users/test-validation')
      .set('Authorization', `Bearer ${validToken}`)
      .send({ email: 'test@verificat.xyz', name: 'John Doe' })
      .expect(201)
      .expect((res) => {
        expect(res.body).toEqual({
          success: true,
          email: 'test@verificat.xyz',
          name: 'John Doe',
        });
      });
  });

  afterEach(async () => {
    await app.close();
  });
});
