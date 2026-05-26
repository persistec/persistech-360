import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const port = Number(process.env.PORT ?? 4000);

  app.enableCors({
    origin: process.env.WEB_APP_URL ?? 'http://localhost:3000',
    credentials: true,
  });

  await app.listen(port);
}

bootstrap();
