import { Injectable, Logger } from '@nestjs/common';
import * as dns from 'dns';
import * as net from 'net';
import * as http from 'http';
import * as https from 'https';

@Injectable()
export class SafeFetcherService {
  private readonly logger = new Logger(SafeFetcherService.name);
  private readonly allowedDomains: Set<string>;

  constructor() {
    const envDomains = process.env.ALLOWED_DOMAINS
      ? process.env.ALLOWED_DOMAINS.split(',').map((d) =>
          d.trim().toLowerCase(),
        )
      : ['verificat.xyz', 'wikipedia.org', 'gov.ro', 'senat.ro', 'cdep.ro'];
    this.allowedDomains = new Set(envDomains);
  }

  isPrivateIp(ip: string): boolean {
    if (net.isIPv4(ip)) {
      const parts = ip.split('.').map(Number);
      if (parts[0] === 127) return true;
      if (parts[0] === 10) return true;
      if (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) return true;
      if (parts[0] === 192 && parts[1] === 168) return true;
      if (parts[0] === 169 && parts[1] === 254) return true;
      if (parts[0] === 0) return true;
    } else if (net.isIPv6(ip)) {
      const normalized = ip.toLowerCase();
      if (normalized === '::1' || normalized === '0:0:0:0:0:0:0:1') return true;
      if (normalized.startsWith('fe80:')) return true;
      const firstTwo = normalized.substring(0, 2);
      if (firstTwo === 'fc' || firstTwo === 'fd') return true;
    }
    return false;
  }

  async validateUrl(urlStr: string): Promise<{ hostname: string; ip: string }> {
    const url = new URL(urlStr);
    const hostname = url.hostname.toLowerCase();

    const domainMatched = Array.from(this.allowedDomains).some(
      (domain) => hostname === domain || hostname.endsWith(`.${domain}`),
    );
    if (!domainMatched) {
      throw new Error(`Domain "${hostname}" is not allowlisted.`);
    }

    return new Promise((resolve, reject) => {
      dns.lookup(url.hostname, (err, address) => {
        if (err) {
          return reject(
            new Error(
              `Failed to resolve hostname "${url.hostname}": ${err.message}`,
            ),
          );
        }
        if (this.isPrivateIp(address)) {
          return reject(
            new Error(`Access to private IP "${address}" is blocked.`),
          );
        }
        resolve({ hostname, ip: address });
      });
    });
  }

  async fetchSafe(urlStr: string): Promise<string> {
    await this.validateUrl(urlStr);

    const url = new URL(urlStr);
    const options: https.RequestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname + url.search,
      method: 'GET',
      headers: {
        Host: url.hostname,
        'User-Agent': 'Verificat-SafeFetcher/1.0',
      },
      lookup: (hostname, lookupOptions, callback) => {
        dns.lookup(hostname, lookupOptions, (err, address, family) => {
          if (err) return callback(err, '', 4);
          const ipAddr =
            typeof address === 'string' ? address : address[0]?.address;
          if (this.isPrivateIp(ipAddr)) {
            return callback(
              new Error(`Access to private IP "${ipAddr}" is blocked.`),
              '',
              4,
            );
          }
          callback(null, ipAddr, family);
        });
      },
    };

    const lib = url.protocol === 'https:' ? https : http;

    return new Promise((resolve, reject) => {
      const req = lib.request(options, (res) => {
        let data = '';
        res.on('data', (chunk: Buffer | string) => {
          data += chunk.toString();
        });
        res.on('end', () => {
          resolve(data);
        });
      });

      req.on('error', (err) => {
        reject(err);
      });

      req.end();
    });
  }
}
