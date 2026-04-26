import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { extname } from 'node:path';
import { UsersRepository, type UserRecord } from './users.repository.js';
import { StorageService } from '../storage/storage.service.js';

const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const AVATAR_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
]);

export type UserWithImage = UserRecord & { imageUrl: string | null };

function isS3Key(value: string | null | undefined): value is string {
  return typeof value === 'string' && value.startsWith('avatars/');
}

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    private readonly storageService: StorageService,
  ) {}

  async getById(id: string): Promise<UserWithImage> {
    const user = await this.usersRepository.findById(id);

    if (!user) {
      throw new NotFoundException(`User ${id} not found`);
    }

    return this.resolveImage(user);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    if (file.size > AVATAR_MAX_BYTES) {
      throw new BadRequestException('Avatar must be smaller than 5 MB');
    }
    if (!AVATAR_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException(
        'Avatar must be a JPEG, PNG, WebP, or GIF image',
      );
    }

    const ext = extname(file.originalname).toLowerCase() || '.jpg';
    const key = `avatars/${userId}/${randomUUID()}${ext}`;

    await this.storageService.upload(key, file.buffer, file.mimetype);
    await this.usersRepository.updateImage(userId, key);

    const imageUrl = await this.storageService.getPresignedUrl(key, 3600);
    return { imageUrl };
  }

  private async resolveImage(user: UserRecord): Promise<UserWithImage> {
    if (isS3Key(user.image)) {
      try {
        const imageUrl = await this.storageService.getPresignedUrl(
          user.image,
          3600,
        );
        return { ...user, imageUrl };
      } catch {
        return { ...user, imageUrl: null };
      }
    }
    // External URL (e.g. Google OAuth profile photo) — use as-is
    return { ...user, imageUrl: user.image ?? null };
  }
}
