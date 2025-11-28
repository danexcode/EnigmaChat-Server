import { prisma } from '@/config/prisma';
import { CreateAuditLogDto } from '@/types/dtos';

// Se encarga de registrar los logs de auditoría
export class AuditService {
  static async log(data: CreateAuditLogDto) {
    try {
      await prisma.auditLog.create({
        data: {
          userId: data.userId, // Id del usuario que realizó la acción
          action: data.action, // Acción realizada
          entity: data.entity, // Entidad afectada
          entityId: data.entityId, // Id de la entidad afectada
          details: data.details ? data.details : undefined, // Detalles de la acción
          ipAddress: data.ipAddress, // Dirección IP del usuario
        },
      });
    } catch (error) {
      console.error('Failed to create audit log:', error);
    }
  }
}
