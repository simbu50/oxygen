import { BadRequestException, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { randomInt } from 'crypto';
import { PrismaService } from '../database/prisma.service';
import { CryptoService } from '../common/crypto.service';

export interface OtpIssueResult {
  requestId: string;
  expiresInSeconds: number;
}

@Injectable()
export class OtpService {
  private readonly logger = new Logger(OtpService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly config: ConfigService,
    private readonly crypto: CryptoService,
  ) {}

  async issue(phone: string): Promise<OtpIssueResult> {
    const ttl = Number(this.config.get('OTP_TTL_SECONDS') ?? 300);
    const devFixed = this.config.get<string>('OTP_DEV_FIXED');
    const otp = devFixed && this.config.get('NODE_ENV') !== 'production'
      ? devFixed
      : randomInt(100000, 999999).toString();

    const otpHash = this.crypto.hash(otp);
    const req = await this.prisma.otpRequest.create({
      data: {
        phone,
        otpHash,
        expiresAt: new Date(Date.now() + ttl * 1000),
      },
    });

    // In dev we log the OTP; in prod replace with SMS gateway (MSG91, Gupshup, etc.)
    if (this.config.get('NODE_ENV') !== 'production') {
      this.logger.log(`[DEV-OTP] ${phone} -> ${otp} (requestId=${req.id})`);
    } else {
      await this.sendSms(phone, otp);
    }

    return { requestId: req.id, expiresInSeconds: ttl };
  }

  async verify(requestId: string, phone: string, otp: string): Promise<void> {
    const req = await this.prisma.otpRequest.findUnique({ where: { id: requestId } });
    if (!req) throw new BadRequestException('Invalid OTP request');
    if (req.isVerified) throw new BadRequestException('OTP already used');
    if (req.phone !== phone) throw new BadRequestException('Phone mismatch');
    if (req.expiresAt.getTime() < Date.now()) throw new BadRequestException('OTP expired');

    const maxAttempts = Number(this.config.get('OTP_MAX_ATTEMPTS') ?? 3);
    if (req.attempts >= maxAttempts) {
      throw new BadRequestException('Too many attempts. Request a new OTP.');
    }

    const ok = this.crypto.verifyHash(otp, req.otpHash);
    await this.prisma.otpRequest.update({
      where: { id: req.id },
      data: { attempts: { increment: 1 }, isVerified: ok ? true : req.isVerified },
    });

    if (!ok) throw new BadRequestException('Incorrect OTP');
  }

  // Replace with SMS gateway integration in Sprint 2 closeout
  private async sendSms(_phone: string, _otp: string): Promise<void> {
    // TODO: integrate MSG91 / Gupshup
    return;
  }
}
