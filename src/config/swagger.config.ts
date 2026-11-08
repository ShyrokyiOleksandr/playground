import { DocumentBuilder } from '@nestjs/swagger';

export const SWAGGER_ACCESS_TOKEN = 'access-token';
export const SWAGGER_REFRESH_COOKIE = 'refreshToken';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Playground API')
    .setDescription(
      [
        'REST API playground built with NestJS.',
        '',
        '### Authentication',
        '- **Access token** — returned in the JSON body. Send it as `Authorization: Bearer <token>`.',
        '- **Refresh token** — set as an `HttpOnly` cookie named `refreshToken` (7 days). After login or register in Swagger, the browser sends it automatically on the same origin.',
        '',
        '### Flow',
        '1. Register or log in',
        '2. Copy `accessToken` into **Authorize** for protected routes',
        '3. Call **refresh** when the access token expires',
        '4. Call **logout** to clear the refresh cookie',
      ].join('\n'),
    )
    .setVersion('1.0.0')
    .addTag('App', 'Service health and root')
    .addTag('Auth', 'Register, login, token refresh and logout')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        description: 'JWT access token from login or register',
      },
      SWAGGER_ACCESS_TOKEN,
    )
    .addCookieAuth(
      'refreshToken',
      {
        type: 'apiKey',
        description:
          'HttpOnly refresh token cookie issued on login or register',
      },
      SWAGGER_REFRESH_COOKIE,
    )
    .addServer('http://localhost:3000', 'Local')
    .build();
}
