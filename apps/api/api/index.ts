import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from '../src/app.module';

let cachedApp: any;

async function setupApp(app: any) {
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'https://trip-web-indol-nu.vercel.app',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  app.setGlobalPrefix('api');
}

async function bootstrap() {
  if (!cachedApp) {
    console.info('🚀 [Vercel] Bootstrap starting...');
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    await setupApp(app);
    await app.init();
    console.info('✅ [Vercel] Nest application initialized');

    cachedApp = expressApp;
  }
  return cachedApp;
}

export default async function handler(req: any, res: any) {
  console.info(`⏳ [Vercel] Handler invoked: ${req.method} ${req.url}`);
  const app = await bootstrap();
  
  try {
    return app(req, res);
  } catch (error) {
    console.error(`❌ [Vercel] Execution error: ${req.url}`, error);
    throw error;
  }
}
