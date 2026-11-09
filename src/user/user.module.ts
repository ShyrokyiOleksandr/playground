import { Module } from '@nestjs/common';
import { UserService } from './user.service.js';
import { UserResolver } from './user.resolver.js';

@Module({
  providers: [UserResolver, UserService],
})
export class UserModule {}
