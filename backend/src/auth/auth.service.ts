import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { OtpService } from './otp.service';
import { TokenService, TokenPair } from './token.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditActor } from '@prisma/client';

export interface AuthVerifyResult extends TokenPair {
  user: {
    id: string;
    phone: string;
    isProfileComplete: boolean;
    kycStatus: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly otp: OtpService,
    private readonly tokens: TokenService,
    private readonly audit: AuditLogService,
  ) {}

  sendOtp(phone: string) {
    return this.otp.issue(phone);
  }

  async verifyOtp(
    requestId: string,
    phone: string,
    otp: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AuthVerifyResult> {
    await this.otp.verify(requestId, phone, otp);

    const user = await this.prisma.user.upsert({
      where: { phone },
      update: {},
      create: { phone },
    });

    const pair = await this.tokens.issueForUser(user.id);

    await this.audit.log({
      actor: AuditActor.USER,
      actorId: user.id,
      action: 'auth.otp.verified',
      resource: 'User',
      resourceId: user.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      ...pair,
      user: {
        id: user.id,
        phone: user.phone,
        isProfileComplete: user.isProfileComplete,
        kycStatus: user.kycStatus,
      },
    };
  }

  async logout(userId: string) {
    await this.tokens.revokeAllForUser(userId);
    await this.audit.log({
      actor: AuditActor.USER,
      actorId: userId,
      action: 'auth.logout',
      resource: 'User',
      resourceId: userId,
    });
  }
}
