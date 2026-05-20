import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { PrismaService } from '../database/prisma.service';
import { CryptoService } from '../common/crypto.service';

export interface JwtPayload {
  sub: string; // user id or admin id
  type: 'user' | 'admin';
  role?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

@Injectable()
export class TokenService {
  constructor(
    private readonly jwt: JwtService,
    private readonly config: ConfigService,
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
  ) {}

  async issueForUser(userId: string): Promise<TokenPair> {
    return this.issuePair({ sub: userId, type: 'user' }, { userId });
  }

  async issueForAdmin(adminId: string, role: string): Promise<TokenPair> {
    return this.issuePair({ sub: adminId, type: 'admin', role }, { adminId });
  }

  private async issuePair(
    payload: JwtPayload,
    refreshOwner: { userId?: string; adminId?: string },
  ): Promise<TokenPair> {
    const accessToken = await this.jwt.signAsync(payload);
    const refreshToken = await this.jwt.signAsync(payload, {
      secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      expiresIn: this.config.get('JWT_REFRESH_TTL') ?? '7d',
    });

    await this.prisma.refreshToken.create({
      data: {
        userId: refreshOwner.userId ?? null,
        adminId: refreshOwner.adminId ?? null,
        tokenHash: this.crypto.hash(refreshToken),
        expiresAt: new Date(Date.now() + this.refreshTtlMs()),
      },
    });

    return { accessToken, refreshToken };
  }

  async rotate(refreshToken: string): Promise<TokenPair> {
    let payload: JwtPayload;
    try {
      payload = await this.jwt.verifyAsync<JwtPayload>(refreshToken, {
        secret: this.config.getOrThrow('JWT_REFRESH_SECRET'),
      });
    } catch {
      throw new UnauthorizedException('Invalid refresh token');
    }

    const stored = await this.prisma.refreshToken.findMany({
      where: {
        OR: [{ userId: payload.type === 'user' ? payload.sub : undefined },
             { adminId: payload.type === 'admin' ? payload.sub : undefined }],
        isRevoked: false,
        expiresAt: { gt: new Date() },
      },
    });
    const match = stored.find((t: { tokenHash: string }) => this.crypto.verifyHash(refreshToken, t.tokenHash));
    if (!match) throw new UnauthorizedException('Refresh token not recognised');

    await this.prisma.refreshToken.update({ where: { id: match.id }, data: { isRevoked: true } });
    return payload.type === 'admin'
      ? this.issueForAdmin(payload.sub, payload.role ?? 'KYC_OFFICER')
      : this.issueForUser(payload.sub);
  }

  async revokeAllForUser(userId: string) {
    await this.prisma.refreshToken.updateMany({ where: { userId }, data: { isRevoked: true } });
  }

  async revokeAllForAdmin(adminId: string) {
    await this.prisma.refreshToken.updateMany({ where: { adminId }, data: { isRevoked: true } });
  }

  private refreshTtlMs(): number {
    const ttl = this.config.get<string>('JWT_REFRESH_TTL') ?? '7d';
    const match = /^(\d+)([smhd])$/.exec(ttl);
    if (!match) return 7 * 24 * 60 * 60 * 1000;
    const n = Number(match[1]);
    const unit = match[2];
    const mult = { s: 1000, m: 60_000, h: 3_600_000, d: 86_400_000 }[unit] ?? 86_400_000;
    return n * mult;
  }
}
