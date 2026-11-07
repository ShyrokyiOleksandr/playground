import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, type JwtSignOptions } from '@nestjs/jwt';
import { hash, verify } from 'argon2';
import type { Request, Response } from 'express';
import { PrismaService } from '../prisma/prisma.service.js';
import { isDev } from '../util/is-dev.util.js';
import { LoginRequestDto } from './dto/login.request.dto.js';
import { RegisterRequestDto } from './dto/register.request.dto.js';
import type { JwtPayload } from './interfaces/jwt.interface.js';

@Injectable()
export class AuthService {
  private readonly JWT_ACCESS_TOKEN_EXPIRATION_TIME: JwtSignOptions['expiresIn'];
  private readonly JWT_REFRESH_TOKEN_EXPIRATION_TIME: JwtSignOptions['expiresIn'];
  private readonly COOKIE_DOMAIN: string;

  constructor(
    private readonly prismaService: PrismaService,
    private readonly configService: ConfigService,
    private readonly jwtService: JwtService,
  ) {
    this.JWT_ACCESS_TOKEN_EXPIRATION_TIME = configService.getOrThrow<
      JwtSignOptions['expiresIn']
    >('JWT_ACCESS_TOKEN_EXPIRATION_TIME');
    this.JWT_REFRESH_TOKEN_EXPIRATION_TIME = configService.getOrThrow<
      JwtSignOptions['expiresIn']
    >('JWT_REFRESH_TOKEN_EXPIRATION_TIME');
    this.COOKIE_DOMAIN = configService.getOrThrow<string>('COOKIE_DOMAIN');
  }

  async register(res: Response, registerRequestDto: RegisterRequestDto) {
    const { name, email, password } = registerRequestDto;

    const existingUser = await this.prismaService.user.findUnique({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const user = await this.prismaService.user.create({
      data: { name, email, password: await hash(password) },
    });
    return this.auth(res, user.id);
  }

  async login(res: Response, loginRequestDto: LoginRequestDto) {
    const { email, password } = loginRequestDto;

    const user = await this.prismaService.user.findUnique({
      where: { email },
      select: { id: true, password: true },
    });

    if (!user) {
      throw new NotFoundException('User is not found');
    }

    const isValidPassword = await verify(user.password, password);

    if (!isValidPassword) {
      throw new NotFoundException('User is not found');
    }

    return this.auth(res, user.id);
  }

  async refresh(req: Request, res: Response) {
    const refreshToken = req.cookies['refreshToken'];
    if (!refreshToken) {
      throw new UnauthorizedException('Refresh token is absent');
    }
    const payload: JwtPayload = await this.jwtService.verifyAsync(refreshToken);
    if (payload) {
      const user = await this.prismaService.user.findUnique({
        where: { id: payload.id },
        select: { id: true },
      });
      if (!user) {
        throw new NotFoundException('User not found');
      }
      return this.auth(res, user.id);
    }
  }

  async logout(res: Response) {
    // Delete refreshToken from cookies
    this.setCookie(res, 'refreshToken', new Date(0));
    return true;
  }

  private auth(res: Response, id: string) {
    const { accessToken, refreshToken } = this.generateTokens(id);
    this.setCookie(res, refreshToken, new Date(Date.now() + 60 * 60 * 24 * 7));
    return { accessToken };
  }

  private generateTokens(id: string) {
    const payload: JwtPayload = { id };
    const accessToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_ACCESS_TOKEN_EXPIRATION_TIME,
    });
    const refreshToken = this.jwtService.sign(payload, {
      expiresIn: this.JWT_REFRESH_TOKEN_EXPIRATION_TIME,
    });

    return { accessToken, refreshToken };
  }

  private setCookie(res: Response, value: string, expires: Date) {
    res.cookie('refreshToken', value, {
      httpOnly: true,
      domain: this.COOKIE_DOMAIN,
      expires,
      secure: !isDev(this.configService),
      sameSite: isDev(this.configService) ? 'none' : 'lax',
    });
  }
}
