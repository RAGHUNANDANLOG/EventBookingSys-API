import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // ✅ Setup CORS before listening
  app.enableCors({
    origin: [
      'https://event-booking-sys-react.vercel.app',  // Vercel frontend
      'http://192.168.1.4:3000',                      // Local frontend
    ],
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  await app.listen(4000);  // ✅ Now server will start correctly
}
bootstrap();
