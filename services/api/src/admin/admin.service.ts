import { Injectable } from '@nestjs/common';

@Injectable()
export class AdminService {
  getStats() {
    return { usersCount: 100, pendingFactChecks: 5 };
  }
}
