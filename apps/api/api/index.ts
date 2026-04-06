import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import express from 'express';
import serverless from 'serverless-http';
import { ValidationPipe } from '@nestjs/common';
// Import AppModule from the source directory relative to the new api/ structure
import { AppModule } from '../src/app.module';

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

  // We DO need to keep the `/api` prefix because Vercel automatically passes the root URL starting with `/api` to lambda endpoints inside `api/`
  app.setGlobalPrefix('api');
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
