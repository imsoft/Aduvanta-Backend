import { Injectable, NotFoundException } from '@nestjs/common';
import { UsersRepository, type UserRecord } from './users.repository.js';

@Injectable()
export class UsersService {
  constructor(private readonly usersRepository: UsersRepository) {}

  async getById(id: string): Promise<UserRecord> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return user;
  }
}
