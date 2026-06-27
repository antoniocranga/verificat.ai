/* eslint-disable */
import { Test, TestingModule } from '@nestjs/testing';
import { SafeFetcherService } from './safe-fetcher.service';
import * as dns from 'dns';

jest.mock('dns', () => {
  const original = jest.requireActual('dns');
  return {
    ...original,
    lookup: jest.fn(),
  };
});

describe('SafeFetcherService', () => {
  let service: SafeFetcherService;
  let mockLookup: jest.Mock;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SafeFetcherService],
    }).compile();

    service = module.get<SafeFetcherService>(SafeFetcherService);
    mockLookup = dns.lookup as unknown as jest.Mock;
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('isPrivateIp', () => {
    it('should identify private IPv4 ranges', () => {
      expect(service.isPrivateIp('127.0.0.1')).toBe(true);
      expect(service.isPrivateIp('10.0.0.1')).toBe(true);
      expect(service.isPrivateIp('172.16.1.1')).toBe(true);
      expect(service.isPrivateIp('172.31.255.255')).toBe(true);
      expect(service.isPrivateIp('192.168.1.100')).toBe(true);
      expect(service.isPrivateIp('169.254.10.10')).toBe(true);
      expect(service.isPrivateIp('0.0.0.0')).toBe(true);
    });

    it('should identify private IPv6 ranges', () => {
      expect(service.isPrivateIp('::1')).toBe(true);
      expect(service.isPrivateIp('0:0:0:0:0:0:0:1')).toBe(true);
      expect(service.isPrivateIp('fe80::1')).toBe(true);
      expect(service.isPrivateIp('fc00::')).toBe(true);
      expect(service.isPrivateIp('fd12:3456:789a::1')).toBe(true);
    });

    it('should pass public IPs', () => {
      expect(service.isPrivateIp('8.8.8.8')).toBe(false);
      expect(service.isPrivateIp('1.1.1.1')).toBe(false);
      expect(service.isPrivateIp('178.104.192.62')).toBe(false);
      expect(service.isPrivateIp('2001:4860:4860::8888')).toBe(false);
    });
  });

  describe('validateUrl', () => {
    it('should reject non-allowlisted domains', async () => {
      await expect(
        service.validateUrl('https://evil-hacker.com/malicious'),
      ).rejects.toThrow('Domain "evil-hacker.com" is not allowlisted.');
    });

    it('should allow allowlisted domains with public IPs', async () => {
      mockLookup.mockImplementation((hostname, options, cb) => {
        const callback = typeof options === 'function' ? options : cb;
        callback(null, '8.8.8.8', 4);
      });

      const res = await service.validateUrl('https://gov.ro/ro/guvernul');
      expect(res.hostname).toBe('gov.ro');
      expect(res.ip).toBe('8.8.8.8');
    });

    it('should block allowlisted domains resolving to private IPs (SSRF check)', async () => {
      mockLookup.mockImplementation((hostname, options, cb) => {
        const callback = typeof options === 'function' ? options : cb;
        callback(null, '127.0.0.1', 4);
      });

      await expect(
        service.validateUrl('https://gov.ro/internal-admin'),
      ).rejects.toThrow('Access to private IP "127.0.0.1" is blocked.');
    });
  });

  describe('fetchSafe', () => {
    it('should prevent connecting to private IPs via custom lookup agent', async () => {
      mockLookup.mockImplementation((hostname, options, cb) => {
        const callback = typeof options === 'function' ? options : cb;
        callback(null, '127.0.0.1', 4);
      });

      await expect(service.fetchSafe('https://gov.ro/status')).rejects.toThrow();
    });
  });
});
