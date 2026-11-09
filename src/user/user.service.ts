import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  private users = [
    {
      id: 1,
      userName: 'John Doe',
      email: 'jdoe@example.com',
    },
    {
      id: 2,
      userName: 'Bob',
      email: 'bob@example.com',
    },
    {
      id: 3,
      userName: 'Bill',
      email: 'bill@example.com',
    },
  ];

  findAll() {
    return this.users;
  }
}
