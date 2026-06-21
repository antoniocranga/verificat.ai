import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { initConfig } from './config/infisical';

async function bootstrap() {
  await initConfig();
  const app = await NestFactory.create(AppModule);
  await app.listen(process.env.PORT ?? 3000);
}
void bootstrap();
