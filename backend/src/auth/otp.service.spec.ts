import { Test } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { BadRequestException } from '@nestjs/common';
import { OtpService } from './otp.service';
import { PrismaService } from '../database/prisma.service';
import { CryptoService } from '../common/crypto.service';

describe('OtpService', () => {
  let otp: OtpService;
  let prisma: { otpRequest: { create: jest.Mock; findUnique: jest.Mock; update: jest.Mock } };
  let crypto: { hash: jest.Mock; verifyHash: jest.Mock };

  beforeEach(async () => {
    prisma = {
      otpRequest: {
        create: jest.fn().mockResolvedValue({ id: 'r1', phone: '+919876543210' }),
        findUnique: jest.fn(),
        update: jest.fn().mockResolvedValue({}),
      },
    };
    crypto = {
      hash: jest.fn().mockReturnValue('salt:hash'),
      verifyHash: jest.fn().mockReturnValue(true),
    };
    const config = {
      get: (k: string) =>
        ({
          OTP_TTL_SECONDS: 300,
          OTP_MAX_ATTEMPTS: 3,
          OTP_DEV_FIXED: '123456',
          NODE_ENV: 'test',
        } as Record<string, unknown>)[k],
    };

    const moduleRef = await Test.createTestingModule({
      providers: [
        OtpService,
        { provide: PrismaService, useValue: prisma },
        { provide: CryptoService, useValue: crypto },
        { provide: ConfigService, useValue: config },
      ],
    }).compile();
    otp = moduleRef.get(OtpService);
  });

  it('issues an OTP and returns requestId + ttl', async () => {
    const result = await otp.issue('+919876543210');
    expect(result.requestId).toBe('r1');
    expect(result.expiresInSeconds).toBe(300);
    expect(prisma.otpRequest.create).toHaveBeenCalled();
  });

  it('rejects verification when phone mismatches', async () => {
    prisma.otpRequest.findUnique.mockResolvedValue({
      id: 'r1', phone: '+919999999999', isVerified: false, expiresAt: new Date(Date.now() + 60_000), attempts: 0, otpHash: 'h',
    });
    await expect(otp.verify('r1', '+919876543210', '123456')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('rejects when expired', async () => {
    prisma.otpRequest.findUnique.mockResolvedValue({
      id: 'r1', phone: '+919876543210', isVerified: false, expiresAt: new Date(Date.now() - 1000), attempts: 0, otpHash: 'h',
    });
    await expect(otp.verify('r1', '+919876543210', '123456')).rejects.toBeInstanceOf(BadRequestException);
  });

  it('accepts valid OTP', async () => {
    prisma.otpRequest.findUnique.mockResolvedValue({
      id: 'r1', phone: '+919876543210', isVerified: false, expiresAt: new Date(Date.now() + 60_000), attempts: 0, otpHash: 'h',
    });
    await expect(otp.verify('r1', '+919876543210', '123456')).resolves.toBeUndefined();
    expect(prisma.otpRequest.update).toHaveBeenCalled();
  });
});
