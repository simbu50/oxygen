import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { configValidator } from './config/env.validation';
import { PrismaModule } from './database/prisma.module';
import { CommonModule } from './common/common.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { KycModule } from './kyc/kyc.module';
import { AuditLogModule } from './audit-log/audit-log.module';
import { HealthController } from './health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validate: configValidator,
    }),
    ThrottlerModule.forRoot([
      { name: 'short', ttl: 1_000, limit: 5 },
      { name: 'medium', ttl: 60_000, limit: 60 },
    ]),
    PrismaModule,
    CommonModule,
    AuditLogModule,
    AuthModule,
    UsersModule,
    KycModule,
  ],
  controllers: [HealthController],
  providers: [{ provide: APP_GUARD, useClass: ThrottlerGuard }],
})
export class AppModule {}
