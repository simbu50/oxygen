import { Injectable, NotFoundException } from '@nestjs/common';
import { KycStatus, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';
import { AuditLogService } from '../audit-log/audit-log.service';
import { AuditActor } from '@prisma/client';
import { UpdateProfileDto } from './dto';

@Injectable()
export class UsersService {
  constructor(private readonly prisma: PrismaService, private readonly audit: AuditLogService) {}

  async getMe(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: { kycDocuments: { select: { type: true, status: true } } },
    });
    if (!user) throw new NotFoundException('User not found');
    return this.toPublic(user);
  }

  async updateMe(userId: string, dto: UpdateProfileDto) {
    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName.trim(),
        lastName: dto.lastName.trim(),
        email: dto.email.toLowerCase(),
        dateOfBirth: new Date(dto.dateOfBirth),
        isProfileComplete: true,
      },
      include: { kycDocuments: { select: { type: true, status: true } } },
    });

    await this.audit.log({
      actor: AuditActor.USER,
      actorId: userId,
      action: 'user.profile.updated',
      resource: 'User',
      resourceId: userId,
    });

    return this.toPublic(updated);
  }

  async listForAdmin(opts: { status?: string; page: number; pageSize: number }) {
    const where: Prisma.UserWhereInput = opts.status
      ? { kycStatus: opts.status as KycStatus }
      : {};
    const [total, items] = await this.prisma.$transaction([
      this.prisma.user.count({ where }),
      this.prisma.user.findMany({
        where,
        skip: (opts.page - 1) * opts.pageSize,
        take: opts.pageSize,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true, phone: true, email: true, firstName: true, lastName: true,
          kycStatus: true, isProfileComplete: true, createdAt: true,
        },
      }),
    ]);
    return { total, page: opts.page, pageSize: opts.pageSize, items };
  }

  async getForAdmin(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        kycDocuments: {
          select: {
            id: true, type: true, status: true, rejectionReason: true,
            reviewedBy: true, reviewedAt: true, createdAt: true, updatedAt: true,
          },
        },
      },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  private toPublic(user: {
    id: string;
    phone: string;
    email: string | null;
    firstName: string | null;
    lastName: string | null;
    dateOfBirth: Date | null;
    isProfileComplete: boolean;
    kycStatus: KycStatus;
    kycDocuments: { type: string; status: string }[];
  }) {
    return {
      id: user.id,
      phone: user.phone,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      dateOfBirth: user.dateOfBirth,
      isProfileComplete: user.isProfileComplete,
      kycStatus: user.kycStatus,
      kycSummary: user.kycDocuments,
    };
  }
}
