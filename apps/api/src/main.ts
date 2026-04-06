import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import serverless from 'serverless-http';
import express from 'express';

let cachedServer: any;

async function setupApp(app: any) {
  app.enableCors({
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
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
  if (!cachedServer) {
    const expressApp = express();
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    await setupApp(app);
    await app.init();
    
    cachedServer = serverless(expressApp);
  }
  return cachedServer;
}

export const handler = async (req: any, res: any) => {
  const server = await bootstrap();
  return server(req, res);
};

// Start local development server natively if not on Vercel
if (!process.env.VERCEL) {
  async function bootstrapLocal() {
    const app = await NestFactory.create(AppModule);
    await setupApp(app);
    
    const port = process.env.PORT || 3001;
    await app.listen(port);
    console.log(`🚀 API running on http://localhost:${port}/api`);
  }
  bootstrapLocal();
}
