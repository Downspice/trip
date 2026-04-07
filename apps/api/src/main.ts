import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ExpressAdapter } from '@nestjs/platform-express';
import { AppModule } from './app.module';

import express from 'express';

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
    const app = await NestFactory.create(AppModule, new ExpressAdapter(expressApp));
    
    await setupApp(app);
    await app.init();
    console.info('✅ [Vercel] Nest application initialized');
    
    cachedApp = expressApp;
  }
  return cachedApp;
}

export const handler = async (req: any, res: any) => {
  console.info(`⏳ [Vercel] Handler invoked: ${req.method} ${req.url}`);
  const app = await bootstrap();
  
  // Ensure the internal path is correctly handled regardless of how Vercel routes it
  // If the path comes as /api/schools but Nest is expecting /api/schools with a global prefix 'api', the route must be matched.
  // Express instance(req, res) handles the mapping.
  
  try {
    return app(req, res);
  } catch (error) {
    console.error(`❌ [Vercel] Execution error: ${req.url}`, error);
    throw error;
  }
};

export default handler;

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
