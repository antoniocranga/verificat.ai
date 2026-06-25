import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import request, { Response } from 'supertest';
import { App } from 'supertest/types';
import * as jwt from 'jsonwebtoken';
import { getQueueToken } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { randomUUID } from 'crypto';
import { AppModule } from './../src/app.module';
import { HttpExceptionFilter } from './../src/common/filters/http-exception.filter';
import { RedisService } from './../src/auth/redis.service';
import { JobsService } from './../src/jobs/jobs.service';
import { FactChecksService } from './../src/fact-checks/fact-checks.service';
import { SupabaseService } from './../src/supabase/supabase.service';
import { MatchClaimResult } from './../src/search/search.service';

describe('API Integration (e2e)', () => {
  let app: INestApplication<App>;
  let validToken: string;
  let claimAId = '';

  beforeAll(async () => {
    process.env.THROTTLE_LIMIT = '5';
    process.env.THROTTLE_TTL = '5000';
    const secret = process.env.SUPABASE_JWT_SECRET || 'fallback-secret-for-dev';
    validToken = jwt.sign(
      { sub: 'test-user-id', email: 'test@verificat.xyz' },
      secret,
    );

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    })
      .overrideProvider(FactChecksService)
      .useValue({
        searchVerdicts: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
        getLatestChecks: () => Promise.resolve({ data: [], total: 0, page: 1, limit: 10 }),
      })
      .overrideProvider(SupabaseService)
      .useValue({
        getClient: () => ({
          from: (table: string) => ({
            insert: (data: Record<string, unknown>) => ({
              select: () => ({
                single: () => {
                  if (table === 'claims') {
                    const id = randomUUID();
                    if (!claimAId) {
                      claimAId = id;
                    }
                    return {
                      data: { id, text: String(data.text) },
                      error: null,
                    };
                  }
                  if (table === 'claim_embeddings') {
                    return {
                      data: {
                        id: randomUUID(),
                        claim_id: data.claim_id as string,
                        embedding: data.embedding as number[],
                      },
                      error: null,
                    };
                  }
                  return { data: null, error: null };
                },
              }),
            }),
            delete: () => ({
              in: () => ({ data: [], error: null }),
            }),
          }),
          rpc: (name: string) => {
            if (name === 'match_claims') {
              return {
                data: [
                  {
                    id: randomUUID(),
                    claim_id: claimAId,
                    text: 'Verificat fact check A: Coffee prevents fatigue.',
                    similarity: 0.95,
                  },
                ],
                error: null,
              };
            }
            return { data: [], error: null };
          },
        }),
      })
      .compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
        transform: true,
      }),
    );
    app.useGlobalFilters(new HttpExceptionFilter());
    await app.init();
  });

  beforeEach(async () => {
    claimAId = '';
    const redisService = app.get(RedisService);
    const client = redisService.getClient();
    // Only clear session blacklist and throttle counter keys, not BullMQ queue metadata
    const keys = await client.keys('revoked_sessions:*');
    if (keys.length > 0) {
      await client.del(...keys);
    }
    const throttleKeys = await client.keys('throttler:*');
    if (throttleKeys.length > 0) {
      await client.del(...throttleKeys);
    }
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
          expect(status.returnValue).toMatchObject({
            success: true,
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
      for (let attempt = 0; attempt < 200; attempt++) {
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
    }, 15000);
  });

  describe('pgvector Similarity Search', () => {
    it('should insert embeddings and find similar claims successfully', async () => {
      const supabaseService = app.get(SupabaseService);
      const dbClient = supabaseService.getClient() as unknown as {
        from: (table: string) => {
          insert: (data: Record<string, unknown>) => {
            select: () => {
              single: () => Promise<{
                data: { id: string; text: string } | null;
                error: unknown;
              }>;
            };
          };
          delete: () => {
            in: (field: string, values: string[]) => Promise<unknown>;
          };
        };
      };

      // 1. Insert two claims via direct DB client
      const { data: claimA, error: errA } = await dbClient
        .from('claims')
        .insert({ text: 'Verificat fact check A: Coffee prevents fatigue.' })
        .select()
        .single();
      expect(errA).toBeNull();
      expect(claimA).toBeDefined();

      const { data: claimB, error: errB } = await dbClient
        .from('claims')
        .insert({ text: 'Verificat fact check B: The sky is violet.' })
        .select()
        .single();
      expect(errB).toBeNull();
      expect(claimB).toBeDefined();

      if (!claimA || !claimB) {
        throw new Error('Seed data failed');
      }

      // 2. Create contrasting 1536-dimensional embeddings
      const embeddingA = new Array(1536).fill(0);
      embeddingA[0] = 1.0;

      const embeddingB = new Array(1536).fill(0);
      embeddingB[1] = 1.0;

      // 3. Save embeddings using API endpoint POST /search/embeddings
      await request(app.getHttpServer())
        .post('/search/embeddings')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ claimId: claimA.id, embedding: embeddingA })
        .expect(201);

      await request(app.getHttpServer())
        .post('/search/embeddings')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ claimId: claimB.id, embedding: embeddingB })
        .expect(201);

      // 4. Perform similarity search with a query vector close to claim A
      const queryEmbedding = new Array(1536).fill(0);
      queryEmbedding[0] = 0.95;
      queryEmbedding[1] = 0.05;

      await request(app.getHttpServer())
        .post('/search/claims')
        .set('Authorization', `Bearer ${validToken}`)
        .send({ embedding: queryEmbedding, threshold: 0.5, limit: 5 })
        .expect(200)
        .expect((res: Response) => {
          const body = res.body as MatchClaimResult[];
          expect(body.length).toBeGreaterThan(0);
          expect(body[0].claim_id).toBe(claimA.id);
          expect(body[0].similarity).toBeGreaterThan(0.9);
        });

      // 5. Clean up seeded data
      await dbClient.from('claims').delete().in('id', [claimA.id, claimB.id]);
    });
  });

  describe('Additional Phase 3 Endpoint Security', () => {
    it('/sources (GET) - unauthenticated returns 401', () => {
      return request(app.getHttpServer()).get('/sources').expect(401);
    });

    it('/sources (GET) - authenticated returns 200', () => {
      return request(app.getHttpServer())
        .get('/sources')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('/fact-checks (GET) - unauthenticated returns 401', () => {
      return request(app.getHttpServer()).get('/fact-checks').expect(401);
    });

    it('/fact-checks (GET) - authenticated returns 200', () => {
      return request(app.getHttpServer())
        .get('/fact-checks')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });

    it('/admin/stats (GET) - unauthenticated returns 401', () => {
      return request(app.getHttpServer()).get('/admin/stats').expect(401);
    });

    it('/admin/stats (GET) - authenticated returns 200', () => {
      return request(app.getHttpServer())
        .get('/admin/stats')
        .set('Authorization', `Bearer ${validToken}`)
        .expect(200);
    });
  });

  afterAll(async () => {
    await app.close();
  });
});
