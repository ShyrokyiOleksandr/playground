import {
  createParamDecorator,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import type { Request } from 'express';
import type { User } from '../../generated/prisma/client.js';

export const Authorized = createParamDecorator(
  (data: keyof User | undefined, ctx: ExecutionContext) => {
    const user = ctx.switchToHttp().getRequest<Request>().user;

    if (!user) {
      throw new UnauthorizedException();
    }

    return data ? user[data] : user;
  },
);
