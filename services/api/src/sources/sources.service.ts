import { Injectable } from '@nestjs/common';

@Injectable()
export class SourcesService {
  getSources() {
    return [{ id: '1', name: 'Sample Source', trustScore: 0.95 }];
  }
}
