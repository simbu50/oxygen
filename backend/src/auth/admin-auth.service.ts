import { Injectable, UnauthorizedException } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PrismaService } from '../database/prisma.service';
import { TokenService, TokenPair } from './token.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditActor } from '@prisma/client';

export interface AdminLoginResult extends TokenPair {
  admin: { id: string; email: string; fullName: string; role: string };
}

@Injectable()
export class AdminAuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly tokens: TokenService,
    private readonly audit: AuditLogService,
  ) {}

  async login(
    email: string,
    password: string,
    meta: { ip?: string; userAgent?: string },
  ): Promise<AdminLoginResult> {
    const admin = await this.prisma.admin.findUnique({ where: { email } });
    if (!admin || !admin.isActive) throw new UnauthorizedException('Invalid credentials');

    const ok = await bcrypt.compare(password, admin.passwordHash);
    if (!ok) {
      await this.audit.log({
        actor: AuditActor.SYSTEM,
        action: 'admin.login.failed',
        resource: 'Admin',
        resourceId: admin.id,
        ip: meta.ip,
        userAgent: meta.userAgent,
      });
      throw new UnauthorizedException('Invalid credentials');
    }

    await this.prisma.admin.update({ where: { id: admin.id }, data: { lastLoginAt: new Date() } });
    const pair = await this.tokens.issueForAdmin(admin.id, admin.role);

    await this.audit.log({
      actor: AuditActor.ADMIN,
      actorId: admin.id,
      action: 'admin.login',
      resource: 'Admin',
      resourceId: admin.id,
      ip: meta.ip,
      userAgent: meta.userAgent,
    });

    return {
      ...pair,
      admin: { id: admin.id, email: admin.email, fullName: admin.fullName, role: admin.role },
    };
  }
}
