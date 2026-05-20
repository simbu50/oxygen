import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { AuthController } from './auth.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AuthService } from './auth.service';
import { OtpService } from './otp.service';
import { AdminAuthService } from './admin-auth.service';
import { TokenService } from './token.service';
import { JwtUserStrategy } from './strategies/jwt-user.strategy';
import { JwtAdminStrategy } from './strategies/jwt-admin.strategy';

@Module({
  imports: [
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.getOrThrow<string>('JWT_ACCESS_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_ACCESS_TTL') ?? '15m' },
      }),
    }),
  ],
  controllers: [AuthController, AdminAuthController],
  providers: [
    AuthService,
    AdminAuthService,
    OtpService,
    TokenService,
    JwtUserStrategy,
    JwtAdminStrategy,
  ],
  exports: [TokenService],
})
export class AuthModule {}
