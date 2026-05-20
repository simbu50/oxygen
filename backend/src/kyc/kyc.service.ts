import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
  AuditActor,
  KycDocumentStatus,
  KycDocumentType,
  KycStatus,
  Prisma,
} from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { CryptoService } from '../common/crypto.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { KYC_VENDOR } from './vendors/kyc-vendor.token';
import { KycVendor, VendorResult } from './vendors/kyc-vendor.interface';
import { SubmitAadhaarDto, SubmitPanDto } from './dto';

@Injectable()
export class KycService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly crypto: CryptoService,
    private readonly audit: AuditLogService,
    @Inject(KYC_VENDOR) private readonly vendor: KycVendor,
  ) {}

  async submitPan(userId: string, dto: SubmitPanDto) {
    const result = await this.vendor.verifyPan({
      panNumber: dto.panNumber,
      nameAsPerPan: dto.nameAsPerPan,
    });
    return this.upsertDocument(userId, KycDocumentType.PAN, { ...dto }, result);
  }

  async submitAadhaar(userId: string, dto: SubmitAadhaarDto) {
    const result = await this.vendor.verifyAadhaar({
      aadhaarLast4: dto.aadhaarLast4,
      addressLine1: dto.addressLine1,
      city: dto.city,
      pincode: dto.pincode,
    });
    return this.upsertDocument(userId, KycDocumentType.AADHAAR, { ...dto }, result);
  }

  async submitSelfie(userId: string, file: { buffer: Buffer; mimetype: string; size: number } | undefined) {
    if (!file) throw new BadRequestException('selfie file is required');
    if (file.size > 2 * 1024 * 1024) throw new BadRequestException('selfie must be < 2 MB');
    if (!['image/jpeg', 'image/png'].includes(file.mimetype))
      throw new BadRequestException('selfie must be JPEG or PNG');

    const result = await this.vendor.verifySelfie(file.buffer, file.mimetype);

    // In real life: upload buffer to S3 with KMS, store the key.
    const storageKey = `users/${userId}/selfie-${Date.now()}.jpg`;
    return this.upsertDocument(userId, KycDocumentType.SELFIE, { storageKey }, result);
  }

  async getStatus(userId: string) {
    const docs = await this.prisma.kycDocument.findMany({
      where: { userId },
      select: { type: true, status: true },
    });
    const map: Record<string, string> = { PAN: 'PENDING', AADHAAR: 'PENDING', SELFIE: 'PENDING' };
    docs.forEach((d: { type: string; status: string }) => { map[d.type] = d.status; });

    const overall = this.deriveOverall(map);
    return { ...map, overall };
  }

  async approve(adminId: string, userId: string, remarks?: string) {
    return this.reviewAll(adminId, userId, KycDocumentStatus.VERIFIED, KycStatus.VERIFIED, undefined, remarks);
  }

  async reject(adminId: string, userId: string, reason: string, remarks?: string) {
    return this.reviewAll(adminId, userId, KycDocumentStatus.REJECTED, KycStatus.REJECTED, reason, remarks);
  }

  // ---------- internals ----------

  private async upsertDocument(
    userId: string,
    type: KycDocumentType,
    payload: Record<string, unknown>,
    vendorResult: VendorResult,
  ) {
    const status = this.mapVendorStatus(vendorResult.status);
    const encryptedPayload = this.crypto.encryptJSON(payload);

    const doc = await this.prisma.kycDocument.upsert({
      where: { userId_type: { userId, type } },
      update: {
        status,
        encryptedPayload,
        vendorRequestId: vendorResult.vendorRequestId,
        vendorResponse: vendorResult.vendorRaw as Prisma.InputJsonValue,
        rejectionReason: vendorResult.rejectionReason ?? null,
      },
      create: {
        userId,
        type,
        status,
        encryptedPayload,
        vendorRequestId: vendorResult.vendorRequestId,
        vendorResponse: vendorResult.vendorRaw as Prisma.InputJsonValue,
        rejectionReason: vendorResult.rejectionReason ?? null,
      },
    });

    await this.recomputeUserKycStatus(userId);

    await this.audit.log({
      actor: AuditActor.USER,
      actorId: userId,
      action: `kyc.${type.toLowerCase()}.${status.toLowerCase()}`,
      resource: 'KycDocument',
      resourceId: doc.id,
      metadata: { vendorRequestId: vendorResult.vendorRequestId },
    });

    return { type: doc.type, status: doc.status, rejectionReason: doc.rejectionReason };
  }

  private async recomputeUserKycStatus(userId: string) {
    const docs = await this.prisma.kycDocument.findMany({
      where: { userId },
      select: { type: true, status: true },
    });
    const map: Record<string, KycDocumentStatus | undefined> = {};
    docs.forEach((d: { type: string; status: KycDocumentStatus }) => (map[d.type] = d.status));

    const required = [KycDocumentType.PAN, KycDocumentType.AADHAAR, KycDocumentType.SELFIE];
    let next: KycStatus = KycStatus.PARTIAL;
    if (required.every((t) => map[t] === KycDocumentStatus.VERIFIED)) next = KycStatus.VERIFIED;
    else if (required.some((t) => map[t] === KycDocumentStatus.REJECTED)) next = KycStatus.REJECTED;
    else if (required.every((t) => map[t]))
      next = KycStatus.SUBMITTED;
    else if (required.some((t) => map[t])) next = KycStatus.PARTIAL;
    else next = KycStatus.PENDING;

    await this.prisma.user.update({ where: { id: userId }, data: { kycStatus: next } });
  }

  private async reviewAll(
    adminId: string,
    userId: string,
    docStatus: KycDocumentStatus,
    userStatus: KycStatus,
    rejectionReason: string | undefined,
    remarks: string | undefined,
  ) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new NotFoundException('User not found');

    await this.prisma.kycDocument.updateMany({
      where: { userId },
      data: {
        status: docStatus,
        reviewedBy: adminId,
        reviewedAt: new Date(),
        rejectionReason: rejectionReason ?? null,
      },
    });
    await this.prisma.user.update({ where: { id: userId }, data: { kycStatus: userStatus } });

    await this.audit.log({
      actor: AuditActor.ADMIN,
      actorId: adminId,
      action: docStatus === KycDocumentStatus.VERIFIED ? 'kyc.approved' : 'kyc.rejected',
      resource: 'User',
      resourceId: userId,
      metadata: { rejectionReason, remarks },
    });

    return { userId, status: userStatus };
  }

  private mapVendorStatus(s: VendorResult['status']): KycDocumentStatus {
    return s === 'verified'
      ? KycDocumentStatus.VERIFIED
      : s === 'rejected'
        ? KycDocumentStatus.REJECTED
        : KycDocumentStatus.PENDING;
  }

  private deriveOverall(map: Record<string, string>): string {
    const required = ['PAN', 'AADHAAR', 'SELFIE'];
    if (required.every((k) => map[k] === 'VERIFIED')) return 'VERIFIED';
    if (required.some((k) => map[k] === 'REJECTED')) return 'REJECTED';
    if (required.every((k) => map[k] !== 'PENDING')) return 'SUBMITTED';
    if (required.some((k) => map[k] !== 'PENDING')) return 'PARTIAL';
    return 'PENDING';
  }
}
