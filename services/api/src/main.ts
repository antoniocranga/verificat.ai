import './tracing';
import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { AppModule } from './app.module';
import { initConfig } from './config/infisical';
import { initSentry } from './config/sentry';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';

async function bootstrap() {
  await initConfig();
  initSentry();
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  app.enableCors({
    origin: process.env.CORS_ORIGINS?.split(',') ?? [
      'https://staging.verificat.xyz',
      'https://verificat.xyz',
      'http://localhost:3000',
    ],
    credentials: true,
  });

  app.useGlobalFilters(new HttpExceptionFilter());

  const config = new DocumentBuilder()
    .setTitle('verificat.xyz API')
    .setDescription('verificat.xyz fact-checking platform API')
    .setVersion('0.1.0')
    .addBearerAuth()
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  if (process.env.WRITE_OPENAPI_SPEC === 'true') {
    const fs = await import('fs');
    const path = await import('path');
    const outputPath = path.resolve(process.cwd(), 'docs/openapi.yaml');
    const yaml = await import('js-yaml');
    fs.writeFileSync(outputPath, yaml.dump(document), 'utf-8');
    console.log(`OpenAPI spec written to ${outputPath}`);
  }

  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
