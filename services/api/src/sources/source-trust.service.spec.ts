/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { SourceTrustService } from './source-trust.service';
import { RedisService } from '../auth/redis.service';
import { SupabaseService } from '../supabase/supabase.service';

describe('SourceTrustService', () => {
  let service: SourceTrustService;
  let redisClientMock: any;
  let supabaseClientMock: any;

  beforeEach(async () => {
    // Mock Redis Client
    redisClientMock = {
      get: jest.fn(),
      set: jest.fn(),
    };

    const mockRedisService = {
      getClient: () => redisClientMock,
    };

    // Mock Supabase Client
    supabaseClientMock = {
      from: jest.fn().mockReturnThis(),
      select: jest.fn().mockReturnThis(),
      or: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      maybeSingle: jest.fn(),
    };

    const mockSupabaseService = {
      getClient: () => supabaseClientMock,
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        SourceTrustService,
        { provide: RedisService, useValue: mockRedisService },
        { provide: SupabaseService, useValue: mockSupabaseService },
      ],
    }).compile();

    service = module.get<SourceTrustService>(SourceTrustService);
  });

  it('should score a government source high using fallback rules', async () => {
    redisClientMock.get.mockResolvedValue(null);
    supabaseClientMock.maybeSingle.mockResolvedValue({ data: null, error: null });

    const result = await service.getSourceTrust('https://example.gov.ro/some/page');
    expect(result.score).toBe(95);
    expect(result.reason).toContain('guvernamentală');
  });

  it('should override score if source is found in Supabase database', async () => {
    redisClientMock.get.mockResolvedValue(null);
    supabaseClientMock.maybeSingle.mockResolvedValue({
      data: { trust_score: 92, name: 'Database Override Source' },
      error: null,
    });

    const result = await service.getSourceTrust('https://custom-source.ro');
    expect(result.score).toBe(92);
    expect(result.reason).toContain('Override Source');
  });

  it('should serve score from Redis cache if available (cache-first)', async () => {
    const cachedResult = { score: 88, reason: 'Cached result reason' };
    redisClientMock.get.mockResolvedValue(JSON.stringify(cachedResult));

    const result = await service.getSourceTrust('https://some-cached-domain.org');
    
    // Assert cache hit
    expect(result.score).toBe(88);
    expect(result.reason).toBe('Cached result reason');

    // Ensure database was NOT queried due to cache-first posture
    expect(supabaseClientMock.from).not.toHaveBeenCalled();
  });
});
