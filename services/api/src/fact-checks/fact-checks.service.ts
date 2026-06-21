import { Injectable } from '@nestjs/common';

@Injectable()
export class FactChecksService {
  getLatestChecks() {
    return [
      {
        id: '1',
        claim: 'Sample claim',
        verdict: 'True',
        explanation: 'Sample explanation',
      },
    ];
  }
}
