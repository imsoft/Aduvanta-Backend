import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { Request } from 'express';
import type { ActiveSession } from '../types/session.types.js';

export const Session = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): ActiveSession => {
    const request = ctx
      .switchToHttp()
      .getRequest<Request & { activeSession: ActiveSession }>();

    return request.activeSession;
  },
);
