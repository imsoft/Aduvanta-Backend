import {
  Controller,
  Get,
  Post,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthGuard } from '../../common/guards/auth.guard.js';
import { RateLimit } from '../../common/rate-limit/rate-limit.decorator.js';
import { Session } from '../../common/decorators/session.decorator.js';
import type { ActiveSession } from '../../common/types/session.types.js';
import { UsersService, type UserWithImage } from './users.service.js';

interface MeResponse extends UserWithImage {
  isSystemAdmin: boolean;
}

@Controller('users')
@UseGuards(AuthGuard)
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get('me')
  async getMe(@Session() session: ActiveSession): Promise<MeResponse> {
    const user = await this.usersService.getById(session.user.id);
    return { ...user, isSystemAdmin: session.isSystemAdmin };
  }

  @Post('me/avatar')
  @RateLimit('mutation')
  @UseInterceptors(
    FileInterceptor('avatar', { storage: memoryStorage() }),
  )
  async uploadAvatar(
    @Session() session: ActiveSession,
    @UploadedFile() file: Express.Multer.File,
  ): Promise<{ imageUrl: string }> {
    return this.usersService.uploadAvatar(session.user.id, file);
  }
}
