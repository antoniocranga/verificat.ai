import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfile(userId: string) {
    return { id: userId, email: 'user@verificat.xyz', name: 'Sample User' };
  }
}
