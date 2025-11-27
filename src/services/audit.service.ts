import { prisma } from '@/config/prisma';
import { CreateAuditLogDto } from '@/types/dtos';

export class AuditService {
  static async log(data: CreateAuditLogDto) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId,
          action: data.action,
          entity: data.entity,
          entityId: data.entityId,
          details: data.details ? data.details : undefined,
          ipAddress: data.ipAddress,
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
