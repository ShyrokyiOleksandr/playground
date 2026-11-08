import { INestApplication } from '@nestjs/common';
import { OpenAPIObject, SwaggerModule } from '@nestjs/swagger';
import { getSwaggerConfig } from '../config/swagger.config.js';

const PATH_ORDER = [
  '/',
  '/auth/register',
  '/auth/login',
  '/auth/refresh',
  '/auth/logout',
];

function orderDocumentPaths(document: OpenAPIObject): OpenAPIObject {
  const orderedPaths: OpenAPIObject['paths'] = {};

  for (const path of PATH_ORDER) {
    if (document.paths[path]) {
      orderedPaths[path] = document.paths[path];
    }
  }

  for (const [path, item] of Object.entries(document.paths)) {
    if (!(path in orderedPaths)) {
      orderedPaths[path] = item;
    }
  }

  document.paths = orderedPaths;
  return document;
}

export function setupSwagger(app: INestApplication) {
  const config = getSwaggerConfig();
  const document = orderDocumentPaths(
    SwaggerModule.createDocument(app, config),
  );

  SwaggerModule.setup('/docs', app, document, {
    jsonDocumentUrl: '/swagger.json',
    yamlDocumentUrl: '/swagger.yaml',
    customSiteTitle: 'Playground API',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      tagsSorter: 'alpha',
    },
  });
}
