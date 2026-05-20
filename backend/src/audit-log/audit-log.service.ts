import { Injectable, Logger } from '@nestjs/common';
import { AuditActor, Prisma } from '@prisma/client';
import { PrismaService } from '../database/prisma.service';

export interface AuditEvent {
  actor: AuditActor;
  actorId?: string | null;
  action: string;
  resource: string;
  resourceId?: string | null;
  metadata?: Prisma.JsonValue;
  ip?: string | null;
  userAgent?: string | null;
}

@Injectable()
export class AuditLogService {
  private readonly logger = new Logger(AuditLogService.name);

  constructor(private readonly prisma: PrismaService) {}

  async log(event: AuditEvent) {
    try {
      await this.prisma.auditLog.create({
        data: {
          actor: event.actor,
          actorId: event.actorId ?? null,
          action: event.action,
          resource: event.resource,
          resourceId: event.resourceId ?? null,
          metadata: (event.metadata ?? Prisma.DbNull) as Prisma.InputJsonValue,
          ip: event.ip ?? null,
          userAgent: event.userAgent ?? null,
        },
      });
    } catch (e) {
      // Audit logging must never block business flow; we surface to logs instead.
      this.logger.error('Failed to write audit log', e as Error);
    }
  }
}
