import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initConfig } from './config/infisical';
import { initSentry } from './config/sentry';

async function bootstrap() {
  await initConfig();
  initSentry();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
