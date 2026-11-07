import { DocumentBuilder } from '@nestjs/swagger';

export function getSwaggerConfig() {
  return new DocumentBuilder()
    .setTitle('Awesome API')
    .setDescription('Simple and powerful REST API build with Nest ')
    .setVersion('1.0.0')
    .addBearerAuth()
    .build();
}
