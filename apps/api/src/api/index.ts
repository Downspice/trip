import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from 'src/app.module';

let cachedServer: any;

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

  // ⚠️ remove this unless you really need it
  // app.setGlobalPrefix('api');
}

async function bootstrap() {
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(
      AppModule,
      new ExpressAdapter(expressApp),
    );

    await setupApp(app);
    await app.init();

    cachedServer = serverless(expressApp);
  }
  return cachedServer;
}

export default async function handler(req: any, res: any) {
  const server = await bootstrap();
  return server(req, res);
}