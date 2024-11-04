import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { appCreate } from './app.create';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  //Add Middleware
  appCreate(app);
  await app.listen(8000);
}
bootstrap();
