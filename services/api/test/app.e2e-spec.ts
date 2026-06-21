import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';
import * as jwt from 'jsonwebtoken';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { RedisService } from './../src/auth/redis.service';
import { JobsService } from './../src/jobs/jobs.service';

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

  describe('BullMQ Queues', () => {
    it('should enqueue and successfully process a fact-verification job under 500ms', async () => {
      const jobsService = app.get(JobsService);
      const startTime = Date.now();

      const { jobId } = await jobsService.enqueueVerification(
        'claim-123',
        'Verify this statement.',
      );
      expect(jobId).toBeDefined();

      // Poll for job completion
      let completed = false;
      let duration = 0;
      for (let attempt = 0; attempt < 50; attempt++) {
        const status = await jobsService.getJobStatus(jobId!);
        if (status && status.state === 'completed') {
          completed = true;
          expect(status.returnValue).toEqual({
            success: true,
            verdict: 'True',
            explanation: 'Verified via mock consumer',
          });
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 20));
        duration = Date.now() - startTime;
        if (duration > 1500) {
          break; // Avoid infinite loop in test
        }
      }

      expect(completed).toBe(true);
      // Verify latency under 500ms (excluding artificial processing delay of 50ms, so total queue overhead should be very low)
      expect(duration).toBeLessThan(500);
    });

    it('should retry a failing job and route it to the DLQ after retries exhaust', async () => {
      interface DlqJobPayload {
        originalJobId: string;
        failedReason: string;
      }

      const jobsService = app.get(JobsService);
      const dlqQueue = app.get<Queue>(getQueueToken('fact-verification-dlq'));

      // Clear DLQ first
      await dlqQueue.clean(0, 1000, 'completed');
      await dlqQueue.clean(0, 1000, 'failed');

      // Enqueue job with word 'fail' which triggers exception in consumer
      const { jobId } = await jobsService.enqueueVerification(
        'claim-fail-123',
        'This will fail.',
      );
      expect(jobId).toBeDefined();

      // Poll until the job is removed from main queue (indicating listener moved it to DLQ)
      let movedToDlq = false;
      for (let attempt = 0; attempt < 100; attempt++) {
        const status = await jobsService.getJobStatus(jobId!);
        const dlqJobs = await dlqQueue.getJobs([
          'waiting',
          'active',
          'delayed',
          'completed',
          'failed',
        ]);

        const hasDlqJob = dlqJobs.some(
          (j) => (j.data as DlqJobPayload).originalJobId === jobId,
        );
        if (hasDlqJob || !status) {
          movedToDlq = true;
          break;
        }
        await new Promise((resolve) => setTimeout(resolve, 50));
      }

      expect(movedToDlq).toBe(true);

      const dlqJobs = await dlqQueue.getJobs([
        'waiting',
        'active',
        'delayed',
        'completed',
        'failed',
      ]);
      const matchingDlqJob = dlqJobs.find(
        (j) => (j.data as DlqJobPayload).originalJobId === jobId,
      );
      expect(matchingDlqJob).toBeDefined();
      expect((matchingDlqJob!.data as DlqJobPayload).failedReason).toContain(
        'Intentional job failure',
      );
    });
  });

  afterEach(async () => {
    await app.close();
  });
});
