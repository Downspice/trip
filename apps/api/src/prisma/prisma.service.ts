import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService extends PrismaClient implements OnModuleInit, OnModuleDestroy {
  async onModuleInit() {
    console.info('🔌 [Prisma] Connecting to database...');
    try {
      await this.$connect();
      console.info('✅ [Prisma] Connected to database');
    } catch (error) {
      console.error('❌ [Prisma] Connection failed:', error);
      throw error;
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
