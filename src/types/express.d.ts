import type { User as PrismaUser } from '../generated/prisma/client.js';

declare global {
  namespace Express {
    // Passport's empty User is filled with the Prisma model
    interface User extends PrismaUser {}
  }
}

export {};
