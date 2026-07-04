import { Injectable, NestMiddleware } from '@nestjs/common';
import { Request, Response, NextFunction } from 'express';
import { MetricsService } from './metrics.service';

@Injectable()
export class MetricsMiddleware implements NestMiddleware {
  constructor(private readonly metrics: MetricsService) {}

  use(req: Request, res: Response, next: NextFunction) {
    if (req.path === '/metrics') {
      return next();
    }

    const start = process.hrtime();

    res.on('finish', () => {
      const diff = process.hrtime(start);
      const duration = diff[0] + diff[1] / 1e9;

      const route: string = req.route
        ? (req.route as { path: string }).path
        : req.baseUrl || req.path;

      this.metrics.httpRequestsTotal.inc({
        method: req.method,
        route,
        status_code: res.statusCode.toString(),
      });

      this.metrics.httpRequestDurationSeconds.observe(
        {
          method: req.method,
          route,
          status_code: res.statusCode.toString(),
        },
        duration,
      );
    });

    next();
  }
}
