import { Query, Resolver } from '@nestjs/graphql';
import { UserModel } from './models/user.model.js';
import { UserService } from './user.service.js';

@Resolver()
export class UserResolver {
  constructor(private readonly userService: UserService) {}

  @Query(() => [UserModel])
  getUsers() {
    return this.userService.findAll();
  }
}
