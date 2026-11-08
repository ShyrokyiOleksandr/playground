import {
  Body,
  Controller,
  HttpCode,
  HttpStatus,
  Post,
  Req,
  Res,
} from '@nestjs/common';
import {
  ApiBadRequestResponse,
  ApiConflictResponse,
  ApiCookieAuth,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiUnauthorizedResponse,
} from '@nestjs/swagger';
import type { Request, Response } from 'express';
import { SWAGGER_REFRESH_COOKIE } from '../config/swagger.config.js';
import { AuthService } from './auth.service.js';
import { AuthResponseDto } from './dto/auth.response.dto.js';
import { LoginRequestDto } from './dto/login.request.dto.js';
import { RegisterRequestDto } from './dto/register.request.dto.js';

const refreshCookieHeader = {
  'Set-Cookie': {
    description:
      'HttpOnly `refreshToken` cookie. Used by `/auth/refresh` and `/auth/logout`.',
    schema: {
      type: 'string',
      example:
        'refreshToken=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...; Path=/; HttpOnly; SameSite=Lax',
    },
  },
};

@ApiTags('Auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Register',
    description:
      'Creates a user, returns an access token, and sets a `refreshToken` cookie.',
  })
  @ApiCreatedResponse({
    type: AuthResponseDto,
    description: 'Account created. Refresh token is set as an HttpOnly cookie.',
    headers: refreshCookieHeader,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiConflictResponse({ description: 'Email is already registered' })
  async register(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: RegisterRequestDto,
  ) {
    return this.authService.register(res, dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Login',
    description:
      'Validates credentials, returns an access token, and sets a `refreshToken` cookie.',
  })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'Authenticated. Refresh token is set as an HttpOnly cookie.',
    headers: refreshCookieHeader,
  })
  @ApiBadRequestResponse({ description: 'Validation failed' })
  @ApiNotFoundResponse({ description: 'User is not found or password is invalid' })
  async login(
    @Res({ passthrough: true }) res: Response,
    @Body() dto: LoginRequestDto,
  ) {
    return this.authService.login(res, dto);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(SWAGGER_REFRESH_COOKIE)
  @ApiOperation({
    summary: 'Refresh tokens',
    description:
      'Reads the `refreshToken` cookie, issues a new access token, and rotates the refresh cookie.',
  })
  @ApiOkResponse({
    type: AuthResponseDto,
    description: 'Tokens rotated. A new refresh cookie is set.',
    headers: refreshCookieHeader,
  })
  @ApiUnauthorizedResponse({ description: 'Refresh token is missing or invalid' })
  @ApiNotFoundResponse({ description: 'User from the token no longer exists' })
  async refresh(
    @Res({ passthrough: true }) res: Response,
    @Req() req: Request,
  ) {
    return this.authService.refresh(req, res);
  }

  @Post('logout')
  @HttpCode(HttpStatus.OK)
  @ApiCookieAuth(SWAGGER_REFRESH_COOKIE)
  @ApiOperation({
    summary: 'Logout',
    description: 'Clears the `refreshToken` cookie.',
  })
  @ApiOkResponse({
    description: 'Refresh cookie cleared',
    schema: { type: 'boolean', example: true },
  })
  async logout(@Res({ passthrough: true }) res: Response) {
    return this.authService.logout(res);
  }
}
